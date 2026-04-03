/**
 * Maps company names to glow styles for dynamic resume / chat UI.
 * Use {@link getCompanyGlow} for a single company string, or
 * {@link getCompanyGlowFromUserInput} when scanning free-form user text (latest mention wins).
 */

/** Four-stop palette: primary = core glow, secondary = inner gradient, accent = outer glow, soft = ambient fade */
export interface CompanyGlowColors {
  primary: string;
  secondary: string;
  accent: string;
  soft: string;
}

/**
 * Resolved style for BackgroundGlow + chat theme.
 * Keeps legacy `gradient` / `blur` / `opacity`; adds explicit accent + soft for new call sites.
 */
export interface CompanyGlowStyle extends CompanyGlowColors {
  /** Pre-computed full-viewport radial for {@link BackgroundGlow} */
  gradient?: string;
  blur?: number;
  opacity?: number;
}

/** Source-of-truth palette per company (lowercase keys). */
export const companyGlowMap = {
  apple: {
    primary: "rgba(10,10,10,1)",
    secondary: "rgba(64,64,64,0.9)",
    accent: "rgba(156,163,175,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  google: {
    primary: "rgba(66,133,244,1)",
    secondary: "rgba(234,67,53,0.9)",
    accent: "rgba(251,188,5,0.85)",
    soft: "rgba(52,168,83,0.85)",
  },
  microsoft: {
    primary: "rgba(0,120,215,1)",
    secondary: "rgba(16,185,129,0.9)",
    accent: "rgba(255,185,0,0.85)",
    soft: "rgba(59,130,246,0.6)",
  },
  amazon: {
    primary: "rgba(255,153,0,1)",
    secondary: "rgba(255,196,57,0.9)",
    accent: "rgba(35,47,62,0.9)",
    soft: "rgba(148,163,184,0.5)",
  },
  meta: {
    primary: "rgba(24,119,242,1)",
    secondary: "rgba(139,92,246,0.9)",
    accent: "rgba(59,130,246,0.7)",
    soft: "rgba(147,197,253,0.5)",
  },
  netflix: {
    primary: "rgba(229,9,20,1)",
    secondary: "rgba(153,27,27,0.9)",
    accent: "rgba(0,0,0,0.95)",
    soft: "rgba(248,113,113,0.4)",
  },
  spotify: {
    primary: "rgba(30,215,96,1)",
    secondary: "rgba(22,163,74,0.9)",
    accent: "rgba(0,0,0,0.95)",
    soft: "rgba(134,239,172,0.4)",
  },
  uber: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(38,38,38,0.9)",
    accent: "rgba(115,115,115,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  airbnb: {
    primary: "rgba(255,90,95,1)",
    secondary: "rgba(244,63,94,0.9)",
    accent: "rgba(190,24,93,0.8)",
    soft: "rgba(253,164,175,0.4)",
  },
  figma: {
    primary: "rgba(242,78,30,1)",
    secondary: "rgba(162,89,255,0.9)",
    accent: "rgba(10,207,131,0.9)",
    soft: "rgba(255,114,98,0.5)",
  },
  notion: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(64,64,64,0.85)",
    accent: "rgba(163,163,163,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  slack: {
    primary: "rgba(74,21,75,1)",
    secondary: "rgba(36,150,237,0.9)",
    accent: "rgba(46,182,125,0.9)",
    soft: "rgba(224,30,90,0.85)",
  },
  dropbox: {
    primary: "rgba(0,97,255,1)",
    secondary: "rgba(59,130,246,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.8)",
  },
  atlassian: {
    primary: "rgba(0,82,204,1)",
    secondary: "rgba(38,132,255,0.9)",
    accent: "rgba(179,212,255,0.6)",
    soft: "rgba(9,30,66,0.85)",
  },
  salesforce: {
    primary: "rgba(0,161,224,1)",
    secondary: "rgba(56,189,248,0.9)",
    accent: "rgba(186,230,253,0.6)",
    soft: "rgba(2,132,199,0.8)",
  },
  shopify: {
    primary: "rgba(95,166,71,1)",
    secondary: "rgba(34,197,94,0.9)",
    accent: "rgba(134,239,172,0.6)",
    soft: "rgba(22,101,52,0.8)",
  },
  stripe: {
    primary: "rgba(99,91,255,1)",
    secondary: "rgba(139,92,246,0.9)",
    accent: "rgba(165,180,252,0.6)",
    soft: "rgba(49,46,129,0.8)",
  },
  nvidia: {
    primary: "rgba(118,185,0,1)",
    secondary: "rgba(163,230,53,0.9)",
    accent: "rgba(217,249,157,0.6)",
    soft: "rgba(63,98,18,0.8)",
  },
  intel: {
    primary: "rgba(0,113,197,1)",
    secondary: "rgba(14,165,233,0.9)",
    accent: "rgba(186,230,253,0.6)",
    soft: "rgba(3,105,161,0.8)",
  },
  oracle: {
    primary: "rgba(248,0,0,1)",
    secondary: "rgba(185,28,28,0.9)",
    accent: "rgba(127,29,29,0.8)",
    soft: "rgba(252,165,165,0.4)",
  },
  sap: {
    primary: "rgba(0,157,224,1)",
    secondary: "rgba(56,189,248,0.9)",
    accent: "rgba(2,132,199,0.8)",
    soft: "rgba(186,230,253,0.4)",
  },
  cisco: {
    primary: "rgba(30,113,184,1)",
    secondary: "rgba(59,130,246,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  zoom: {
    primary: "rgba(45,140,255,1)",
    secondary: "rgba(96,165,250,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,64,175,0.7)",
  },
  tiktok: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(34,211,238,0.9)",
    accent: "rgba(236,72,153,0.8)",
    soft: "rgba(125,211,252,0.4)",
  },
  youtube: {
    primary: "rgba(255,0,0,1)",
    secondary: "rgba(220,38,38,0.9)",
    accent: "rgba(127,29,29,0.8)",
    soft: "rgba(252,165,165,0.4)",
  },
  github: {
    primary: "rgba(24,23,23,1)",
    secondary: "rgba(64,64,64,0.9)",
    accent: "rgba(163,163,163,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  vercel: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(38,38,38,0.9)",
    accent: "rgba(115,115,115,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  linear: {
    primary: "rgba(94,92,230,1)",
    secondary: "rgba(139,92,246,0.9)",
    accent: "rgba(165,180,252,0.6)",
    soft: "rgba(79,70,229,0.7)",
  },
  webflow: {
    primary: "rgba(67,97,238,1)",
    secondary: "rgba(99,102,241,0.9)",
    accent: "rgba(165,180,252,0.6)",
    soft: "rgba(49,46,129,0.7)",
  },
  canva: {
    primary: "rgba(0,196,204,1)",
    secondary: "rgba(34,211,238,0.9)",
    accent: "rgba(103,232,249,0.6)",
    soft: "rgba(6,182,212,0.7)",
  },
  samsung: {
    primary: "rgba(20,33,112,1)",
    secondary: "rgba(30,64,175,0.9)",
    accent: "rgba(96,165,250,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  sony: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(38,38,38,0.9)",
    accent: "rgba(115,115,115,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  lg: {
    primary: "rgba(200,0,80,1)",
    secondary: "rgba(236,72,153,0.9)",
    accent: "rgba(244,114,182,0.6)",
    soft: "rgba(190,24,93,0.7)",
  },
  huawei: {
    primary: "rgba(207,0,0,1)",
    secondary: "rgba(220,38,38,0.9)",
    accent: "rgba(248,113,113,0.6)",
    soft: "rgba(127,29,29,0.7)",
  },
  xiaomi: {
    primary: "rgba(255,103,0,1)",
    secondary: "rgba(251,146,60,0.9)",
    accent: "rgba(253,186,116,0.6)",
    soft: "rgba(194,65,12,0.7)",
  },
  oneplus: {
    primary: "rgba(255,0,0,1)",
    secondary: "rgba(220,38,38,0.9)",
    accent: "rgba(248,113,113,0.6)",
    soft: "rgba(127,29,29,0.7)",
  },
  paypal: {
    primary: "rgba(0,48,135,1)",
    secondary: "rgba(37,99,235,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  visa: {
    primary: "rgba(26,31,113,1)",
    secondary: "rgba(59,130,246,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  mastercard: {
    primary: "rgba(255,95,0,1)",
    secondary: "rgba(239,68,68,0.9)",
    accent: "rgba(251,146,60,0.6)",
    soft: "rgba(154,52,18,0.7)",
  },
  ibm: {
    primary: "rgba(5,90,156,1)",
    secondary: "rgba(37,99,235,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  hp: {
    primary: "rgba(0,112,186,1)",
    secondary: "rgba(14,165,233,0.9)",
    accent: "rgba(125,211,252,0.6)",
    soft: "rgba(3,105,161,0.7)",
  },
  dell: {
    primary: "rgba(0,102,179,1)",
    secondary: "rgba(59,130,246,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  lenovo: {
    primary: "rgba(224,0,0,1)",
    secondary: "rgba(220,38,38,0.9)",
    accent: "rgba(248,113,113,0.6)",
    soft: "rgba(127,29,29,0.7)",
  },
  asus: {
    primary: "rgba(0,102,204,1)",
    secondary: "rgba(37,99,235,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  acer: {
    primary: "rgba(131,194,37,1)",
    secondary: "rgba(163,230,53,0.9)",
    accent: "rgba(217,249,157,0.6)",
    soft: "rgba(63,98,18,0.7)",
  },
  qualcomm: {
    primary: "rgba(0,102,204,1)",
    secondary: "rgba(59,130,246,0.9)",
    accent: "rgba(147,197,253,0.6)",
    soft: "rgba(30,58,138,0.7)",
  },
  arm: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(64,64,64,0.9)",
    accent: "rgba(163,163,163,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  unity: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(38,38,38,0.9)",
    accent: "rgba(115,115,115,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  unreal: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(38,38,38,0.9)",
    accent: "rgba(115,115,115,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  epic: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(64,64,64,0.9)",
    accent: "rgba(163,163,163,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
  roblox: {
    primary: "rgba(255,0,0,1)",
    secondary: "rgba(220,38,38,0.9)",
    accent: "rgba(248,113,113,0.6)",
    soft: "rgba(127,29,29,0.7)",
  },
  discord: {
    primary: "rgba(88,101,242,1)",
    secondary: "rgba(99,102,241,0.9)",
    accent: "rgba(165,180,252,0.6)",
    soft: "rgba(49,46,129,0.7)",
  },
  telegram: {
    primary: "rgba(0,136,204,1)",
    secondary: "rgba(56,189,248,0.9)",
    accent: "rgba(125,211,252,0.6)",
    soft: "rgba(3,105,161,0.7)",
  },
  whatsapp: {
    primary: "rgba(37,211,102,1)",
    secondary: "rgba(34,197,94,0.9)",
    accent: "rgba(134,239,172,0.6)",
    soft: "rgba(22,101,52,0.7)",
  },
  snapchat: {
    primary: "rgba(255,252,0,1)",
    secondary: "rgba(250,204,21,0.9)",
    accent: "rgba(254,240,138,0.6)",
    soft: "rgba(161,98,7,0.7)",
  },
  pinterest: {
    primary: "rgba(230,0,35,1)",
    secondary: "rgba(220,38,38,0.9)",
    accent: "rgba(248,113,113,0.6)",
    soft: "rgba(127,29,29,0.7)",
  },
  reddit: {
    primary: "rgba(255,69,0,1)",
    secondary: "rgba(249,115,22,0.9)",
    accent: "rgba(253,186,116,0.6)",
    soft: "rgba(154,52,18,0.7)",
  },
  quora: {
    primary: "rgba(185,43,39,1)",
    secondary: "rgba(220,38,38,0.9)",
    accent: "rgba(248,113,113,0.6)",
    soft: "rgba(127,29,29,0.7)",
  },
  medium: {
    primary: "rgba(0,0,0,1)",
    secondary: "rgba(38,38,38,0.9)",
    accent: "rgba(115,115,115,0.6)",
    soft: "rgba(255,255,255,0.2)",
  },
} as const satisfies Record<string, CompanyGlowColors>;

