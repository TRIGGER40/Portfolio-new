import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./UXReport.module.css";
import worldMapSvg from "../assets/world-map.svg";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

/* ── Types ── */
interface SummaryItem { label: string; value: string; delta: string; up: boolean }
interface FunnelStep { label: string; value: number; pct: number }
interface DeviceRow { device: string; sessions: number }
interface CaseStudyRow { title: string; company: string; views: number }
interface ContactRow { type: string; clicks: number }
interface SectionRow { section: string; views: number }
interface ScrollRow { depth: number; sessions: number }

interface GeoPoint { city: string; country: string; lat: number; lng: number; sessions: number }

interface AIInsight { title: string; body: string; evidence: string }

interface AIAnalysis {
  insights: AIInsight[];
}

interface LiveData {
  summary: SummaryItem[];
  funnel: FunnelStep[];
  deviceSplit: DeviceRow[];
  topCaseStudies: CaseStudyRow[];
  contactTypes: ContactRow[];
  chatStarts: number;
  sectionViews: SectionRow[];
  scrollDepth: ScrollRow[];
  dailySessions: { day: string; sessions: number }[];
  geoTraffic?: GeoPoint[];
  generatedAt: string;
  aiAnalysis?: AIAnalysis | null;
}

/* ── Fallback static data ── */
const FALLBACK_SUMMARY: SummaryItem[] = [
  { label: "Total Sessions", value: "—", delta: "awaiting data", up: true },
  { label: "Avg. Session Duration", value: "—", delta: "awaiting data", up: true },
  { label: "Case Study Opens", value: "—", delta: "awaiting data", up: true },
  { label: "Contact Clicks", value: "—", delta: "awaiting data", up: true },
];

const FALLBACK_FUNNEL: FunnelStep[] = [
  { label: "Landing", value: 0, pct: 100 },
  { label: "Scrolled past hero", value: 0, pct: 0 },
  { label: "Opened a case study", value: 0, pct: 0 },
  { label: "Clicked Contact / Resume", value: 0, pct: 0 },
];

/* ── Static fallback analysis (used when AI analysis is unavailable) ── */
const FALLBACK_INSIGHTS: AIInsight[] = [
  {
    title: "AI chat drives higher-quality engagement than passive scrolling",
    body: "Users who start with the AI chat are more likely to open a case study and spend more time on the portfolio. The chat surfaces relevant projects proactively, reducing the effort needed to find compelling work.",
    evidence: "Compare chat_start → case_study_open conversion vs organic scroll → case_study_open in PostHog funnels.",
  },
  {
    title: "Adobe projects dominate; Bizongo and YUJ work is underexplored",
    body: "The experience timeline defaults to Adobe, creating a recency/familiarity bias. B2B and consulting projects that demonstrate systems thinking receive disproportionately fewer views despite strong content depth.",
    evidence: "See 'Top Case Studies' breakdown for live view distribution across companies.",
  },
  {
    title: "Mobile visitors drop off significantly earlier than desktop visitors",
    body: "Mobile sessions show steeper funnel drop-offs at every stage. The horizontal carousels and dense card layouts create friction on smaller screens, making it harder to discover and evaluate case studies.",
    evidence: "See 'Device Split' for mobile vs desktop session distribution.",
  },
];


