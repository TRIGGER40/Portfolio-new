import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CASE_STUDIES } from "../data/portfolioData";
import type { CaseStudy } from "../data/portfolioData";
import { FEATURED_PROJECT_IDS } from "../data/projectContext";
import { resolveThumbnail } from "../lib/utils";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { ShimmerImg } from "./ShimmerImg";
import styles from "./HeroProjectSphere.module.css";

const SPHERE_RADIUS = 165;
const WRAPPER_SIZE = 400;
const CURSOR_INFLUENCE_RADIUS = 130;
const CURSOR_PULL_STRENGTH = 28;
const CURSOR_SMOOTHING = 0.14;

const FILTER_OPTIONS = [
  { value: "all", label: "All projects" },
  { value: "featured", label: "Featured" },
  { value: "Adobe", label: "Adobe" },
  { value: "Bizongo", label: "Bizongo" },
] as const;
const GOLDEN_ANGLE = Math.PI * (1 + Math.sqrt(5));
const ROTATION_PERIOD = 40; // seconds for full rotation (idle spin)
const ROTATION_SPEED = (2 * Math.PI) / ROTATION_PERIOD / 60; // per frame at 60fps
const BREATH_PERIOD = 5; // seconds for full breath cycle
const BREATH_SPEED = (2 * Math.PI) / BREATH_PERIOD / 60; // per frame at 60fps
const TILT_X = (12 * Math.PI) / 180;
/** Shift label pills slightly above the node circles (SVG coords: smaller y = higher on screen) */
const LABEL_PILL_OFFSET_ABOVE_NODE_PX = 12;
/** Anchor centers inset so pills (translate -50%, max-width) stay inside the sphere wrapper */
const LABEL_ANCHOR_X_MIN_PCT = 22;
const LABEL_ANCHOR_X_MAX_PCT = 78;
const LABEL_ANCHOR_Y_MIN_PCT = 18;
const LABEL_ANCHOR_Y_MAX_PCT = 82;
/** Subtle default look for connection lines, node dots, and label pills (non-hover). */
const MARKER_LINE_OPACITY_DIM = 0.06;
const MARKER_LINE_OPACITY_HIGHLIGHT = 0.38;
const MARKER_NODE_OPACITY_DIM = 0.06;
const MARKER_PILL_NON_HOVER_OPACITY_SCALE = 0.66;
/** Hover cards portaled + centered under pill on small viewports */
const MOBILE_HOVER_CARD_QUERY = "(max-width: 768px)";
const MOBILE_CARD_GAP_PX = 10;
const TWO_PI = Math.PI * 2;
/**
 * Base radians per pixel at ~reference swipe speed. Positive so swipe/scale matches idle sphere spin (+ROTATION_SPEED):
 * finger right increases rotationAngle → same sense as auto-rotation on both the sphere and degree strip.
 */
const MOBILE_ROTATOR_DRAG_SENS = 0.006;
/** px/ms — speed at which the velocity multiplier reaches its ceiling (then clamped). */
const ROTATOR_SWIPE_SPEED_REF = 0.18;
/** Effective sens scales between these when swipe is slow vs fast (same dx moves more degrees when faster). */
const ROTATOR_SWIPE_MULT_MIN = 0.35;
const ROTATOR_SWIPE_MULT_MAX = 2.15;
/** EMA weight for release velocity (rad/ms) when finger lifts — higher = snappier follow of last motion */
const ROTATOR_INERTIA_VEL_EMA = 0.38;
/** Below this |rad/ms| after release, skip coasting */
const ROTATOR_INERTIA_MIN_RELEASE_RAD_PER_MS = 0.000038;
/** Per-frame velocity multiplier while coasting (lower = shorter glide) */
const ROTATOR_INERTIA_FRICTION = 0.966;
const ROTATOR_INERTIA_MIN_SPEED_RAD_PER_FRAME = 0.000022;
const ROTATOR_INERTIA_MAX_RAD_PER_FRAME = 0.14;
/** ~60fps assumption: rad/ms → rad/frame */
const ROTATOR_MS_PER_FRAME = 1000 / 60;
/**
 * Idle angular velocity (rad/frame at ~60fps) eases toward ROTATION_SPEED with exponential blend.
 * Per-frame smoothing factor; actual step uses dt so it stays smooth at variable frame rates.
 */
const IDLE_SPIN_VEL_BLEND = 0.026;
/** When coast ends with motion opposite default spin (w < 0), ease w → 0 first; then IDLE_SPIN_VEL_BLEND ramps to ROTATION_SPEED */
const IDLE_SPIN_OPPOSED_DECEL = 0.022;
/** Snap w to 0 when this close after decel (rad/frame) */
const IDLE_SPIN_ZERO_SNAP_EPS = Math.max(ROTATION_SPEED * 0.0004, 1e-9);
/** Snap to exact ROTATION_SPEED when within this difference (rad/frame) */
const IDLE_SPIN_VEL_SNAP_EPS = ROTATION_SPEED * 0.0015;
/** Wheel / trackpad δ scaled from drag sensitivity (same turn sense as drag). */
const MOBILE_ROTATOR_WHEEL_SENS = MOBILE_ROTATOR_DRAG_SENS * 0.015;
/** One horizontal cycle in SVG user units = 360° around scale (1 unit = 1°); viewport shows only subset */
const ROTATOR_CYCLE_PX = 360;
/** How many degrees of the scale are visible in the track at once */
const ROTATOR_VISIBLE_DEG = 40;
/**
 * Maps rotationAngle → strip pan (deg). CSS rotateY + perspective makes the globe’s apparent spin the
 * opposite of a naive linear scale; flip so tick drift matches the sphere driven by the same angle.
 * Set to +1 if a platform ever looks inverted.
 */