export type CompanyGlowMapKey = keyof typeof companyGlowMap;

/** Canonical PascalCase keys used for matching (order preserved). Adobe omitted so employer context doesn’t trigger themed chrome. */
const COMPANY_KEYS = [
  "Apple",
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Netflix",
  "Spotify",
  "Uber",
  "Airbnb",
  "Figma",
  "Notion",
  "Slack",
  "Dropbox",
  "Atlassian",
  "Salesforce",
  "Shopify",
  "Stripe",
  "NVIDIA",
  "Intel",
  "Oracle",
  "SAP",
  "Cisco",
  "Zoom",
  "TikTok",
  "YouTube",
  "GitHub",
  "Vercel",
  "Linear",
  "Webflow",
  "Canva",
  "Samsung",
  "Sony",
  "LG",
  "Huawei",
  "Xiaomi",
  "OnePlus",
  "PayPal",
  "Visa",
  "Mastercard",
  "IBM",
  "HP",
  "Dell",
  "Lenovo",
  "Asus",
  "Acer",
  "Qualcomm",
  "ARM",
  "Unity",
  "Unreal",
  "Epic",
  "Roblox",
  "Discord",
  "Telegram",
  "WhatsApp",
  "Snapchat",
  "Pinterest",
  "Reddit",
  "Quora",
  "Medium",
] as const;

