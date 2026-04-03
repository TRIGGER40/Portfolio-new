import { useEffect, useRef } from "react";
import { trackSectionView, trackScrollDepth } from "../lib/analytics";

const SECTIONS = ["impact", "experience", "honors", "mentorship", "thoughts", "testimonials"];

/**
 * Tracks which sections become visible and overall scroll depth.
 * Drop this into the main page component.
 */
export function useSectionTracker() {
  const trackedSections = useRef(new Set<string>());
  const trackedDepths = useRef(new Set<number>());

  useEffect(() => {
    // Section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && !trackedSections.current.has(id)) {
              trackedSections.current.add(id);
              trackSectionView(id);
            }
          }
        }
      },
      { threshold: 0.3 }
    );

    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    // Scroll depth milestones
    const handleScroll = () => {
      const scrollPct = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (scrollPct >= m && !trackedDepths.current.has(m)) {
          trackedDepths.current.add(m);
          trackScrollDepth(m, "/");
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
}
