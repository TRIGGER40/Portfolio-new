import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Ribbon from "@react-spectrum/s2/icons/Ribbon";
import { AWARDS } from "../data/portfolioData";
import type { Award } from "../data/portfolioData";
import { useMediaQuery } from "../hooks/useMediaQuery";
import styles from "./AwardsCarousel.module.css";

const MOBILE_AWARDS_QUERY = "(max-width: 768px)";
const DRAG_CLICK_SUPPRESS_PX = 14;

/** Mobile drag release: velocity from last ~90ms of pointer samples (px/ms, scroll axis). */
const DRAG_VELOCITY_WINDOW_MS = 90;
const DRAG_VELOCITY_MIN_DT_MS = 4;
/** Amplifies swipe energy before coasting (tune for “weight”). */
const AWARDS_MOMENTUM_VELOCITY_MULTIPLIER = 1.28;
/** Per-frame exponential decay; lower = heavier stop. */
const AWARDS_MOMENTUM_FRICTION = 0.966;
const AWARDS_MOMENTUM_STOP_PX_PER_MS = 0.01;
const AWARDS_MOMENTUM_MIN_START_PX_PER_MS = 0.04;
const AWARDS_MOMENTUM_MAX_DT_MS = 48;

function wrapScrollPosition(x: number, max: number): number {
  if (max <= 0) return x;
  return ((x % max) + max) % max;
}

/**
 * Scroll velocity along the strip: finger right → content moves right → scrollX decreases.
 * So v_scroll = -(ΔclientX / Δt) in px/ms.
 */
function velocityFromRecentSamples(
  samples: { t: number; x: number }[],
  releaseTime: number,
  windowMs: number
): number {
  const tMin = releaseTime - windowMs;
  const windowed = samples.filter((s) => s.t >= tMin && s.t <= releaseTime);
  if (windowed.length < 2) return 0;
  const first = windowed[0];
  const last = windowed[windowed.length - 1];
  const dt = last.t - first.t;
  if (dt < DRAG_VELOCITY_MIN_DT_MS) return 0;
  return -(last.x - first.x) / dt;
}

