import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./ChatConnectors.module.css";

const NODE_RADIUS = 3;
const STROKE_WIDTH = 1.5;
const STROKE_COLOR = "rgba(56, 189, 248, 1)";
const NODE_GRADIENT = "url(#chatNodeGradient)";
const CONTENT_BLUR_PX = (stackDepth: number) => 2 + stackDepth * 3;
const OPACITY_PER_DEPTH = 0.3;

interface ChatConnectorsProps {
  queryPillRef: React.RefObject<HTMLElement | null>;
  replyPillRef: React.RefObject<HTMLElement | null>;
  pastReplyRefs?: React.RefObject<(HTMLElement | null)[]>;
  pairCount?: number;
  activePairIndex?: number;
  appearDelayMs?: number;
  turnIndex?: number;
}

export function ChatConnectors({
  queryPillRef,
  replyPillRef,
  pastReplyRefs,
  pairCount = 0,
  activePairIndex = 0,
  appearDelayMs = 0,
  turnIndex = 0,
}: ChatConnectorsProps) {
  const [pathData, setPathData] = useState<{
    pastReplyToQueryPaths: { d: string; blurPx: number; opacity: number }[];
    pastReplyNodes: { x: number; y: number; blurPx: number; opacity: number }[];
    queryLeftNode: { x: number; y: number } | null;
  }>({
    pastReplyToQueryPaths: [],
    pastReplyNodes: [],
    queryLeftNode: null,
  });
  const [viewport, setViewport] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1920, h: typeof window !== "undefined" ? window.innerHeight : 1080 });

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const runUpdate = () => {
    const query = queryPillRef.current;
    const reply = replyPillRef.current;
    if (!query || !reply) return;

    const queryRect = query.getBoundingClientRect();

    const queryCenterY = queryRect.top + queryRect.height / 2;
    const queryLeftX = queryRect.left;

    const pastReplyToQueryPaths: { d: string; blurPx: number; opacity: number }[] = [];
    const pastReplyNodes: { x: number; y: number; blurPx: number; opacity: number }[] = [];

    const replyRefs = pastReplyRefs?.current;
    if (replyRefs && pairCount > 0) {
      for (let i = 0; i < pairCount; i++) {
        if (i === activePairIndex) continue;
        const pastReply = replyRefs[i];
        if (pastReply) {
          const rect = pastReply.getBoundingClientRect();
          const prevRightX = rect.right;
          const prevCenterY = rect.top + rect.height / 2;
          const stackDepth = Math.abs(activePairIndex - i);
          const blurPx = CONTENT_BLUR_PX(stackDepth);
          const opacity = Math.pow(OPACITY_PER_DEPTH, stackDepth);
          pastReplyToQueryPaths.push({
            d: `M ${prevRightX} ${prevCenterY} L ${queryLeftX} ${queryCenterY}`,
            blurPx,
            opacity,
          });
          pastReplyNodes.push({ x: prevRightX, y: prevCenterY, blurPx, opacity });
        }
      }
    }

    setPathData({
      pastReplyToQueryPaths,
      pastReplyNodes,
      queryLeftNode: pastReplyToQueryPaths.length > 0 ? { x: queryLeftX, y: queryCenterY } : null,
    });
  };

  useLayoutEffect(() => {
    runUpdate();
    const id = setTimeout(runUpdate, 100);
    const ro = new ResizeObserver(runUpdate);
    if (queryPillRef.current) ro.observe(queryPillRef.current);
    if (replyPillRef.current) ro.observe(replyPillRef.current);
    const replyRefs = pastReplyRefs?.current;
    if (replyRefs) {
      for (let i = 0; i < replyRefs.length; i++) {
        const el = replyRefs[i];
        if (el) ro.observe(el);
      }
    }
    window.addEventListener("resize", runUpdate);
    const interval = setInterval(runUpdate, 150);
    return () => {
      clearTimeout(id);
      ro.disconnect();
      window.removeEventListener("resize", runUpdate);
      clearInterval(interval);
    };
  }, [queryPillRef, replyPillRef, pastReplyRefs, pairCount, activePairIndex, turnIndex]);

  if (pathData.pastReplyToQueryPaths.length === 0) return null;

  const svg = (
    <motion.svg
      className={styles.connectorsSvg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewport.w} ${viewport.h}`}
      preserveAspectRatio="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.42, 0, 1, 1], delay: appearDelayMs / 1000 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <defs>
        <linearGradient id="chatNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {pathData.pastReplyToQueryPaths.map((path, idx) => (
        <g
          key={`pastReplyToQuery-${idx}`}
          style={{
            opacity: path.opacity,
            filter: `blur(${path.blurPx}px)`,
            WebkitFilter: `blur(${path.blurPx}px)`,
          }}
        >
          <path
            d={path.d}
            fill="none"
            stroke={STROKE_COLOR}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={styles.connLine}
          />
        </g>
      ))}

      {pathData.pastReplyNodes.map((node, idx) => (
        <g
          key={`pastReplyNode-${idx}`}
          style={{
            opacity: node.opacity,
            filter: `blur(${node.blurPx}px)`,
            WebkitFilter: `blur(${node.blurPx}px)`,
          }}
        >
          <circle
            cx={node.x}
            cy={node.y}
            r={NODE_RADIUS}
            fill={NODE_GRADIENT}
            className={styles.connNode}
            shapeRendering="geometricPrecision"
          />
        </g>
      ))}
      {pathData.queryLeftNode && (
        <circle
          cx={pathData.queryLeftNode.x}
          cy={pathData.queryLeftNode.y}
          r={NODE_RADIUS}
          fill={NODE_GRADIENT}
          className={styles.connNode}
          shapeRendering="geometricPrecision"
        />
      )}
    </motion.svg>
  );

  return svg;
}
