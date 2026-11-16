import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Fit only the Soph presentation to the visible screen, including the keyboard. */
export function SophViewport({ children }: { children: ReactNode }) {
  const pageRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const layout = pageRef.current?.closest<HTMLElement>("[data-app-layout]");
    if (!layout) return;
    layout.setAttribute("data-soph-layout", "");
    const viewport = window.visualViewport;
    const navigation = document.querySelector<HTMLElement>(
      ".premium-mobile-nav",
    );
    let frame = 0;

    const update = () => {
      const messages = pageRef.current?.querySelector<HTMLElement>(
        ".soph-messages",
      );
      const followLatest = messages
        ? messages.scrollHeight - messages.clientHeight - messages.scrollTop <
          32
        : false;
      const height = viewport?.height ?? window.innerHeight;
      const top = viewport?.offsetTop ?? 0;
      const bottom = top + height;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const rect = navigation?.getBoundingClientRect();
      const navSpace =
        mobile && rect
          ? Math.max(0, Math.min(bottom, rect.bottom) - Math.max(top, rect.top))
          : 0;
      layout.style.setProperty("--soph-viewport-height", `${height}px`);
      layout.style.setProperty("--soph-viewport-top", `${top}px`);
      layout.style.setProperty("--soph-nav-space", `${navSpace}px`);
      layout.toggleAttribute("data-soph-compact", height < 500);
      if (messages && followLatest) messages.scrollTop = messages.scrollHeight;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : null;
    if (navigation) observer?.observe(navigation);
    update();
    window.addEventListener("resize", schedule);
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      [
        "--soph-viewport-height",
        "--soph-viewport-top",
        "--soph-nav-space",
      ].forEach((name) => layout.style.removeProperty(name));
      layout.removeAttribute("data-soph-compact");
      layout.removeAttribute("data-soph-layout");
    };
  }, []);

  return (
    <section className="soph-page" aria-labelledby="soph-title" ref={pageRef}>
      {children}
    </section>
  );
}