const ROTATOR_STRIP_ANGLE_SIGN = -1;
const ROTATOR_TRACK_VB_H = 48;
/** Two tiled 0–360° blocks so a 40° window can cross the wrap (e.g. 350°–30°) */
const ROTATOR_SVG_CYCLES = 2;
/** One full turn = 360 discrete marker steps (haptically / tick index wrap) */
const ROTATOR_HAPTIC_TICKS_PER_TURN = 360;
const ROTATOR_DEG_STEP_RAD = TWO_PI / 360;
const ROTATOR_HAPTIC_PULSE_MS = 12;
const ROTATOR_HAPTIC_MIN_GAP_MS = 38;
/** Connection polylines per edge — full on desktop, fewer on mobile for GPU/CPU. */
const CONNECTION_SEGMENTS_DESKTOP = 24;
const CONNECTION_SEGMENTS_MOBILE = 6;

function canUseNavigatorVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

let rotatorAudioCtx: AudioContext | null = null;

function getRotatorAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (rotatorAudioCtx) return rotatorAudioCtx;
  const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AC = window.AudioContext ?? w.webkitAudioContext;
  if (!AC) return null;
  try {
    rotatorAudioCtx = new AC();
    return rotatorAudioCtx;
  } catch {
    return null;
  }
}

/** Needed on iOS: AudioContext starts suspended until a user gesture */
async function resumeRotatorAudioContext(): Promise<void> {
  const ctx = getRotatorAudioContext();
  if (!ctx || ctx.state !== "suspended") return;
  try {
    await ctx.resume();
  } catch {
    /* ignore */
  }
}

function scheduleRotatorTickAt(ctx: AudioContext, startT: number, strength: number): void {
  try {
    const peak = Math.min(0.055 * strength, 0.095);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2400, startT);
    osc.frequency.exponentialRampToValueAtTime(1450, startT + 0.007);
    gain.gain.setValueAtTime(0.001, startT);
    gain.gain.exponentialRampToValueAtTime(peak, startT + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.014);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startT);
    osc.stop(startT + 0.018);
  } catch {
    /* context may be closed */
  }
}

function playRotatorTickSound(strength = 1): void {
  const ctx = getRotatorAudioContext();
  if (!ctx) return;
  scheduleRotatorTickAt(ctx, ctx.currentTime, strength);
}

function wrapRadians(a: number): number {
  let x = a % TWO_PI;
  if (x < 0) x += TWO_PI;
  return x;
}

/** Snap sphere rotation to integer degree markers (1° grid). */
function snapRotationToMarker(rad: number): number {
  return wrapRadians(Math.round(rad / ROTATOR_DEG_STEP_RAD) * ROTATOR_DEG_STEP_RAD);
}

function rotatorHapticTickIndex(rad: number): number {
  const deg = Math.round((rad / TWO_PI) * 360);
  return ((deg % ROTATOR_HAPTIC_TICKS_PER_TURN) + ROTATOR_HAPTIC_TICKS_PER_TURN) %
    ROTATOR_HAPTIC_TICKS_PER_TURN;
}

/** |dx|/dt in px/ms → multiplier for MOBILE_ROTATOR_DRAG_SENS (fast = more progress per px). */
function rotatorSwipeSpeedMultiplier(speedPxPerMs: number): number {
  if (!Number.isFinite(speedPxPerMs) || speedPxPerMs <= 0) return ROTATOR_SWIPE_MULT_MIN;
  const t = Math.min(1, speedPxPerMs / ROTATOR_SWIPE_SPEED_REF);
  return ROTATOR_SWIPE_MULT_MIN + t * (ROTATOR_SWIPE_MULT_MAX - ROTATOR_SWIPE_MULT_MIN);
}

/** Degrees at strip center (needle) for pan + aria — signed so motion matches sphere spin. */
function rotatorStripCenterDeg(rad: number): number {
  return ROTATOR_STRIP_ANGLE_SIGN * (rad / TWO_PI) * 360;
}

/** Pre-built SVG ticks: 360° per cycle, longer line every 10°; tiled for seamless scroll */
const ROTATOR_DEGREE_LINES = (() => {
  const H = ROTATOR_TRACK_VB_H;
  const y2 = H - 0.5;
  const yMinor = H - 15;
  const yMajor = H - 28;
  const strokeMinor = "rgba(255, 255, 255, 0.18)";
  const strokeMajor = "rgba(255, 255, 255, 0.28)";
  const nodes: JSX.Element[] = [];
  for (let cycle = 0; cycle < ROTATOR_SVG_CYCLES; cycle++) {
    const ox = cycle * ROTATOR_CYCLE_PX;
    for (let d = 0; d < 360; d++) {
      const major = d % 10 === 0;
      const x = ox + d + 0.5;
      nodes.push(
        <line
          key={`rotator-deg-${cycle}-${d}`}
          x1={x}
          x2={x}
          y1={major ? yMajor : yMinor}
          y2={y2}
          stroke={major ? strokeMajor : strokeMinor}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      );
    }
  }
  return nodes;
})();

