import styles from "./CareerEvolution.module.css";

/** Thematic SVG illustrations for career stages (decorative, not literal). */
export function CareerIllustration({ stageId }: { stageId: string }) {
  const common = { fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (stageId) {
    case "computer-science":
      return (
        <svg viewBox="0 0 320 240" className={styles.illustrationSvg} aria-hidden>
          <defs>
            <linearGradient id="cg-cs" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect x="56" y="52" width="208" height="136" rx="10" stroke="url(#cg-cs)" {...common} opacity={0.85} />
          <path d="M80 88h160M80 108h120M80 128h140" stroke="rgba(255,255,255,0.28)" strokeWidth={1.2} strokeLinecap="round" />
          <path d="M88 156l12 8 12-8" stroke="url(#cg-cs)" {...common} opacity={0.6} />
          <text x="160" y="212" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="11" fontFamily="system-ui, sans-serif">
            {"{ }"}
          </text>
        </svg>
      );
    case "industrial":
      return (
        <img
          src={`${import.meta.env.BASE_URL}career-industrial-design.png`}
          alt=""
          className={styles.illustrationImg}
          aria-hidden
          decoding="async"
        />
      );
    case "ux":
      return (
        <svg viewBox="0 0 320 240" className={styles.illustrationSvg} aria-hidden>
          <defs>
            <linearGradient id="cg-ux" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <rect x="48" y="56" width="224" height="140" rx="12" stroke="url(#cg-ux)" {...common} opacity={0.85} />
          <rect x="72" y="84" width="80" height="40" rx="4" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} />
          <rect x="168" y="84" width="80" height="40" rx="4" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} />
          <path d="M96 160h128" stroke="url(#cg-ux)" {...common} opacity={0.6} strokeDasharray="6 6" />
          <circle cx="160" cy="200" r="8" fill="url(#cg-ux)" opacity={0.4} />
        </svg>
      );
    case "b2b":
      return (
        <svg viewBox="0 0 320 240" className={styles.illustrationSvg} aria-hidden>
          <defs>
            <linearGradient id="cg-ent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={64 + i * 56}
              y={72 + i * 18}
              width="120"
              height="72"
              rx="6"
              stroke="url(#cg-ent)"
              strokeWidth={1.2}
              fill="none"
              opacity={0.35 + i * 0.2}
            />
          ))}
          <path d="M80 200h160" stroke="url(#cg-ent)" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
          <circle cx="160" cy="200" r="4" fill="url(#cg-ent)" />
        </svg>
      );
    case "b2c":
      return (
        <svg viewBox="0 0 320 240" className={styles.illustrationSvg} aria-hidden>
          <defs>
            <linearGradient id="cg-b2c" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <rect x="88" y="48" width="144" height="200" rx="20" stroke="url(#cg-b2c)" {...common} opacity={0.85} />
          <rect x="108" y="72" width="104" height="64" rx="6" stroke="rgba(255,255,255,0.2)" strokeWidth={1.2} />
          <circle cx="160" cy="168" r="24" stroke="url(#cg-b2c)" {...common} opacity={0.5} />
          <path d="M120 200h80" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        </svg>
      );
    case "ai-first":
      return (
        <svg viewBox="0 0 320 240" className={styles.illustrationSvg} aria-hidden>
          <defs>
            <linearGradient id="cg-ai" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="120" r="48" stroke="url(#cg-ai)" {...common} opacity={0.9} />
          <circle cx="160" cy="120" r="28" stroke="url(#cg-ai)" {...common} opacity={0.5} />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 160 + Math.cos(rad) * 56;
            const y1 = 120 + Math.sin(rad) * 56;
            const x2 = 160 + Math.cos(rad) * 72;
            const y2 = 120 + Math.sin(rad) * 72;
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#cg-ai)" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />;
          })}
          <circle cx="100" cy="88" r="4" fill="url(#cg-ai)" opacity={0.6} />
          <circle cx="220" cy="152" r="4" fill="url(#cg-ai)" opacity={0.6} />
        </svg>
      );
    default:
      return null;
  }
}
