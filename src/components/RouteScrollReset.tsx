import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Reset page scroll on navigation, leaving nested controls and chat history alone. */
export function RouteScrollReset() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document
      .querySelectorAll<HTMLElement>("[data-route-scroll-container]")
      .forEach((container) => {
        container.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
  }, [pathname]);

  return null;
}