// Rotate point by angle around Y axis
function rotateY(p: { x: number; y: number; z: number }, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: p.x * c - p.z * s,
    y: p.y,
    z: p.x * s + p.z * c,
  };
}

// Rotate point by angle around X axis
function rotateX(p: { x: number; y: number; z: number }, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: p.x,
    y: p.y * c - p.z * s,
    z: p.y * s + p.z * c,
  };
}

// Fibonacci sphere distribution for even node spacing
function getSpherePositions(n: number): { x: number; y: number; z: number }[] {
  const positions: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < n; i++) {
    const theta = GOLDEN_ANGLE * i;
    const y = 1 - (2 * i + 1) / n;
    const r = Math.sqrt(1 - y * y);
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    positions.push({
      x: x * SPHERE_RADIUS,
      y: y * SPHERE_RADIUS,
      z: z * SPHERE_RADIUS,
    });
  }
  return positions;
}

// Connect every node to every other node (full mesh)
function getConnections(
  positions: { x: number; y: number; z: number }[]
): [number, number][] {
  const conns: [number, number][] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      conns.push([i, j]);
    }
  }
  return conns;
}

export function HeroProjectSphere() {
  const allStudies = CASE_STUDIES.filter((c) => c.link);
  const [filter, setFilter] = useState<string>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobileHoverCardTop, setMobileHoverCardTop] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const mobileLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobileHoverCard = useMediaQuery(MOBILE_HOVER_CARD_QUERY);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [cursorViewBox, setCursorViewBox] = useState<{ x: number; y: number } | null>(null);
  const smoothedCursor = useRef<{ x: number; y: number } | null>(null);
  const rawCursorRef = useRef<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mobileRotatorDraggingRef = useRef(false);
  /** True while the rotator has focus (programmatic or keyboard) — auto-spin off until blur */
  const mobileRotatorFocusPausedRef = useRef(false);
  const sphereRotatorRef = useRef<HTMLDivElement | null>(null);
  const lastRotatorClientXRef = useRef(0);
  /** DOM High Res Time Stamp from last rotator pointer event (velocity for swipe scaling). */
  const lastRotatorEventTimeRef = useRef(0);
  const lastRotatorHapticAtRef = useRef(0);
  /** Keeps high-frequency rotation in sync for batched rotator + throttled spin without stale setups() */
  const rotationAngleRef = useRef(0);
  const rotatorFlushRafRef = useRef<number | null>(null);
  /** Smoothed release angular velocity (rad/ms) for inertial coast */
  const rotatorVelEmaRadPerMsRef = useRef(0);
  const rotatorInertiaActiveRef = useRef(false);
  const rotatorInertiaVelRadPerFrameRef = useRef(0);
  /** Last inertial |v| above stop threshold — used to seed idle when coast ends */
  const rotatorInertiaLastSignificantVRef = useRef(0);
  /** Current idle rad/frame; after coast starts at last coast v, eases to ROTATION_SPEED */
  const idleSpinVelRef = useRef(ROTATION_SPEED);
  /** RAF time for frame-rate–independent idle blend */
  const idleSpinLastRafMsRef = useRef(0);
  /** Skip one idle Δθ the frame coast ends (snap already settled pose; avoids duplicate big step). */
  const idleSpinSkipApplyOnceRef = useRef(false);
  const pausedRef = useRef(false);
  const hoveredIdRef = useRef<string | null>(null);

  pausedRef.current = paused;
  hoveredIdRef.current = hoveredId;

  useEffect(() => {
    rotationAngleRef.current = rotationAngle;
  }, [rotationAngle]);

  const pulseRotatorHaptic = () => {
    const now = performance.now();
    if (now - lastRotatorHapticAtRef.current < ROTATOR_HAPTIC_MIN_GAP_MS) return;
    lastRotatorHapticAtRef.current = now;
    if (canUseNavigatorVibrate()) {
      try {
        navigator.vibrate(ROTATOR_HAPTIC_PULSE_MS);
        return;
      } catch {
        /* fall through to Web Audio */
      }
    }
    playRotatorTickSound(1);
  };

  /** Fast drags can cross several ticks in one frame — vibrate pattern or stacked audio ticks */
  const pulseRotatorHapticTicksCrossed = (fromRad: number, toRad: number) => {
    const ta = rotatorHapticTickIndex(fromRad);
    const tb = rotatorHapticTickIndex(toRad);
    if (ta === tb) return;
    let d = tb - ta;
    const h = ROTATOR_HAPTIC_TICKS_PER_TURN;
    if (d > h / 2) d -= h;
    if (d < -h / 2) d += h;
    const count = Math.min(Math.abs(d), isMobileHoverCard ? 3 : 8);
    if (count < 1) return;

    if (canUseNavigatorVibrate()) {
      try {
        const pattern: number[] = [];
        for (let i = 0; i < count; i++) {
          if (i > 0) pattern.push(16);
          pattern.push(ROTATOR_HAPTIC_PULSE_MS);
        }
        lastRotatorHapticAtRef.current = performance.now();
        navigator.vibrate(pattern);
        return;
      } catch {
        /* Web Audio fallback */
      }
    }

    const ctx = getRotatorAudioContext();
    if (!ctx) return;
    const now = performance.now();
    if (now - lastRotatorHapticAtRef.current < ROTATOR_HAPTIC_MIN_GAP_MS) return;
    lastRotatorHapticAtRef.current = now;
    const t0 = ctx.currentTime;
    const nAudio = Math.min(count, isMobileHoverCard ? 2 : 4);
    for (let i = 0; i < nAudio; i++) {
      scheduleRotatorTickAt(ctx, t0 + i * 0.019, 0.82 + i * 0.06);
    }
  };

  const pulseRotatorHapticTicksCrossedRef = useRef(pulseRotatorHapticTicksCrossed);
  pulseRotatorHapticTicksCrossedRef.current = pulseRotatorHapticTicksCrossed;

  /** Latest flush impl — assigned each render so wheel/pointer always use current haptics closure. */
  const flushRotatorRef = useRef<() => void>(() => {});
  flushRotatorRef.current = () => {
    const next = snapRotationToMarker(rotationAngleRef.current);
    setRotationAngle((prev) => {
      if (next === prev) return prev;
      pulseRotatorHapticTicksCrossed(prev, next);
      rotationAngleRef.current = next;
      return next;
    });
  };

  const scheduleRotatorFlush = () => {
    if (rotatorFlushRafRef.current != null) return;
    rotatorFlushRafRef.current = requestAnimationFrame(() => {
      rotatorFlushRafRef.current = null;
      flushRotatorRef.current();
    });
  };

  const studies =
    filter === "all"
      ? allStudies
      : filter === "featured"
        ? allStudies.filter((c) => FEATURED_PROJECT_IDS.has(c.id))
        : allStudies.filter((c) => c.company === filter);

  useEffect(() => {
    setHoveredId(null);
    setMobileHoverCardTop(null);
    setPaused(false);
    rotatorInertiaActiveRef.current = false;
    rotatorInertiaVelRadPerFrameRef.current = 0;
    rotatorInertiaLastSignificantVRef.current = 0;
    idleSpinVelRef.current = ROTATION_SPEED;
    idleSpinLastRafMsRef.current = 0;
    idleSpinSkipApplyOnceRef.current = false;
  }, [filter]);

  useEffect(() => {
    return () => {
      if (mobileLeaveTimerRef.current) clearTimeout(mobileLeaveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rotatorFlushRafRef.current != null) {
        cancelAnimationFrame(rotatorFlushRafRef.current);
        rotatorFlushRafRef.current = null;
      }
    };
  }, []);

  /** Mobile: dismiss project card on tap outside pill + panel (not on pointerleave — too flaky on touch). */
  useEffect(() => {
    if (!isMobileHoverCard || !hoveredId) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (t.closest("[data-sphere-pill]") || t.closest("[data-sphere-mobile-card]")) return;
      setHoveredId(null);
      setMobileHoverCardTop(null);
      setPaused(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [isMobileHoverCard, hoveredId]);

  /** Keep fixed card under pill when layout shifts (scroll/resize/orientation) */
  useEffect(() => {
    if (!isMobileHoverCard || !hoveredId) return;
    const update = () => {
      const el = document.querySelector(
        `[data-sphere-pill="${CSS.escape(hoveredId)}"]`
      );
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMobileHoverCardTop(rect.bottom + MOBILE_CARD_GAP_PX);
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isMobileHoverCard, hoveredId]);

  useLayoutEffect(() => {
    if (!isMobileHoverCard) return;
    const el = sphereRotatorRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      void resumeRotatorAudioContext();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (d === 0) return;
      rotationAngleRef.current = wrapRadians(
        rotationAngleRef.current + d * MOBILE_ROTATOR_WHEEL_SENS
      );
      scheduleRotatorFlush();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isMobileHoverCard]);

  useEffect(() => {
    if (isMobileHoverCard) return;
    const handleMove = (e: MouseEvent) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;
      const scale = Math.min(rect.width, rect.height) / WRAPPER_SIZE;
      const offsetX = (rect.width - WRAPPER_SIZE * scale) / 2;
      const offsetY = (rect.height - WRAPPER_SIZE * scale) / 2;
      const x = (e.clientX - rect.left - offsetX) / scale;
      const y = (e.clientY - rect.top - offsetY) / scale;
      const inside = x >= -20 && x <= WRAPPER_SIZE + 20 && y >= -20 && y <= WRAPPER_SIZE + 20;
      rawCursorRef.current = inside ? { x, y } : null;
    };
    const handleLeave = () => {
      rawCursorRef.current = null;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [isMobileHoverCard]);

  const { positions, connections } = useMemo(() => {
    const pos = getSpherePositions(studies.length);
    const conn = getConnections(pos);
    return { positions: pos, connections: conn };
  }, [studies.length]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (
        isMobileHoverCard &&
        rotatorInertiaActiveRef.current &&
        (pausedRef.current || hoveredIdRef.current)
      ) {
        rotatorInertiaActiveRef.current = false;
        rotatorInertiaVelRadPerFrameRef.current = 0;
        rotatorInertiaLastSignificantVRef.current = 0;
        idleSpinVelRef.current = ROTATION_SPEED;
        idleSpinLastRafMsRef.current = 0;
        idleSpinSkipApplyOnceRef.current = false;
        rotationAngleRef.current = snapRotationToMarker(rotationAngleRef.current);
        setRotationAngle((prev) => {
          const next = rotationAngleRef.current;
          if (next !== prev) pulseRotatorHapticTicksCrossedRef.current(prev, next);
          return next;
        });
      } else if (isMobileHoverCard && rotatorInertiaActiveRef.current && !pausedRef.current) {
        let v = rotatorInertiaVelRadPerFrameRef.current;
        if (Math.abs(v) >= ROTATOR_INERTIA_MIN_SPEED_RAD_PER_FRAME) {
          rotatorInertiaLastSignificantVRef.current = v;
        }
        if (Math.abs(v) < ROTATOR_INERTIA_MIN_SPEED_RAD_PER_FRAME) {
          rotatorInertiaActiveRef.current = false;
          rotatorInertiaVelRadPerFrameRef.current = 0;
          const lastV = rotatorInertiaLastSignificantVRef.current;
          rotatorInertiaLastSignificantVRef.current = 0;
          idleSpinVelRef.current = lastV;
          idleSpinLastRafMsRef.current = 0;
          const snapped = snapRotationToMarker(rotationAngleRef.current);
          rotationAngleRef.current = snapped;
          setRotationAngle((prev) => {
            if (snapped !== prev) pulseRotatorHapticTicksCrossedRef.current(prev, snapped);
            return snapped;
          });
        } else {
          const nextAngle = wrapRadians(rotationAngleRef.current + v);
          rotationAngleRef.current = nextAngle;
          rotatorInertiaVelRadPerFrameRef.current *= ROTATOR_INERTIA_FRICTION;
          setRotationAngle(nextAngle);
        }
      }

      if (!paused) {
        const rotatorHoldsSpin =
          mobileRotatorDraggingRef.current ||
          mobileRotatorFocusPausedRef.current ||
          rotatorInertiaActiveRef.current;
        if (!rotatorHoldsSpin) {
          const nowMs = performance.now();
          const dtMs =
            idleSpinLastRafMsRef.current > 0
              ? Math.min(nowMs - idleSpinLastRafMsRef.current, 48)
              : 1000 / 60;
          idleSpinLastRafMsRef.current = nowMs;
          const dtNorm = dtMs / (1000 / 60);
          const accelBlend = 1 - Math.pow(1 - IDLE_SPIN_VEL_BLEND, dtNorm);
          const decelBlend = 1 - Math.pow(1 - IDLE_SPIN_OPPOSED_DECEL, dtNorm);

          let w = idleSpinVelRef.current;
          const skipApply = idleSpinSkipApplyOnceRef.current;
          idleSpinSkipApplyOnceRef.current = false;
          if (!skipApply) {
            setRotationAngle((a) => wrapRadians(a + w));
          }
          if (w < 0) {
            w += (0 - w) * decelBlend;
            if (w >= -IDLE_SPIN_ZERO_SNAP_EPS) w = 0;
          } else {
            w += (ROTATION_SPEED - w) * accelBlend;
            if (Math.abs(ROTATION_SPEED - w) < IDLE_SPIN_VEL_SNAP_EPS) w = ROTATION_SPEED;
          }
          idleSpinVelRef.current = w;
        }
        if (!isMobileHoverCard) {
          setBreathPhase((b) => (b + BREATH_SPEED) % (Math.PI * 2));
        }
      }
      if (!isMobileHoverCard) {
        const next = rawCursorRef.current ?? null;
        setCursorViewBox((prev) => {
          if (prev === null && next === null) return prev;
          if (prev && next && prev.x === next.x && prev.y === next.y) return prev;
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, isMobileHoverCard]);

  const clearMobileLeaveTimer = () => {
    if (mobileLeaveTimerRef.current) {
      clearTimeout(mobileLeaveTimerRef.current);
      mobileLeaveTimerRef.current = null;
    }
  };

  const handlePillPointerEnter = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    clearMobileLeaveTimer();
    rotatorInertiaActiveRef.current = false;
    rotatorInertiaVelRadPerFrameRef.current = 0;
    rotatorInertiaLastSignificantVRef.current = 0;
    idleSpinVelRef.current = ROTATION_SPEED;
    idleSpinLastRafMsRef.current = 0;
    idleSpinSkipApplyOnceRef.current = false;
    rotatorVelEmaRadPerMsRef.current = 0;
    if (isMobileHoverCard) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMobileHoverCardTop(rect.bottom + MOBILE_CARD_GAP_PX);
    }
    setHoveredId(id);
    setPaused(true);
  };

  /** Desktop: leave pill → close. Mobile: keep card until tap outside (see document listener). */
  const handlePillPointerLeave = () => {
    if (isMobileHoverCard) return;
    setHoveredId(null);
    setPaused(false);
  };

  const handleMobileCardPointerEnter = () => {
    clearMobileLeaveTimer();
  };

  const handleMobileCardPointerLeave = () => {
    /* Mobile card stays on screen; dismiss via outside tap only. */
  };

  const endRotatorPointerGesture = (blurTarget: HTMLDivElement | null) => {
    const el = blurTarget;
    mobileRotatorDraggingRef.current = false;
    if (rotatorFlushRafRef.current != null) {
      cancelAnimationFrame(rotatorFlushRafRef.current);
      rotatorFlushRafRef.current = null;
    }
    const ema = rotatorVelEmaRadPerMsRef.current;
    rotatorVelEmaRadPerMsRef.current = 0;
    const allowCoast =
      isMobileHoverCard &&
      !pausedRef.current &&
      !hoveredIdRef.current &&
      Math.abs(ema) >= ROTATOR_INERTIA_MIN_RELEASE_RAD_PER_MS;
    if (allowCoast) {
      let radPerFrame = ema * ROTATOR_MS_PER_FRAME;
      radPerFrame =
        Math.sign(radPerFrame) *
        Math.min(Math.abs(radPerFrame), ROTATOR_INERTIA_MAX_RAD_PER_FRAME);
      rotatorInertiaVelRadPerFrameRef.current = radPerFrame;
      rotatorInertiaActiveRef.current = true;
      const u = wrapRadians(rotationAngleRef.current);
      rotationAngleRef.current = u;
      setRotationAngle(u);
    } else {
      rotatorInertiaActiveRef.current = false;
      rotatorInertiaVelRadPerFrameRef.current = 0;
      idleSpinVelRef.current = ROTATION_SPEED;
      idleSpinLastRafMsRef.current = 0;
      idleSpinSkipApplyOnceRef.current = false;
      flushRotatorRef.current();
    }
    el?.blur();
  };

  const handleRotatorPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobileHoverCard) return;
    e.preventDefault();
    const el = e.currentTarget as HTMLDivElement;
    el.setPointerCapture(e.pointerId);
    el.focus({ preventScroll: true });
    void resumeRotatorAudioContext();
    rotatorInertiaActiveRef.current = false;
    rotatorInertiaVelRadPerFrameRef.current = 0;
    rotatorInertiaLastSignificantVRef.current = 0;
    idleSpinVelRef.current = ROTATION_SPEED;
    idleSpinLastRafMsRef.current = 0;
    idleSpinSkipApplyOnceRef.current = false;
    rotatorVelEmaRadPerMsRef.current = 0;
    mobileRotatorDraggingRef.current = true;
    lastRotatorClientXRef.current = e.clientX;
    lastRotatorEventTimeRef.current = e.timeStamp;
  };

  const handleRotatorPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mobileRotatorDraggingRef.current) return;
    const dx = e.clientX - lastRotatorClientXRef.current;
    lastRotatorClientXRef.current = e.clientX;
    const t = e.timeStamp;
    const dt = Math.max(t - lastRotatorEventTimeRef.current, 1);
    lastRotatorEventTimeRef.current = t;
    const speed = Math.abs(dx) / dt;
    const mult = rotatorSwipeSpeedMultiplier(speed);
    const deltaRad = dx * MOBILE_ROTATOR_DRAG_SENS * mult;
    const instRadPerMs = deltaRad / dt;
    const b = ROTATOR_INERTIA_VEL_EMA;
    rotatorVelEmaRadPerMsRef.current =
      b * instRadPerMs + (1 - b) * rotatorVelEmaRadPerMsRef.current;
    rotationAngleRef.current = wrapRadians(rotationAngleRef.current + deltaRad);
    scheduleRotatorFlush();
  };

  const handleRotatorPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (mobileRotatorDraggingRef.current && el.hasPointerCapture(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    endRotatorPointerGesture(e.currentTarget as HTMLDivElement);
  };

  const handleRotatorLostPointerCapture = () => {
    endRotatorPointerGesture(sphereRotatorRef.current);
  };

  const handleRotatorFocus = () => {
    mobileRotatorFocusPausedRef.current = true;
    rotatorInertiaActiveRef.current = false;
    rotatorInertiaVelRadPerFrameRef.current = 0;
    void resumeRotatorAudioContext();
  };

  const handleRotatorBlur = () => {
    mobileRotatorFocusPausedRef.current = false;
  };

  /*
   * Ticks sit at x = d + 0.5 in SVG space. Needle is track center, so viewport center must be
   * rotatorCenterDeg + 0.5 (not the integer degree) or the highlight straddles the wrong line.
   */
  const rotatorCenterDeg = rotatorStripCenterDeg(rotationAngle);
  const rotatorViewBoxLeft =
    rotatorCenterDeg + 0.5 - ROTATOR_VISIBLE_DEG / 2;
  const rotatorViewBoxX =
    ((rotatorViewBoxLeft % ROTATOR_CYCLE_PX) + ROTATOR_CYCLE_PX) % ROTATOR_CYCLE_PX;
  const rotatorAriaDeg =
    (Math.round(rotatorCenterDeg) % 360 + 360) % 360;

  const center = WRAPPER_SIZE / 2;
  const depthScale = 500;
  const breathUsed = isMobileHoverCard ? 0 : breathPhase;
  const edgeSegments = isMobileHoverCard
    ? CONNECTION_SEGMENTS_MOBILE
    : CONNECTION_SEGMENTS_DESKTOP;
  const worldPositions = positions.map((p, i) => {
    const breath = 0.07 * Math.sin(breathUsed + i * 1.618);
    const scaled = {
      x: p.x * (1 + breath),
      y: p.y * (1 + breath),
      z: p.z * (1 + breath),
    };
    return rotateX(rotateY(scaled, rotationAngle), TILT_X);
  });
  const baseProjected = worldPositions.map((world) => {
    const scale = 1 / (1 + world.z / depthScale);
    return { x: center + world.x * scale, y: center - world.y * scale };
  });

  if (cursorViewBox) {
    if (!smoothedCursor.current) {
      smoothedCursor.current = { ...cursorViewBox };
    } else {
      smoothedCursor.current.x += (cursorViewBox.x - smoothedCursor.current.x) * CURSOR_SMOOTHING;
      smoothedCursor.current.y += (cursorViewBox.y - smoothedCursor.current.y) * CURSOR_SMOOTHING;
    }
  } else {
    smoothedCursor.current = null;
  }

  const hoveredStudy = hoveredId ? studies.find((s) => s.id === hoveredId) : undefined;
  const hoveredIndex = hoveredId ? studies.findIndex((s) => s.id === hoveredId) : -1;
  const isConnectionHighlighted = (a: number, b: number) =>
    hoveredIndex >= 0 && (a === hoveredIndex || b === hoveredIndex);

  const cursor = smoothedCursor.current;
  const projected = baseProjected.map((p) => {
    if (!cursor) return p;
    const dx = cursor.x - p.x;
    const dy = cursor.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return p;
    const influence = Math.max(0, 1 - dist / CURSOR_INFLUENCE_RADIUS);
    const strength = influence * influence * CURSOR_PULL_STRENGTH;
    return {
      x: p.x + dx * (strength / dist),
      y: p.y + dy * (strength / dist),
    };
  });

  const metricForHovered = hoveredStudy
    ? hoveredStudy.metrics?.[0] ||
      hoveredStudy.outcomes[0]?.slice(0, 50) ||
      hoveredStudy.timeFrame ||
      ""
    : "";

  return (
    <>
    <div className={styles.sphereContainer}>
      <div ref={wrapperRef} className={styles.wrapper} aria-hidden="true">
      <div
        className={styles.sphereGlow}
        aria-hidden="true"
        style={filter === "featured" ? {
          background: "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.28) 0%, rgba(34, 211, 238, 0.14) 35%, transparent 70%)",
        } : undefined}
      />
      <svg
        className={styles.connectionsSvg}
        viewBox={`0 0 ${WRAPPER_SIZE} ${WRAPPER_SIZE}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="sphereNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        {connections.map(([i, j], k) => {
          const [start, end] =
            worldPositions[i].z <= worldPositions[j].z
              ? [projected[i], projected[j]]
              : [projected[j], projected[i]];
          const segments = edgeSegments;
          return (
            <g key={k}>
              {Array.from({ length: segments }, (_, n) => {
                const t0 = n / segments;
                const t1 = (n + 1) / segments;
                const x0 = start.x + (end.x - start.x) * t0;
                const y0 = start.y + (end.y - start.y) * t0;
                const x1 = start.x + (end.x - start.x) * t1;
                const y1 = start.y + (end.y - start.y) * t1;
                const isFeatured = filter === "featured";
                const baseOpacity = isConnectionHighlighted(i, j) ? 0.6 : 0.1;
                const strokeOpacity = isFeatured ? Math.min(baseOpacity * 3, 1) : baseOpacity;
                return (
                  <line
                    key={n}
                    x1={x0}
                    y1={y0}
                    x2={x1}
                    y2={y1}
                    className={styles.connLine}
                    style={{
                      stroke: isFeatured
                        ? `rgba(34, 211, 238, ${strokeOpacity})`
                        : `rgba(34, 211, 238, ${baseOpacity})`,
                    }}
                  />
                );
              })}
            </g>
          );
        })}
        {projected.map((p, i) => (
          <circle
            key={`node-${i}`}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex >= 0 && i === hoveredIndex ? 6 : 4}
            fill="url(#sphereNodeGradient)"
            style={{
              opacity: hoveredIndex >= 0 && i === hoveredIndex ? 1 : filter === "featured" ? 0.6 : 0.1,
              filter: hoveredIndex >= 0 && i === hoveredIndex
                ? `brightness(1.5) drop-shadow(0 0 8px rgba(34, 211, 238, 0.9))`
                : filter === "featured" ? "brightness(1.4)" : undefined,
            }}
            className={styles.connNode}
          />
        ))}
      </svg>
      <div
        className={styles.sphere}
        style={{
          transform: `rotateY(${rotationAngle}rad) rotateX(${TILT_X}rad)`,
        }}
      />
      <div className={styles.labelsLayer}>
        {studies.map((study, i) => {
          const depthNorm =
            (worldPositions[i].z + SPHERE_RADIUS) / (SPHERE_RADIUS * 2);
          const opacity =
            hoveredId === study.id ? 1 : 0.35 + (1 - depthNorm) * 0.65;
          const scale =
            hoveredId === study.id ? 1.05 : 0.6 + (1 - depthNorm) * 0.4;
          /* Inset anchors so pills (translate -50%) stay inside layout; lines/nodes use raw projected */
          const rawX = projected[i].x;
          const rawY = projected[i].y - LABEL_PILL_OFFSET_ABOVE_NODE_PX;
          const pctX = Math.min(
            LABEL_ANCHOR_X_MAX_PCT,
            Math.max(LABEL_ANCHOR_X_MIN_PCT, (rawX / WRAPPER_SIZE) * 100)
          );
          const pctY = Math.min(
            LABEL_ANCHOR_Y_MAX_PCT,
            Math.max(LABEL_ANCHOR_Y_MIN_PCT, (rawY / WRAPPER_SIZE) * 100)
          );
          return (
            <div
              key={study.id}
              data-sphere-pill={study.id}
              className={`${styles.labelWrapper} ${hoveredId === study.id ? styles.labelWrapperHovered : ""}`}
              style={{
                left: `${pctX}%`,
                top: `${pctY}%`,
              }}
              onPointerEnter={(e) => handlePillPointerEnter(e, study.id)}
              onPointerDown={(e) => {
                if (isMobileHoverCard) handlePillPointerEnter(e, study.id);
              }}
              onPointerLeave={handlePillPointerLeave}
            >
              <Link
                to={`/project/${study.id}`}
                className={`${styles.labelPill} ${hoveredId === study.id ? styles.labelPillHover : ""} ${filter === "featured" ? styles.labelPillFeatured : ""}`}
                style={{
                  opacity,
                  /* Depth scale only — .labelWrapper already centers with translate(-50%, -50%) */
                  transform: `scale(${scale})`,
                }}
                onClick={(e) => {
                  if (isMobileHoverCard) e.preventDefault();
                }}
              >
                {FEATURED_PROJECT_IDS.has(study.id) && <svg className={styles.pillStar} width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}
                {study.title}
              </Link>
              {!isMobileHoverCard && (
                <AnimatePresence>
                  {hoveredId === study.id && (
                    <LabelCard
                      study={study}
                      metric={
                        study.metrics?.[0] ||
                        study.outcomes[0]?.slice(0, 50) ||
                        study.timeFrame
                      }
                      layout="inline"
                    />
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </div>
      </div>
      {isMobileHoverCard ? (
        <div
          ref={sphereRotatorRef}
          className={styles.sphereRotator}
          role="slider"
          aria-label="Rotate project sphere"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={rotatorAriaDeg}
          tabIndex={0}
          onFocus={handleRotatorFocus}
          onBlur={handleRotatorBlur}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              const step = e.key === "ArrowLeft" ? -ROTATOR_DEG_STEP_RAD : ROTATOR_DEG_STEP_RAD;
              setRotationAngle((a) => {
                const next = snapRotationToMarker(wrapRadians(a + step));
                if (rotatorHapticTickIndex(next) !== rotatorHapticTickIndex(a)) {
                  pulseRotatorHaptic();
                }
                rotationAngleRef.current = next;
                return next;
              });
            }
          }}
          onPointerDown={handleRotatorPointerDown}
          onPointerMove={handleRotatorPointerMove}
          onPointerUp={handleRotatorPointerUp}
          onPointerCancel={handleRotatorPointerUp}
          onLostPointerCapture={handleRotatorLostPointerCapture}
        >
          <span className={styles.sphereRotatorHint}>Drag to rotate</span>
          <div className={styles.sphereRotatorTrack}>
            <div className={styles.sphereRotatorLinesClip}>
              <svg
                className={styles.sphereRotatorLines}
                viewBox={`${rotatorViewBoxX} 0 ${ROTATOR_VISIBLE_DEG} ${ROTATOR_TRACK_VB_H}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                {ROTATOR_DEGREE_LINES}
              </svg>
            </div>
            <div className={styles.sphereRotatorCenterLine} aria-hidden />
          </div>
        </div>
      ) : null}
      <div className={styles.filterBar} role="tablist" aria-label="Filter projects by company">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={filter === opt.value}
            className={`${styles.filterBtn} ${filter === opt.value ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
    {isMobileHoverCard &&
      hoveredId &&
      mobileHoverCardTop !== null &&
      hoveredStudy &&
      createPortal(
        <div
          className={styles.cardGlowWrapperFixed}
          data-sphere-mobile-card
          style={{ top: mobileHoverCardTop }}
          onPointerEnter={handleMobileCardPointerEnter}
          onPointerLeave={handleMobileCardPointerLeave}
        >
          <AnimatePresence>
            <LabelCard
              key={hoveredStudy.id}
              study={hoveredStudy}
              metric={metricForHovered}
              layout="mobileFixed"
            />
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  );
}

function LabelCard({
  study,
  metric,
  layout = "inline",
}: {
  study: CaseStudy;
  metric: string;
  layout?: "inline" | "mobileFixed";
}) {
  const [imgError, setImgError] = useState(false);
  const showThumb = study.thumbnail && !imgError;
  const wrapperClass =
    layout === "mobileFixed"
      ? `${styles.cardGlowWrapper} ${styles.cardGlowWrapperMobilePanel}`
      : styles.cardGlowWrapper;
  return (
    <motion.div
      className={wrapperClass}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/project/${study.id}`} className={styles.card}>
        {showThumb ? (
          <div className={styles.cardThumbWrap}>
            <ShimmerImg
              src={resolveThumbnail(study.thumbnail)}
              alt=""
              className={styles.cardThumb}
              onError={() => setImgError(true)}
            />
          </div>
        ) : null}
        <div className={styles.cardBody}>
          <h4 className={styles.cardTitle}>{study.title}</h4>
          <div className={styles.cardMeta}>
            <span className={styles.cardCompany}>{study.company}</span>
            {FEATURED_PROJECT_IDS.has(study.id) && (
              <span className={styles.cardFeaturedTag}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Featured
              </span>
            )}
          </div>
          <p className={styles.cardMetric}>{metric}</p>
          <span className={styles.cardLink}>View case study →</span>
        </div>
      </Link>
    </motion.div>
  );
}