export type KnownCompany = (typeof COMPANY_KEYS)[number];

export interface ResolvedCompanyGlow {
  glow: CompanyGlowStyle;
  /** True when a known company name was found in `text` (not the neutral fallback). */
  matched: boolean;
  /** Which company key matched (for theming); null if none. */
  matchedCompany: KnownCompany | null;
}

/** Longer names first so e.g. "Microsoft" wins over a hypothetical shorter key. */
const KEYS_BY_LENGTH_DESC = [...COMPANY_KEYS].sort((a, b) => b.length - a.length);

function knownCompanyToMapKey(company: KnownCompany): CompanyGlowMapKey {
  return company.toLowerCase() as CompanyGlowMapKey;
}

/** primary = core, secondary = inner, accent = outer, soft = ambient tail */
export function buildRadialGradientFromColors(c: CompanyGlowColors): string {
  return `radial-gradient(circle at 50% 50%, ${c.primary} 0%, ${c.secondary} 35%, ${c.accent} 60%, ${c.soft} 85%, transparent 100%)`;
}

function colorsToStyle(colors: CompanyGlowColors, blur: number, opacity: number): CompanyGlowStyle {
  return {
    ...colors,
    gradient: buildRadialGradientFromColors(colors),
    blur,
    opacity,
  };
}

