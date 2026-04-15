import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  getPWAEnvironment,
  getServiceWorkerDiagnostics,
  subscribeToInstallPrompt,
  type BeforeInstallPromptEvent,
  type ServiceWorkerDiagnostics,
} from "@/lib/pwa";

type InstallFallback = {
  title: string;
  description: string;
  hint?: string;
};

const defaultDiagnostics: ServiceWorkerDiagnostics = {
  supported: false,
  registered: false,
  active: false,
  controlling: false,
  ready: false,
};

const buildDesktopFallback = ({
  isPreview,
  isChromium,
  isInstalled,
  serviceWorkerReady,
}: {
  isPreview: boolean;
  isChromium: boolean;
  isInstalled: boolean;
  serviceWorkerReady: boolean;
}): InstallFallback => {
  if (isInstalled) {
    return {
      title: "O app já está instalado neste computador",
      description: "Você já pode abrir o Ecossistema como aplicativo pelo atalho do sistema.",
    };
  }

  if (isPreview) {
    return {
      title: "O prompt não aparece dentro do preview do editor",
      description:
        "No desktop, a instalação real do PWA só pode ser acionada fora do preview, na versão publicada em HTTPS.",
      hint: "Abra a versão publicada no Google Chrome ou Microsoft Edge para testar este botão com o prompt nativo.",
    };
  }

  if (!isChromium) {
    return {
      title: "Use Chrome ou Edge para instalar no computador",
      description:
        "No desktop, Safari e Firefox não expõem este prompt nativo de instalação para este app.",
      hint: "Abra a versão publicada no Chrome ou Edge atualizados para receber o botão de instalação real.",
    };
  }

  if (!serviceWorkerReady) {
    return {
      title: "O navegador ainda não liberou a instalação nesta sessão",
      description:
        "O manifesto está presente, mas o navegador ainda está concluindo o reconhecimento do app como instalável.",
      hint: "Recarregue a versão publicada uma vez, aguarde alguns segundos e tente novamente neste botão.",
    };
  }

  return {
    title: "O prompt nativo ainda não foi exposto pelo navegador",
    description:
      "O app já está configurado para instalação, mas o Chrome/Edge ainda não mostrou o prompt nesta aba.",
    hint: "Se a instalação foi recusada antes, o navegador pode esconder o prompt temporariamente.",
  };
};

const buildAndroidFallback = ({
  isPreview,
  serviceWorkerReady,
}: {
  isPreview: boolean;
  serviceWorkerReady: boolean;
}): InstallFallback => {
  if (isPreview) {
    return {
      title: "No preview o prompt não é confiável",
      description:
        "Para instalar no Android com o fluxo real, abra a versão publicada do Ecossistema no Chrome.",
      hint: "Na versão publicada, o prompt pode abrir sozinho ou pelo menu do Chrome.",
    };
  }

  if (!serviceWorkerReady) {
    return {
      title: "A instalação ainda está sendo preparada",
      description:
        "O navegador ainda não confirmou o app como instalável nesta sessão do Android.",
      hint: "Recarregue a página publicada e tente novamente; se o prompt não abrir, use o menu do Chrome.",
    };
  }

  return {
    title: "Se o prompt não abrir, use o menu do Chrome",
    description:
      "No Android, alguns navegadores liberam a instalação pelo próprio menu com 'Instalar app' ou 'Adicionar à tela inicial'.",
  };
};

export function useInstallPWA() {
  const environment = useMemo(() => getPWAEnvironment(), []);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => getDeferredInstallPrompt());
  const [isInstalled, setIsInstalled] = useState(environment.isStandalone);
  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerDiagnostics>(defaultDiagnostics);

  useEffect(() => {
    const refreshServiceWorker = async () => {
      const diagnostics = await getServiceWorkerDiagnostics();
      setServiceWorker(diagnostics);
    };

    const unsubscribe = subscribeToInstallPrompt(setDeferredPrompt);

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      clearDeferredInstallPrompt();
    };

    window.addEventListener("appinstalled", handleInstalled);

    if (environment.isStandalone) {
      setIsInstalled(true);
    }

    void refreshServiceWorker();

    const refreshOnControllerChange = () => {
      void refreshServiceWorker();
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(refreshServiceWorker).catch(() => undefined);
      navigator.serviceWorker.addEventListener("controllerchange", refreshOnControllerChange);
    }

    const delayedRefresh = window.setTimeout(() => {
      void refreshServiceWorker();
    }, 1500);

    return () => {
      unsubscribe();
      window.removeEventListener("appinstalled", handleInstalled);
      window.clearTimeout(delayedRefresh);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", refreshOnControllerChange);
      }
    };
  }, [environment.isStandalone]);

  const canInstall = Boolean(deferredPrompt);
  const serviceWorkerReady = serviceWorker.active || serviceWorker.ready || serviceWorker.controlling;

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    clearDeferredInstallPrompt();
    setDeferredPrompt(null);

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    return outcome === "accepted";
  }, [deferredPrompt]);

  const desktopFallback = useMemo(
    () =>
      buildDesktopFallback({
        isPreview: environment.isPreview,
        isChromium: environment.isChromium,
        isInstalled,
        serviceWorkerReady,
      }),
    [environment.isChromium, environment.isPreview, isInstalled, serviceWorkerReady],
  );

  const androidFallback = useMemo(
    () =>
      buildAndroidFallback({
        isPreview: environment.isPreview,
        serviceWorkerReady,
      }),
    [environment.isPreview, serviceWorkerReady],
  );

  return {
    canInstall,
    isInstalled,
    isIOS: environment.isIOS,
    isAndroid: environment.isAndroid,
    isDesktop: environment.isDesktop,
    install,
    serviceWorker,
    desktopFallback,
    androidFallback,
  };
}
