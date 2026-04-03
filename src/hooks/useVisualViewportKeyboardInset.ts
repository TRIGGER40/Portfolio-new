import { useEffect } from "react";

/**
 * Exposes how much of the layout viewport is covered below the visible area (typically the
 * software keyboard) as `--keyboard-inset` on the root element, for `position: fixed` bottom UI.
 */
export function useVisualViewportKeyboardInset(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    const vv = window.visualViewport;
    if (!vv) {
      root.style.setProperty("--keyboard-inset", "0px");
      return;
    }

    let prevPx = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    /** Force every scrollable ancestor back to the top — iOS scrolls html/body behind overflow:hidden */
    const resetScroll = () => {
      root.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    const update = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const px = Math.round(inset);
      root.style.setProperty("--keyboard-inset", `${px}px`);
      if (px > 24) {
        root.setAttribute("data-keyboard-open", "");
        if (resetTimer) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
      } else {
        root.removeAttribute("data-keyboard-open");
        /*
         * iOS leaves the layout viewport scrolled after the SW keyboard closes.
         * Reset immediately AND after the dismiss animation settles.
         */
        if (prevPx > 24) {
          resetScroll();
          if (resetTimer) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            resetScroll();
            // Second pass after iOS keyboard dismiss animation fully settles
            resetTimer = setTimeout(() => {
              resetTimer = null;
              resetScroll();
            }, 300);
          }, 400);
        }
      }
      prevPx = px;
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (resetTimer) clearTimeout(resetTimer);
      root.style.removeProperty("--keyboard-inset");
      root.removeAttribute("data-keyboard-open");
    };
  }, [enabled]);
}