/** Max delay (0.72s) + max per-piece duration (~4.9s) — see ConfettiColumn animDur */
const CONFETTI_UNMOUNT_MS = 6200;

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 34, g: 211, b: 238 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function ConfettiColumn({ seed, tint }: { seed: number; tint: string }) {
  const pieces = useMemo(() => {
    let s = seed * 7919 + 101;
    const rnd = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    const { r: tr, g: tg, b: tb } = hexToRgb(tint);
    return Array.from({ length: 140 }, (_, i) => {
      const lighten = rnd() > 0.32;
      const t = lighten ? 0.42 + rnd() * 0.52 : -0.1 - rnd() * 0.14;
      const r = Math.round(Math.min(255, Math.max(0, tr + t * 100)));
      const g = Math.round(Math.min(255, Math.max(0, tg + t * 100)));
      const b = Math.round(Math.min(255, Math.max(0, tb + t * 100)));
      const angle = rnd() * 360;
      const base = `rgba(${r},${g},${b},0.97)`;
      const gloss = `linear-gradient(148deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 24%, transparent 50%, rgba(0,0,0,0.16) 100%), linear-gradient(${angle}deg, ${base}, rgba(${Math.max(0, r - 35)},${Math.max(0, g - 35)},${Math.max(0, b - 35)},0.92))`;
      const boxShadow = [
        "0 0 0 0.5px rgba(255,255,255,0.45)",
        `0 0 2px rgba(${tr},${tg},${tb},0.5)`,
        `0 0 6px rgba(${tr},${tg},${tb},0.28)`,
        "inset 0 0.5px 0 rgba(255,255,255,0.45)",
      ].join(", ");
      const tx0 = (rnd() - 0.5) * 140;
      const tx2 = (rnd() - 0.5) * 180;
      const animDur = 2.5 + rnd() * 2.4;
      return {
        id: `${seed}-c-${i}`,
        delay: rnd() * 0.72,
        animDur,
        x: rnd() * 100,
        top: -4 - rnd() * 48,
        w: 2.5 + rnd() * 3.5,
        h: 3 + rnd() * 4.5,
        rx0: rnd() * 360,
        ry0: rnd() * 360,
        rz0: rnd() * 360,
        flip: rnd() > 0.48 ? 1 : -1,
        round: rnd() > 0.4,
        gloss,
        boxShadow,
        tx0,
        tx2,
      };
    });
  }, [seed, tint]);

  return (
    <div className={styles.confettiColumn} aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="awards-confetti-piece"
          style={
            {
              left: `${p.x}%`,
              top: `${p.top}%`,
              width: `${p.w}px`,
              height: `${p.h}px`,
              borderRadius: p.round ? "50%" : "1px",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
              "--cf-delay": `${p.delay}s`,
              "--cf-fall-dur": `${p.animDur}s`,
              "--cf-fade-dur": `${p.animDur}s`,
              "--cf-tx0": `${p.tx0}px`,
              "--cf-tx2": `${p.tx2}px`,
              "--cf-rx0": `${p.rx0}deg`,
              "--cf-ry0": `${p.ry0}deg`,
              "--cf-rz0": `${p.rz0}deg`,
              "--cf-flip": String(p.flip),
              background: p.gloss,
              boxShadow: p.boxShadow,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function ConfettiBurst({ burstKey, tint }: { burstKey: number; tint: string }) {
  return (
    <div
      className={styles.confettiPortalRoot}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 2147483647,
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <div className={styles.confettiBurst}>
        <ConfettiColumn seed={burstKey} tint={tint} />
      </div>
    </div>
  );
}

const CARD_TINTS = [
  "#22D3EE", /* electric blue */
  "#8B5CF6", /* violet */
  "#2DD4BF", /* teal */
  "#A78BFA", /* purple */
  "#06B6D4", /* cyan */
  "#EC4899", /* pink */
  "#F59E0B", /* amber */
  "#10B981", /* emerald */
] as const;

function AwardCard({
  award,
  isSelected,
  onClick,
  tintIndex,
  suppressTapRef,
}: {
  award: Award;
  isSelected: boolean;
  onClick: () => void;
  tintIndex: number;
  suppressTapRef?: React.RefObject<boolean>;
}) {
  const tint = CARD_TINTS[tintIndex % CARD_TINTS.length];
  return (
    <motion.button
      type="button"
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
      onClick={() => {
        if (suppressTapRef?.current) return;
        onClick();
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      style={{ "--card-tint": tint } as React.CSSProperties}
    >
      <span
        className={styles.cardIcon}
        style={{ ["--iconPrimary" as string]: tint }}
        aria-hidden
      >
        <Ribbon />
      </span>
      <span className={styles.issuer}>{award.issuer}</span>
      <h3 className={styles.title}>{award.title}</h3>
      <span className={styles.date}>{award.date}</span>
    </motion.button>
  );
}

function AwardRow({
  awards,
  selectedAward,
  onSelect,
  scrollDirection,
  enablePointerDrag,
  vertical,
}: {
  awards: Award[];
  selectedAward: Award | null;
  onSelect: (award: Award | null) => void;
  scrollDirection: number;
  enablePointerDrag?: boolean;
  vertical?: boolean;
}) {
  const [scrollX, setScrollX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const maxScrollRef = useRef(1);
  const scrollXRef = useRef(0);
  const dragSessionRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
  } | null>(null);
  const dragSamplesRef = useRef<{ t: number; x: number }[]>([]);
  const momentumRafRef = useRef<number | null>(null);
  const momentumVelocityRef = useRef(0);
  const suppressTapRef = useRef(false);

  useEffect(() => {
    scrollXRef.current = scrollX;
  }, [scrollX]);

  const stopMomentum = useCallback(() => {
    if (momentumRafRef.current != null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
    momentumVelocityRef.current = 0;
  }, []);

  useEffect(() => {
    return () => stopMomentum();
  }, [stopMomentum]);

  const handleWheel = useCallback((e: WheelEvent) => {
    const el = rowRef.current;
    if (!el || !el.contains(e.target as Node)) return;
    const delta = vertical ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 1) return;
    e.preventDefault();
    e.stopPropagation();
    const max = maxScrollRef.current;
    if (max <= 0) return;
    setScrollX((prev) => {
      let next = prev + delta;
      if (next >= max) next = 0;
      if (next < 0) next = max;
      return next;
    });
  }, [vertical]);

  useEffect(() => {
    document.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => document.removeEventListener("wheel", handleWheel, { capture: true });
  }, [handleWheel]);

  const updateMaxScroll = useCallback(() => {
    const track = trackRef.current;
    const row = rowRef.current;
    const copies = 3;
    if (vertical) {
      const visibleHeight = row?.offsetHeight ?? 600;
      if (track && track.scrollHeight > visibleHeight) {
        maxScrollRef.current = Math.max(1, track.scrollHeight / copies);
      }
    } else {
      const visibleWidth = row?.offsetWidth ?? 900;
      if (track && track.scrollWidth > visibleWidth) {
        maxScrollRef.current = Math.max(1, track.scrollWidth / copies);
      }
    }
  }, [vertical]);

  useEffect(() => {
    updateMaxScroll();
    const ro = new ResizeObserver(updateMaxScroll);
    trackRef.current && ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [updateMaxScroll, awards.length]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setScrollX((prev) => {
        const max = maxScrollRef.current;
        if (max <= 0 || scrollDirection === 0) return prev;
        let next = prev + scrollDirection * 1.5;
        if (next >= max) next = 0;
        if (next < 0) next = max;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollDirection]);

  const startMomentum = useCallback(() => {
    const max = maxScrollRef.current;
    if (max <= 0) return;
    let v = momentumVelocityRef.current * AWARDS_MOMENTUM_VELOCITY_MULTIPLIER;
    if (Math.abs(v) < AWARDS_MOMENTUM_MIN_START_PX_PER_MS) return;

    stopMomentum();
    momentumVelocityRef.current = v;

    let lastT = performance.now();
    const tick = (now: number) => {
      const maxInner = maxScrollRef.current;
      if (maxInner <= 0) {
        stopMomentum();
        return;
      }

      const dtMs = Math.min(Math.max(now - lastT, 0.5), AWARDS_MOMENTUM_MAX_DT_MS);
      lastT = now;

      v = momentumVelocityRef.current;
      if (Math.abs(v) < AWARDS_MOMENTUM_STOP_PX_PER_MS) {
        stopMomentum();
        return;
      }

      const delta = v * dtMs;
      setScrollX((prev) => {
        const next = wrapScrollPosition(prev + delta, maxInner);
        scrollXRef.current = next;
        return next;
      });

      v *= AWARDS_MOMENTUM_FRICTION;
      momentumVelocityRef.current = v;

      if (Math.abs(v) < AWARDS_MOMENTUM_STOP_PX_PER_MS) {
        stopMomentum();
        return;
      }

      momentumRafRef.current = requestAnimationFrame(tick);
    };

    momentumRafRef.current = requestAnimationFrame(tick);
  }, [stopMomentum]);

  const onPointerDownCapture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!enablePointerDrag) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      stopMomentum();
      const t = performance.now();
      const pos = vertical ? e.clientY : e.clientX;
      dragSamplesRef.current = [{ t, x: pos }];
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      dragSessionRef.current = {
        pointerId: e.pointerId,
        startX: pos,
        startScroll: scrollXRef.current,
      };
    },
    [enablePointerDrag, stopMomentum, vertical]
  );

  const onPointerMoveCapture = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = dragSessionRef.current;
      if (!enablePointerDrag || !s || e.pointerId !== s.pointerId) return;
      const max = maxScrollRef.current;
      if (max <= 0) return;
      const t = performance.now();
      const pos = vertical ? e.clientY : e.clientX;
      dragSamplesRef.current.push({ t, x: pos });
      const winStart = t - DRAG_VELOCITY_WINDOW_MS;
      dragSamplesRef.current = dragSamplesRef.current.filter((p) => p.t >= winStart);

      let next = s.startScroll + (s.startX - pos);
      next = wrapScrollPosition(next, max);
      setScrollX(next);
      scrollXRef.current = next;
    },
    [enablePointerDrag, vertical]
  );

  const endPointerDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = dragSessionRef.current;
      if (!s || e.pointerId !== s.pointerId) return;
      const pos = vertical ? e.clientY : e.clientX;
      const moved = Math.abs(pos - s.startX);
      const releaseTime = performance.now();
      dragSamplesRef.current.push({ t: releaseTime, x: pos });
      const winStart = releaseTime - DRAG_VELOCITY_WINDOW_MS;
      dragSamplesRef.current = dragSamplesRef.current.filter((p) => p.t >= winStart);

      const releaseV = velocityFromRecentSamples(dragSamplesRef.current, releaseTime, DRAG_VELOCITY_WINDOW_MS);
      dragSamplesRef.current = [];
      dragSessionRef.current = null;

      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }

      if (moved > DRAG_CLICK_SUPPRESS_PX) {
        suppressTapRef.current = true;
        window.setTimeout(() => {
          suppressTapRef.current = false;
        }, 0);
      }

      if (enablePointerDrag && Math.abs(releaseV) >= AWARDS_MOMENTUM_MIN_START_PX_PER_MS / AWARDS_MOMENTUM_VELOCITY_MULTIPLIER) {
        momentumVelocityRef.current = releaseV;
        startMomentum();
      }
    },
    [enablePointerDrag, startMomentum, vertical]
  );

  const transform = vertical
    ? `translateY(-${scrollX}px)`
    : `translateX(-${scrollX}px)`;

  return (
    <div
      className={`${styles.horizontalRow} ${vertical ? styles.verticalRow : ""}`}
      ref={rowRef}
      onPointerDownCapture={onPointerDownCapture}
      onPointerMoveCapture={onPointerMoveCapture}
      onPointerUpCapture={endPointerDrag}
      onPointerCancelCapture={endPointerDrag}
    >
      <div className={`${styles.horizontalClip} ${vertical ? styles.verticalClip : ""}`}>
        <div
          className={`${styles.horizontalTrack} ${vertical ? styles.verticalTrack : ""}`}
          ref={trackRef}
          style={{ transform }}
        >
          {[...awards, ...awards, ...awards].map((award, i) => (
            <AwardCard
              key={`${award.id}-${i}`}
              award={award}
              isSelected={selectedAward?.id === award.id}
              onClick={() => onSelect(award)}
              tintIndex={i % awards.length}
              suppressTapRef={enablePointerDrag ? suppressTapRef : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const TILT_MAX = 18;
const INFLUENCE_PADDING = 140;
const TILT_SMOOTH = 0.14;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function AwardDetailPanel({
  award,
  tintIndex,
}: {
  award: Award;
  tintIndex: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ rotateX: 0, rotateY: 0 });
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pad = INFLUENCE_PADDING;
      const inZone =
        e.clientX >= rect.left - pad &&
        e.clientX <= rect.right + pad &&
        e.clientY >= rect.top - pad &&
        e.clientY <= rect.bottom + pad;
      if (!inZone) {
        setIsActive(false);
        targetRef.current = { rotateX: 0, rotateY: 0 };
        return;
      }
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const halfW = rect.width / 2 + pad;
      const halfH = rect.height / 2 + pad;
      const x = (e.clientX - cx) / halfW;
      const y = (e.clientY - cy) / halfH;
      const angle = Math.atan2(x, -y);
      const r = Math.min(1, Math.hypot(x, y));
      const amount = r * TILT_MAX;
      setIsActive(true);
      targetRef.current = {
        rotateX: Math.cos(angle) * amount,
        rotateY: Math.sin(angle) * amount,
      };
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const target = targetRef.current;
      setTransform((prev) => {
        const nextX = lerp(prev.rotateX, target.rotateX, TILT_SMOOTH);
        const nextY = lerp(prev.rotateY, target.rotateY, TILT_SMOOTH);
        const done = Math.abs(nextX - target.rotateX) < 0.01 && Math.abs(nextY - target.rotateY) < 0.01;
        if (done && target.rotateX === 0 && target.rotateY === 0) return prev;
        return { rotateX: nextX, rotateY: nextY };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const shineOpacity = isActive && transform.rotateY < 0
    ? Math.min(0.45, Math.abs(transform.rotateY) / TILT_MAX * 0.45)
    : 0;

  const tint = CARD_TINTS[tintIndex % CARD_TINTS.length];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={styles.detailPanelWrap}
      style={{ ["--detail-tint"]: tint } as React.CSSProperties}
    >
      {/* ref on this shell (not .detailPanel) so getBoundingClientRect stays stable while the card tilts */}
      <div ref={cardRef} className={styles.detailPanelGlow}>
        <div
          className={styles.detailPanel}
          style={{
            "--detail-tint": tint,
            transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
          } as React.CSSProperties}
        >
        <div
          className={styles.detailShine}
          style={{ opacity: shineOpacity }}
          aria-hidden
        />
        <div className={styles.detailPanelInner}>
          <div className={styles.detailBanner} aria-hidden>
            <div className={styles.detailBannerTrack}>
              <div className={styles.detailBannerSet}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <span key={i} className={styles.detailBannerItem}>
                    <span className={styles.detailBannerText}>{award.title.toUpperCase()}</span>
                    <span className={styles.detailBannerBullet}> • </span>
                  </span>
                ))}
              </div>
              <div className={styles.detailBannerSet} aria-hidden>
                {[7, 8, 9, 10, 11, 12].map((i) => (
                  <span key={i} className={styles.detailBannerItem}>
                    <span className={styles.detailBannerText}>{award.title.toUpperCase()}</span>
                    <span className={styles.detailBannerBullet}> • </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.detailPanelContent}>
            <span
              className={styles.detailIcon}
              style={{ ["--iconPrimary" as string]: tint }}
              aria-hidden
            >
              <Ribbon />
            </span>
            <span className={styles.detailIssuer}>{award.issuer}</span>
            <h3 className={styles.detailTitle}>{award.title}</h3>
            <span className={styles.detailDate}>{award.date}</span>
            <p className={styles.detailDescription}>{award.description}</p>
          </div>
          <div className={`${styles.detailBanner} ${styles.detailBannerBottom}`} aria-hidden>
            <div className={styles.detailBannerTrack}>
              <div className={styles.detailBannerSet}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <span key={i} className={styles.detailBannerItem}>
                    <span className={styles.detailBannerText}>{award.title.toUpperCase()}</span>
                    <span className={styles.detailBannerBullet}> • </span>
                  </span>
                ))}
              </div>
              <div className={styles.detailBannerSet} aria-hidden>
                {[7, 8, 9, 10, 11, 12].map((i) => (
                  <span key={i} className={styles.detailBannerItem}>
                    <span className={styles.detailBannerText}>{award.title.toUpperCase()}</span>
                    <span className={styles.detailBannerBullet}> • </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AwardsCarousel() {
  const isMobileStrip = useMediaQuery(MOBILE_AWARDS_QUERY);
  const [selectedAward, setSelectedAward] = useState<Award | null>(AWARDS[0] ?? null);
  const [isHovered, setIsHovered] = useState(false);
  const [confettiBurstKey, setConfettiBurstKey] = useState(0);
  const [portalReady, setPortalReady] = useState(false);
  const selectedAwardRef = useRef<Award | null>(selectedAward);
  selectedAwardRef.current = selectedAward;
  const scrollDir = isMobileStrip ? 0 : isHovered ? 0 : 1;

  const selectedTintIndex = selectedAward
    ? Math.max(0, AWARDS.findIndex((a) => a.id === selectedAward.id))
    : 0;
  const detailTint = CARD_TINTS[selectedTintIndex % CARD_TINTS.length];

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const handleSelectAward = useCallback((next: Award | null) => {
    const resolved = next ?? null;
    const prev = selectedAwardRef.current;
    if (resolved !== null && prev !== null && resolved.id !== prev.id) {
      setConfettiBurstKey((k) => k + 1);
    }
    setSelectedAward(resolved);
  }, []);

  useEffect(() => {
    if (confettiBurstKey === 0) return;
    const t = window.setTimeout(() => setConfettiBurstKey(0), CONFETTI_UNMOUNT_MS);
    return () => window.clearTimeout(t);
  }, [confettiBurstKey]);

  return (
    <motion.section
      id="awards"
      className={styles.section}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Honors & Awards</h2>
        <p className={styles.sectionSubtitle}>
          Awarded for work and design community contributions
        </p>
      </div>

      <div className={styles.columnsContainer}>
        <div className={styles.awardMainRow}>
          <AnimatePresence mode="wait">
            {selectedAward && (
              <AwardDetailPanel
                key={selectedAward.id}
                award={selectedAward}
                tintIndex={selectedTintIndex}
              />
            )}
          </AnimatePresence>
        </div>

        {portalReady && confettiBurstKey > 0 && selectedAward
          ? createPortal(
              <ConfettiBurst
                key={confettiBurstKey}
                burstKey={confettiBurstKey}
                tint={detailTint}
              />,
              document.body
            )
          : null}

        <motion.div
          className={`${styles.horizontalWrapper} ${!isMobileStrip ? styles.verticalWrapper : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AwardRow
            awards={AWARDS}
            selectedAward={selectedAward}
            onSelect={handleSelectAward}
            scrollDirection={scrollDir}
            enablePointerDrag={isMobileStrip}
            vertical={!isMobileStrip}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
