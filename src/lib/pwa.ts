export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
}

export interface ServiceWorkerDiagnostics {
  supported: boolean;
  registered: boolean;
  active: boolean;
  controlling: boolean;
  ready: boolean;
}

export interface PWAEnvironment {
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isChromium: boolean;
  isPreview: boolean;
  isStandalone: boolean;
  supportsServiceWorker: boolean;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let pwaInitialized = false;
let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

const promptListeners = new Set<(event: BeforeInstallPromptEvent | null) => void>();

const isBrowser = typeof window !== "undefined";

const isInsideIframe = () => {
  if (!isBrowser) {
    return false;
  }

  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const setDeferredInstallPrompt = (event: BeforeInstallPromptEvent | null) => {
  deferredInstallPrompt = event;
  promptListeners.forEach((listener) => listener(event));
};

export const getDeferredInstallPrompt = () => deferredInstallPrompt;

export const clearDeferredInstallPrompt = () => {
  setDeferredInstallPrompt(null);
};

export const subscribeToInstallPrompt = (
  listener: (event: BeforeInstallPromptEvent | null) => void,
) => {
  promptListeners.add(listener);
  listener(deferredInstallPrompt);

  return () => {
    promptListeners.delete(listener);
  };
};

export const getPWAEnvironment = (): PWAEnvironment => {
  if (!isBrowser) {
    return {
      isIOS: false,
      isAndroid: false,
      isDesktop: true,
      isChromium: false,
      isPreview: false,
      isStandalone: false,
      supportsServiceWorker: false,
    };
  }

  const userAgent = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(userAgent);
  const isDesktop = !isIOS && !isAndroid;
  const isChromium = /Chrome|Chromium|Edg|OPR|SamsungBrowser/i.test(userAgent) && !/CriOS|FxiOS/i.test(userAgent);
  const isPreviewHost =
    window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com");
  const isPreview = isPreviewHost || isInsideIframe();
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return {
    isIOS,
    isAndroid,
    isDesktop,
    isChromium,
    isPreview,
    isStandalone,
    supportsServiceWorker: "serviceWorker" in navigator,
  };
};

const unregisterServiceWorkers = async () => {
  if (!isBrowser || !("serviceWorker" in navigator)) {
    return null;
  }

  const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
  await Promise.all(registrations.map((registration) => registration.unregister().catch(() => false)));
  return null;
};

export const registerPWAServiceWorker = async () => {
  if (!isBrowser || !("serviceWorker" in navigator)) {
    return null;
  }

  const environment = getPWAEnvironment();

  if (!import.meta.env.PROD || environment.isPreview) {
    return unregisterServiceWorkers();
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(async (registration) => {
        await navigator.serviceWorker.ready.catch(() => undefined);
        return registration;
      })
      .catch((error) => {
        console.error("PWA service worker registration failed", error);
        return null;
      });
  }

  return registrationPromise;
};

export const getServiceWorkerDiagnostics = async (): Promise<ServiceWorkerDiagnostics> => {
  if (!isBrowser || !("serviceWorker" in navigator)) {
    return {
      supported: false,
      registered: false,
      active: false,
      controlling: false,
      ready: false,
    };
  }

  try {
    const registration =
      (await navigator.serviceWorker.getRegistration("/sw.js")) ??
      (await navigator.serviceWorker.getRegistration());

    let ready = false;

    if (registration) {
      await navigator.serviceWorker.ready
        .then(() => {
          ready = true;
        })
        .catch(() => undefined);
    }

    return {
      supported: true,
      registered: Boolean(registration),
      active: Boolean(registration?.active),
      controlling: Boolean(navigator.serviceWorker.controller),
      ready,
    };
  } catch {
    return {
      supported: true,
      registered: false,
      active: false,
      controlling: Boolean(navigator.serviceWorker.controller),
      ready: false,
    };
  }
};

export const initializePWA = () => {
  if (!isBrowser || pwaInitialized) {
    return;
  }

  pwaInitialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
  });

  window.addEventListener("appinstalled", () => {
    setDeferredInstallPrompt(null);
  });

  void registerPWAServiceWorker();
};