/* ── Three-dot loader ── */
function ThreeDotLoader({ label }: { label?: string }) {
  return (
    <div className={styles.loaderWrap}>
      <div className={styles.threeDots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      {label && <p className={styles.loaderLabel}>{label}</p>}
    </div>
  );
}

/* ── Sparkline component ── */
function Sparkline({ data, width = 200, height = 40 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke="rgba(56,189,248,0.6)" strokeWidth="1.5" />
    </svg>
  );
}

/* ── Device bar ── */
function DeviceBar({ data }: { data: DeviceRow[] }) {
  const total = data.reduce((s, d) => s + d.sessions, 0) || 1;
  const colors: Record<string, string> = {
    desktop: "rgba(56, 189, 248, 0.7)",
    mobile: "rgba(139, 92, 246, 0.7)",
    tablet: "rgba(20, 184, 166, 0.7)",
    unknown: "rgba(100, 100, 120, 0.5)",
  };
  return (
    <div>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 28, marginBottom: "0.75rem" }}>
        {data.map((d) => (
          <div
            key={d.device}
            style={{
              width: `${(d.sessions / total) * 100}%`,
              background: colors[d.device] || colors.unknown,
              minWidth: d.sessions > 0 ? 2 : 0,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        {data.map((d) => (
          <div key={d.device} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{
              width: 10, height: 10, borderRadius: 3,
              background: colors[d.device] || colors.unknown,
              display: "inline-block",
            }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
              {d.device}: {d.sessions.toLocaleString()} ({Math.round((d.sessions / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── World Map with heat circles ── */

function WorldMap({ data }: { data: GeoPoint[] }) {
  // Match the world SVG viewBox: 2000 x 857
  const W = 2000;
  const H = 857;

  // Equirectangular projection matching the simplemaps SVG
  // The SVG maps lat ~83.6N to ~-56S across 0..857 height
  const LAT_TOP = 83.6;
  const LAT_BOT = -56;
  const project = (lat: number, lng: number): [number, number] => {
    const x = ((lng + 180) / 360) * W;
    const y = ((LAT_TOP - lat) / (LAT_TOP - LAT_BOT)) * H;
    return [Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y))];
  };

  // Circle radius: starts small (4px), grows by 2px per 10 sessions
  const getRadius = (sessions: number) => {
    return Math.min(4 + Math.floor(sessions / 10) * 2, 40);
  };

  return (
    <div className={styles.mapWrap}>
      <div className={styles.mapContainer}>
        {/* World map SVG as background */}
        <img src={worldMapSvg} alt="" className={styles.mapBg} />

        {/* Overlay SVG for traffic dots */}
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.mapOverlay}>
          {[...data].sort((a, b) => a.sessions - b.sessions).map((pt, i) => {
            const [x, y] = project(pt.lat, pt.lng);
            const r = getRadius(pt.sessions);
            const opacity = Math.min(0.35 + pt.sessions * 0.05, 0.8);
            return (
              <g key={i}>
                {/* Soft glow */}
                <circle cx={x} cy={y} r={r * 2} fill={`rgba(56, 189, 248, ${opacity * 0.12})`} />
                {/* Main dot */}
                <circle cx={x} cy={y} r={r} fill={`rgba(56, 189, 248, ${opacity})`} stroke="rgba(56, 189, 248, 0.25)" strokeWidth={1.5} />
                {/* Pulse for 10+ sessions */}
                {pt.sessions >= 10 && (
                  <circle cx={x} cy={y} r={r} fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth={2}>
                    <animate attributeName="r" from={String(r)} to={String(r * 2.5)} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className={styles.mapLegend}>
        {data.slice(0, 6).map((pt, i) => (
          <div key={i} className={styles.mapLegendItem}>
            <span className={styles.mapLegendDot} style={{
              width: Math.max(6, getRadius(pt.sessions) / 2),
              height: Math.max(6, getRadius(pt.sessions) / 2),
            }} />
            <span className={styles.mapLegendLabel}>
              {pt.city}, {pt.country}
            </span>
            <span className={styles.mapLegendValue}>{pt.sessions}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UXReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const authorized = (location.state as { authorized?: boolean } | null)?.authorized;

  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authorized) return;
    fetch("/api/analytics")
      .then((r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.fallback) throw new Error("Fallback mode");
        setLiveData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authorized]);

  if (!authorized) return <Navigate to="/" replace />;

  const summary = liveData?.summary ?? FALLBACK_SUMMARY;
  const funnel = liveData?.funnel ?? FALLBACK_FUNNEL;
  const isLive = !!liveData;
  const hasAI = !!liveData?.aiAnalysis;
  const insights = liveData?.aiAnalysis?.insights ?? FALLBACK_INSIGHTS;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate("/")}>
          ← Back to portfolio
        </button>
      </header>

      <div className={styles.layout}>
        {/* Header */}
        <motion.div className={styles.reportHeader} {...fadeUp}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className={styles.reportBadge}>Confidential</span>
            <span className={styles.reportBadge} style={{
              color: isLive ? "#34d399" : "#fbbf24",
              background: isLive ? "rgba(52,211,153,0.1)" : "rgba(251,191,36,0.1)",
              borderColor: isLive ? "rgba(52,211,153,0.2)" : "rgba(251,191,36,0.2)",
            }}>
              {loading ? "Loading..." : isLive ? "Live Data" : "Static Fallback"}
            </span>
          </div>
          <h1 className={styles.reportTitle}>
            UX Research &amp; Analytics Report
          </h1>
          <p className={styles.reportSubtitle}>
            Portfolio performance analysis with actionable UX recommendations.
            {isLive
              ? " Powered by live PostHog analytics data."
              : " Connect PostHog personal API key for live data."}
          </p>
          <p className={styles.reportDate}>
            Report period: {fmt(thirtyDaysAgo)} – {fmt(now)}
            {liveData?.generatedAt && ` · Generated ${new Date(liveData.generatedAt).toLocaleTimeString()}`}
            {" · "}Generated for Vishnu Priya C.P.
          </p>
          {error && !isLive && (
            <p style={{ fontSize: "0.75rem", color: "#fbbf24", marginTop: "0.5rem" }}>
              Note: Could not load live data ({error}). Showing static analysis.
              Add POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID to Vercel env vars for live data.
            </p>
          )}
        </motion.div>

        {/* ── Data sections: loader or content ── */}
        {loading ? (
          <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.05, duration: 0.35 }}>
            <ThreeDotLoader label="Fetching analytics from PostHog..." />
          </motion.div>
        ) : (
          <>
            {/* Summary KPIs */}
            <motion.div className={styles.summaryRow} {...fadeUp} transition={{ delay: 0.05, duration: 0.35 }}>
              {summary.map((s) => (
                <div key={s.label} className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>{s.label}</div>
                  <div className={styles.summaryValue}>{s.value}</div>
                  <div className={`${styles.summaryDelta} ${s.up ? styles.deltaUp : styles.deltaDown}`}>
                    {s.delta} vs prev 30d
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Daily sessions sparkline */}
            {liveData?.dailySessions && liveData.dailySessions.length > 1 && (
              <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.07, duration: 0.35 }}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>&#128200;</span> Daily Sessions (30d)
                </h2>
                <div className={styles.funnelWrap} style={{ padding: "1.25rem" }}>
                  <Sparkline data={liveData.dailySessions.map((d) => d.sessions)} width={800} height={60} />
                </div>
              </motion.div>
            )}

            {/* Device Split */}
            {liveData?.deviceSplit && liveData.deviceSplit.length > 0 && (
              <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.08, duration: 0.35 }}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>&#128241;</span> Device Split
                </h2>
                <div className={styles.funnelWrap}>
                  <DeviceBar data={liveData.deviceSplit} />
                </div>
              </motion.div>
            )}

            {/* Geo Traffic Map */}
            {liveData?.geoTraffic && liveData.geoTraffic.length > 0 && (
              <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.09, duration: 0.35 }}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>&#127758;</span> Visitor Geography
                </h2>
                <WorldMap data={liveData.geoTraffic} />
              </motion.div>
            )}

            {/* Engagement Funnel */}
            <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.1, duration: 0.35 }}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>&#9660;</span> Engagement Funnel
              </h2>
              <div className={styles.funnelWrap}>
                <div className={styles.funnelTitle}>Visitor journey (30-day aggregate)</div>
                {funnel.map((step) => (
                  <div key={step.label} className={styles.funnelStep}>
                    <span className={styles.funnelValue}>{typeof step.value === "number" ? step.value.toLocaleString() : step.value}</span>
                    <div className={styles.funnelBar} style={{ width: `${Math.max(step.pct, 5)}%` }}>
                      <span className={styles.funnelLabel}>{step.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Case Studies */}
            {liveData?.topCaseStudies && liveData.topCaseStudies.length > 0 && (
              <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.12, duration: 0.35 }}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>&#128214;</span> Top Case Studies
                </h2>
                <div className={styles.funnelWrap}>
                  {liveData.topCaseStudies.map((cs, i) => (
                    <div key={i} className={styles.funnelStep}>
                      <span className={styles.funnelValue}>{cs.views}</span>
                      <div className={styles.funnelBar} style={{
                        width: `${Math.max((cs.views / (liveData.topCaseStudies[0]?.views || 1)) * 100, 8)}%`,
                      }}>
                        <span className={styles.funnelLabel}>{cs.title} ({cs.company})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Contact Click Types */}
            {liveData?.contactTypes && liveData.contactTypes.length > 0 && (
              <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.13, duration: 0.35 }}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>&#128140;</span> Contact Click Breakdown
                </h2>
                <div className={styles.funnelWrap}>
                  {liveData.contactTypes.map((ct, i) => (
                    <div key={i} className={styles.funnelStep}>
                      <span className={styles.funnelValue}>{ct.clicks}</span>
                      <div className={styles.funnelBar} style={{
                        width: `${Math.max((ct.clicks / (liveData.contactTypes[0]?.clicks || 1)) * 100, 10)}%`,
                        background: "linear-gradient(90deg, rgba(139,92,246,0.5), rgba(139,92,246,0.2))",
                      }}>
                        <span className={styles.funnelLabel} style={{ textTransform: "capitalize" }}>{ct.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Section Views + Chat + Scroll Depth */}
            {liveData && (
              <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.14, duration: 0.35 }}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>&#128065;</span> Engagement Metrics
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {/* Chat starts */}
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>AI Chat Sessions</div>
                    <div className={styles.summaryValue}>{liveData.chatStarts}</div>
                  </div>
                  {/* Scroll depth */}
                  {liveData.scrollDepth.map((sd) => (
                    <div key={sd.depth} className={styles.summaryCard}>
                      <div className={styles.summaryLabel}>Scrolled {sd.depth}%</div>
                      <div className={styles.summaryValue}>{sd.sessions}</div>
                    </div>
                  ))}
                </div>
                {liveData.sectionViews.length > 0 && (
                  <div className={styles.funnelWrap} style={{ marginTop: "1rem" }}>
                    <div className={styles.funnelTitle}>Section visibility (unique sessions)</div>
                    {liveData.sectionViews.map((sv, i) => (
                      <div key={i} className={styles.funnelStep}>
                        <span className={styles.funnelValue}>{sv.views}</span>
                        <div className={styles.funnelBar} style={{
                          width: `${Math.max((sv.views / (liveData.sectionViews[0]?.views || 1)) * 100, 8)}%`,
                          background: "linear-gradient(90deg, rgba(20,184,166,0.5), rgba(20,184,166,0.2))",
                        }}>
                          <span className={styles.funnelLabel} style={{ textTransform: "capitalize" }}>{sv.section}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* Key Insights — separate loader for AI */}
        <motion.div className={styles.section} {...fadeUp} transition={{ delay: 0.15, duration: 0.35 }}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>&#128161;</span> Key Insights
            {hasAI && <span className={styles.expType} style={{ marginLeft: "0.5rem", fontSize: "0.6rem" }}>AI-Generated</span>}
          </h2>
          {loading ? (
            <ThreeDotLoader label="Generating AI insights..." />
          ) : (
            <div className={styles.insightGrid}>
              {insights.slice(0, 3).map((ins, i) => (
                <div key={i} className={styles.insightCard}>
                  <span className={styles.insightNumber}>{String(i + 1).padStart(2, "0")}</span>
                  <div className={styles.insightContent}>
                    <h3 className={styles.insightTitle}>{ins.title}</h3>
                    <p className={styles.insightBody}>{ins.body}</p>
                    <p className={styles.insightEvidence}>Evidence: {ins.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className={styles.footerNote}>
          {isLive
            ? `Live data from PostHog${hasAI ? " · Analysis by GPT-4o-mini" : ""} · Last updated ${new Date(liveData!.generatedAt).toLocaleString()}`
            : "Analytics instrumented via PostHog. Connect PostHog + OpenAI for live AI-generated analysis."
          }
        </div>
      </div>
    </div>
  );
}