/** Per-company blur/opacity tweaks (optional visual variety). */
const BLUR_BY_COMPANY: Partial<Record<KnownCompany, number>> = {
  Netflix: 110,
  Spotify: 105,
  Slack: 108,
};

const OPACITY_BY_COMPANY: Partial<Record<KnownCompany, number>> = {
  Uber: 0.72,
  Notion: 0.7,
};

export const COMPANY_GLOW_MAP: Record<KnownCompany, CompanyGlowStyle> = Object.fromEntries(
  COMPANY_KEYS.map((key) => {
    const colors = companyGlowMap[knownCompanyToMapKey(key)];
    const blur = BLUR_BY_COMPANY[key] ?? 100;
    const opacity = OPACITY_BY_COMPANY[key] ?? 0.68;
    return [key, colorsToStyle(colors, blur, opacity)];
  }),
) as Record<KnownCompany, CompanyGlowStyle>;

/** Neutral violet / indigo when no company matches. */
export const FALLBACK_COMPANY_GLOW: CompanyGlowStyle = {
  primary: "rgba(139, 92, 246, 0.7)",
  secondary: "rgba(99, 102, 241, 0.55)",
  accent: "rgba(167, 139, 250, 0.45)",
  soft: "rgba(99, 102, 241, 0.2)",
  gradient:
    "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.65) 0%, rgba(99, 102, 241, 0.45) 40%, rgba(167, 139, 250, 0.25) 70%, rgba(99, 102, 241, 0.12) 88%, transparent 100%)",
  blur: 100,
  opacity: 0.65,
};

/** Same alpha envelope as the default search ring (teal / cyan / violet). */
const SEARCH_RING_ALPHAS = [0.9, 0.95, 0.9] as const;

/** Same subtlety as default hover halos (0.12 / 0.06). */
const SEARCH_HOVER_HALO_ALPHAS = [0.12, 0.06] as const;

