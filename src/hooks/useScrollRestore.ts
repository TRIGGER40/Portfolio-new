import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const SCROLL_KEY_PREFIX = "scrollY:";

/** Save the current scroll position for the given path. */
export function saveScrollPosition(path: string = window.location.pathname) {
  sessionStorage.setItem(SCROLL_KEY_PREFIX + path, String(window.scrollY));
}

/**
 * Unified scroll manager:
 * - PUSH / REPLACE (forward navigation) → scroll to top instantly
 * - POP (back / forward button)         → restore saved scroll position
 */
export function useScrollRestore() {
  const { pathname } = useLocation();
  const navType = useNavigationType();

  useLayoutEffect(() => {
    if (navType === "POP") {
      // Back / forward navigation — restore saved position
      const saved = sessionStorage.getItem(SCROLL_KEY_PREFIX + pathname);
      if (!saved) return;

      const target = parseInt(saved, 10);
      sessionStorage.removeItem(SCROLL_KEY_PREFIX + pathname);
      if (target <= 0) return;

      // Retry with increasing delays to handle progressive rendering
      const delays = [0, 50, 100, 200, 350, 500, 750, 1000];
      const timers: number[] = [];

      for (const delay of delays) {
        timers.push(
          window.setTimeout(() => {
            window.scrollTo({ top: target, left: 0, behavior: "auto" });
          }, delay)
        );
      }

      return () => timers.forEach(clearTimeout);
    } else {
      // Forward navigation (PUSH or REPLACE) — always start from top
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, navType]);
}

/** Save scroll position on every navigation away (attach once at router level). */
export function useScrollSaver() {
  const { pathname } = useLocation();

  useEffect(() => {
    const handleBeforeUnload = () => saveScrollPosition(pathname);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      // When pathname changes (navigating away), save the current scroll
      saveScrollPosition(pathname);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);
}