function rgbaWithAlpha(color: string, alpha: number): string {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)/);
  if (!m) return color;
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`;
}

/**
 * Reply-card edge ring: 8-stop conic with soft color bridging between quadrant hues
 * so the border does not read as harsh banding.
 */
export function buildReplyCardConicGradient(g: CompanyGlowColors): string {
  const { primary: a, secondary: b, accent: c, soft: d } = g;
  const pa = rgbaWithAlpha(a, 0.34);
  const pb = rgbaWithAlpha(b, 0.34);
  const pc = rgbaWithAlpha(c, 0.34);
  const pd = rgbaWithAlpha(d, 0.4);
  const bridge = rgbaWithAlpha(d, 0.3);
  return `conic-gradient(from 0deg, ${pa} 0deg, ${bridge} 45deg, ${pb} 90deg, ${bridge} 135deg, ${pc} 180deg, ${bridge} 225deg, ${pd} 270deg, ${bridge} 315deg, ${pa} 360deg)`;
}

/** Teal / cyan / violet / indigo for default reply ring (matches no-company chat theme). */
const DEFAULT_REPLY_RING: CompanyGlowColors = {
  primary: "rgba(20, 184, 166, 1)",
  secondary: "rgba(56, 189, 248, 1)",
  accent: "rgba(139, 92, 246, 1)",
  soft: "rgba(99, 102, 241, 0.35)",
};

/** Default chat accent tokens (teal / cyan / violet) — used when no company matches. */
export const DEFAULT_CHAT_THEME: Record<string, string> = {
  "--chat-reply-conic": buildReplyCardConicGradient(DEFAULT_REPLY_RING),
  "--chat-search-conic":
    "conic-gradient(from 0deg, transparent 0deg, transparent 250deg, rgba(20, 184, 166, 0.9) 270deg, rgba(56, 189, 248, 0.95) 300deg, rgba(139, 92, 246, 0.9) 330deg, transparent 360deg)",
  "--chat-search-hover-border": "rgba(56, 189, 248, 0.45)",
  "--chat-search-hover-glow-1": "0 0 24px rgba(56, 189, 248, 0.12)",
  "--chat-search-hover-glow-2": "0 0 48px rgba(139, 92, 246, 0.06)",
  "--chat-search-hover-icon": "rgba(56, 189, 248, 0.75)",
  "--chat-search-focus-shadow": "0 0 32px rgba(59, 130, 246, 0.08)",
  "--chat-connector": "rgba(56, 189, 248, 0.4)",
  "--chat-generating-dot": "var(--accent-electric-blue)",
  "--chat-badge-dot": "#34d399",
  "--chat-thread-hover-color": "var(--accent-electric-blue)",
  "--chat-thread-hover-border": "rgba(34, 211, 238, 0.35)",
  "--chat-suggestion-pill-hover-border": "rgba(255, 255, 255, 0.2)",
};

/**
 * Low-opacity diagonal sweep band across the search field — plays on company detect before full theme commit.
 */
export function buildCompanySweepGradient(g: CompanyGlowColors): string {
  return `linear-gradient(105deg, transparent 0%, ${rgbaWithAlpha(g.primary, 0.2)} 28%, ${rgbaWithAlpha(g.accent, 0.22)} 50%, ${rgbaWithAlpha(g.secondary, 0.18)} 72%, transparent 100%)`;
}

/** Softer, wider gradient for the blurred halo behind the sweep band. */
export function buildCompanySweepHaloGradient(g: CompanyGlowColors): string {
  return `linear-gradient(105deg, transparent 0%, ${rgbaWithAlpha(g.primary, 0.35)} 35%, ${rgbaWithAlpha(g.accent, 0.32)} 52%, ${rgbaWithAlpha(g.secondary, 0.28)} 72%, transparent 100%)`;
}

/**
 * CSS custom properties for chat chrome (search ring, reply border, thread nav, etc.).
 * Pass `null` to use {@link DEFAULT_CHAT_THEME} (teal/cyan/violet).
 */
export function getChatThemeVariables(matchedCompany: KnownCompany | null): Record<string, string> {
  if (!matchedCompany) {
    return { ...DEFAULT_CHAT_THEME };
  }
  const g = companyGlowMap[knownCompanyToMapKey(matchedCompany)];
  const { primary: a, secondary: b, accent: c } = g;
  const [ra, rb, rc] = SEARCH_RING_ALPHAS;
  const [ha, hb] = SEARCH_HOVER_HALO_ALPHAS;
  return {
    ...DEFAULT_CHAT_THEME,
    "--chat-reply-conic": buildReplyCardConicGradient(g),
    "--chat-search-conic": `conic-gradient(from 0deg, transparent 0deg, transparent 250deg, ${rgbaWithAlpha(a, ra)} 270deg, ${rgbaWithAlpha(b, rb)} 300deg, ${rgbaWithAlpha(c, rc)} 330deg, transparent 360deg)`,
    "--chat-search-hover-border": b,
    "--chat-search-hover-glow-1": `0 0 24px ${rgbaWithAlpha(a, ha)}`,
    "--chat-search-hover-glow-2": `0 0 48px ${rgbaWithAlpha(c, hb)}`,
    "--chat-search-hover-icon": b,
    "--chat-connector": b,
    "--chat-generating-dot": b,
    "--chat-badge-dot": a,
    "--chat-thread-hover-color": b,
    "--chat-thread-hover-border": c,
    "--chat-suggestion-pill-hover-border": b,
  };
}

/**
 * Resolve glow for a company name fragment (case-insensitive).
 * Matches the longest known company substring contained in `companyName` (e.g. "Microsoft Corp." → Microsoft).
 */
export function getCompanyGlow(companyName: string): CompanyGlowStyle {
  const n = companyName.trim().toLowerCase();
  if (!n) return FALLBACK_COMPANY_GLOW;

  for (const key of KEYS_BY_LENGTH_DESC) {
    if (n.includes(key.toLowerCase())) {
      return COMPANY_GLOW_MAP[key];
    }
  }
  return FALLBACK_COMPANY_GLOW;
}

/**
 * Scan free-form user input; the **last** mentioned company in the string wins.
 * Case-insensitive; uses substring match for known company names.
 */
export function resolveCompanyGlowFromUserInput(text: string): ResolvedCompanyGlow {
  const lower = text.toLowerCase();
  let bestKey: KnownCompany | null = null;
  let bestLastIndex = -1;

  for (const key of KEYS_BY_LENGTH_DESC) {
    const kl = key.toLowerCase();
    const idx = lower.lastIndexOf(kl);
    if (idx !== -1 && idx >= bestLastIndex) {
      bestLastIndex = idx;
      bestKey = key;
    }
  }

  if (bestKey) {
    return { glow: COMPANY_GLOW_MAP[bestKey], matched: true, matchedCompany: bestKey };
  }
  return { glow: FALLBACK_COMPANY_GLOW, matched: false, matchedCompany: null };
}

/**
 * Chat theme / combined preview: **query** first (what the user is typing), then **user**
 * messages newest-first. Assistant text is never used — avoids a reply that mentions
 * “Google” overriding “Microsoft” in the input.
 */
export function resolveCompanyGlowForChatInput(
  query: string,
  conversationHistory: readonly { role: string; content: string }[],
): ResolvedCompanyGlow {
  const q = query.trim();
  if (q) {
    const fromQuery = resolveCompanyGlowFromUserInput(q);
    if (fromQuery.matched) return fromQuery;
  }
  const users = conversationHistory.filter((m) => m.role === "user");
  for (let i = users.length - 1; i >= 0; i--) {
    const r = resolveCompanyGlowFromUserInput(users[i].content);
    if (r.matched) return r;
  }
  return { glow: FALLBACK_COMPANY_GLOW, matched: false, matchedCompany: null };
}

/**
 * Company used to frame AI chat: prefers the committed theme (post-sweep), otherwise
 * resolves from all user message text in the thread.
 */
export function getChatCompanyContext(
  appliedCommit: KnownCompany | null,
  userMessages: readonly { content: string }[],
  customizationDismissed?: boolean,
): KnownCompany | null {
  if (customizationDismissed) return null;
  if (appliedCommit) return appliedCommit;
  for (let i = userMessages.length - 1; i >= 0; i--) {
    const r = resolveCompanyGlowFromUserInput(userMessages[i].content);
    if (r.matched) return r.matchedCompany;
  }
  return null;
}

/**
 * Same as {@link resolveCompanyGlowFromUserInput} but returns only the style (fallback when no match).
 */
export function getCompanyGlowFromUserInput(text: string): CompanyGlowStyle {
  return resolveCompanyGlowFromUserInput(text).glow;
}
