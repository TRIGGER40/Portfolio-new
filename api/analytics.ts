import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const POSTHOG_HOST = process.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";
const POSTHOG_PERSONAL_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

function getOpenAiApiKey(): string | undefined {
  return (process.env.OPENAI_API_KEY?.trim() || process.env.OPENAI_KEY?.trim()) || undefined;
}

interface HogQLResult {
  results: unknown[][];
  columns: string[];
}

async function hogqlQuery(query: string): Promise<HogQLResult> {
  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${POSTHOG_PERSONAL_KEY}`,
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PostHog API ${res.status}: ${text}`);
  }
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!POSTHOG_PERSONAL_KEY || !POSTHOG_PROJECT_ID) {
    return res.status(500).json({
      error: "PostHog personal API key or project ID not configured",
      fallback: true,
    });
  }

  try {
    // Run all queries in parallel
    const [
      sessionsResult,
      avgDurationResult,
      caseStudyOpensResult,
      contactClicksResult,
      deviceSplitResult,
      topCaseStudiesResult,
      contactTypesResult,
      chatStartsResult,
      sectionViewsResult,
      scrollDepthResult,
      funnelResult,
      dailySessionsResult,
      geoResult,
    ] = await Promise.all([
      // 1. Total sessions (unique session_ids) last 30 days
      hogqlQuery(`
        SELECT count(DISTINCT "$session_id")
        FROM events
        WHERE timestamp >= now() - interval 30 day
          AND "$session_id" IS NOT NULL
          AND "$session_id" != ''
      `),

      // 2. Avg session duration (seconds)
      hogqlQuery(`
        SELECT avg(duration) FROM (
          SELECT "$session_id",
            dateDiff('second', min(timestamp), max(timestamp)) as duration
          FROM events
          WHERE timestamp >= now() - interval 30 day
            AND "$session_id" IS NOT NULL
            AND "$session_id" != ''
          GROUP BY "$session_id"
          HAVING duration > 0
        )
      `),

      // 3. Case study opens
      hogqlQuery(`
        SELECT count()
        FROM events
        WHERE event = 'case_study_open'
          AND timestamp >= now() - interval 30 day
      `),

      // 4. Contact clicks
      hogqlQuery(`
        SELECT count()
        FROM events
        WHERE event = 'contact_click'
          AND timestamp >= now() - interval 30 day
      `),

      // 5. Device type split
      hogqlQuery(`
        SELECT
          properties.device_type as device,
          count(DISTINCT "$session_id") as sessions
        FROM events
        WHERE timestamp >= now() - interval 30 day
          AND "$session_id" IS NOT NULL
          AND "$session_id" != ''
        GROUP BY device
        ORDER BY sessions DESC
      `),

      // 6. Top case studies by views
      hogqlQuery(`
        SELECT
          properties.title as title,
          properties.company as company,
          count() as views
        FROM events
        WHERE event = 'case_study_open'
          AND timestamp >= now() - interval 30 day
        GROUP BY title, company
        ORDER BY views DESC
        LIMIT 10
      `),

      // 7. Contact click types
      hogqlQuery(`
        SELECT
          properties.type as contact_type,
          count() as clicks
        FROM events
        WHERE event = 'contact_click'
          AND timestamp >= now() - interval 30 day
        GROUP BY contact_type
        ORDER BY clicks DESC
      `),

      // 8. Chat starts
      hogqlQuery(`
        SELECT count()
        FROM events
        WHERE event = 'chat_start'
          AND timestamp >= now() - interval 30 day
      `),

      // 9. Section views
      hogqlQuery(`
        SELECT
          properties.section as section,
          count() as views
        FROM events
        WHERE event = 'section_view'
          AND timestamp >= now() - interval 30 day
        GROUP BY section
        ORDER BY views DESC
      `),

      // 10. Scroll depth distribution
      hogqlQuery(`
        SELECT
          properties.depth_percent as depth,
          count(DISTINCT "$session_id") as sessions
        FROM events
        WHERE event = 'scroll_depth'
          AND timestamp >= now() - interval 30 day
        GROUP BY depth
        ORDER BY depth ASC
      `),

      // 11. Funnel-like: sessions reaching each stage
      hogqlQuery(`
        SELECT
          count(DISTINCT "$session_id") as total_sessions,
          count(DISTINCT if(event = 'section_view', "$session_id", NULL)) as scrolled_past_hero,
          count(DISTINCT if(event = 'case_study_open', "$session_id", NULL)) as opened_case_study,
          count(DISTINCT if(event = 'contact_click', "$session_id", NULL)) as clicked_contact
        FROM events
        WHERE timestamp >= now() - interval 30 day
          AND "$session_id" IS NOT NULL
          AND "$session_id" != ''
      `),

      // 12. Daily sessions for sparkline
      hogqlQuery(`
        SELECT
          toDate(timestamp) as day,
          count(DISTINCT "$session_id") as sessions
        FROM events
        WHERE timestamp >= now() - interval 30 day
          AND "$session_id" IS NOT NULL
          AND "$session_id" != ''
        GROUP BY day
        ORDER BY day ASC
      `),

      // 13. Geo traffic — city-level with lat/lng
      hogqlQuery(`
        SELECT
          properties.$geoip_city_name as city,
          properties.$geoip_country_name as country,
          properties.$geoip_latitude as lat,
          properties.$geoip_longitude as lng,
          count(DISTINCT "$session_id") as sessions
        FROM events
        WHERE timestamp >= now() - interval 30 day
          AND "$session_id" IS NOT NULL
          AND "$session_id" != ''
          AND properties.$geoip_latitude IS NOT NULL
        GROUP BY city, country, lat, lng
        ORDER BY sessions DESC
        LIMIT 50
      `),
    ]);

    // Previous 30 days for comparison
    const [prevSessions, prevCaseStudy, prevContact] = await Promise.all([
      hogqlQuery(`
        SELECT count(DISTINCT "$session_id")
        FROM events
        WHERE timestamp >= now() - interval 60 day
          AND timestamp < now() - interval 30 day
          AND "$session_id" IS NOT NULL
          AND "$session_id" != ''
      `),
      hogqlQuery(`
        SELECT count()
        FROM events
        WHERE event = 'case_study_open'
          AND timestamp >= now() - interval 60 day
          AND timestamp < now() - interval 30 day
      `),
      hogqlQuery(`
        SELECT count()
        FROM events
        WHERE event = 'contact_click'
          AND timestamp >= now() - interval 60 day
          AND timestamp < now() - interval 30 day
      `),
    ]);

    const toNum = (r: HogQLResult) => Number(r.results?.[0]?.[0] ?? 0);
    const delta = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100%" : "0%";
      const pct = Math.round(((curr - prev) / prev) * 100);
      return `${pct >= 0 ? "+" : ""}${pct}%`;
    };

    const totalSessions = toNum(sessionsResult);
    const avgDuration = toNum(avgDurationResult);
    const caseStudyOpens = toNum(caseStudyOpensResult);
    const contactClicks = toNum(contactClicksResult);
    const prevTotalSessions = toNum(prevSessions);
    const prevCaseStudyOpens = toNum(prevCaseStudy);
    const prevContactClicks = toNum(prevContact);

    const mins = Math.floor(avgDuration / 60);
    const secs = Math.round(avgDuration % 60);

    const data = {
      summary: [
        {
          label: "Total Sessions",
          value: totalSessions.toLocaleString(),
          delta: delta(totalSessions, prevTotalSessions),
          up: totalSessions >= prevTotalSessions,
        },
        {
          label: "Avg. Session Duration",
          value: `${mins}m ${secs}s`,
          delta: "—",
          up: true,
        },
        {
          label: "Case Study Opens",
          value: caseStudyOpens.toLocaleString(),
          delta: delta(caseStudyOpens, prevCaseStudyOpens),
          up: caseStudyOpens >= prevCaseStudyOpens,
        },
        {
          label: "Contact Clicks",
          value: contactClicks.toLocaleString(),
          delta: delta(contactClicks, prevContactClicks),
          up: contactClicks >= prevContactClicks,
        },
      ],

      deviceSplit: (deviceSplitResult.results || []).map((r) => ({
        device: String(r[0] || "unknown"),
        sessions: Number(r[1] || 0),
      })),

      topCaseStudies: (topCaseStudiesResult.results || []).map((r) => ({
        title: String(r[0] || ""),
        company: String(r[1] || ""),
        views: Number(r[2] || 0),
      })),

      contactTypes: (contactTypesResult.results || []).map((r) => ({
        type: String(r[0] || ""),
        clicks: Number(r[1] || 0),
      })),

      chatStarts: toNum(chatStartsResult),

      sectionViews: (sectionViewsResult.results || []).map((r) => ({
        section: String(r[0] || ""),
        views: Number(r[1] || 0),
      })),

      scrollDepth: (scrollDepthResult.results || []).map((r) => ({
        depth: Number(r[0] || 0),
        sessions: Number(r[1] || 0),
      })),

      funnel: (() => {
        const row = funnelResult.results?.[0] || [];
        const total = Number(row[0] || 0);
        const scrolled = Number(row[1] || 0);
        const opened = Number(row[2] || 0);
        const contacted = Number(row[3] || 0);
        return [
          { label: "Landing", value: total, pct: 100 },
          { label: "Scrolled past hero", value: scrolled, pct: total ? Math.round((scrolled / total) * 100) : 0 },
          { label: "Opened a case study", value: opened, pct: total ? Math.round((opened / total) * 100) : 0 },
          { label: "Clicked Contact / Resume", value: contacted, pct: total ? Math.round((contacted / total) * 100) : 0 },
        ];
      })(),

      dailySessions: (dailySessionsResult.results || []).map((r) => ({
        day: String(r[0] || ""),
        sessions: Number(r[1] || 0),
      })),

      geoTraffic: (geoResult.results || []).map((r) => ({
        city: String(r[0] || "Unknown"),
        country: String(r[1] || "Unknown"),
        lat: Number(r[2] || 0),
        lng: Number(r[3] || 0),
        sessions: Number(r[4] || 0),
      })),

      generatedAt: new Date().toISOString(),
    };

    // ── Run data through OpenAI for AI-generated insights ──
    let aiAnalysis = null;
    const openaiKey = getOpenAiApiKey();
    if (openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });

        const dataSnapshot = JSON.stringify({
          totalSessions,
          avgDurationSeconds: avgDuration,
          caseStudyOpens,
          contactClicks,
          prevTotalSessions,
          prevCaseStudyOpens,
          prevContactClicks,
          chatStarts: data.chatStarts,
          deviceSplit: data.deviceSplit,
          topCaseStudies: data.topCaseStudies,
          contactTypes: data.contactTypes,
          sectionViews: data.sectionViews,
          scrollDepth: data.scrollDepth,
          funnel: data.funnel,
        }, null, 2);

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a senior UX researcher and product analyst reviewing a design portfolio website's analytics data. The portfolio belongs to a senior product designer (Midhun Krishnakumar) with experience at Adobe, Bizongo, and YUJ Designs.

The portfolio has these sections: Hero (with AI chat), Impact Dashboard, Experience Timeline, Case Studies, Honors/Awards, ThoughtLayer (articles), Testimonials, and a Recruiter Panel (contact/resume/linkedin).

Analyze the provided 30-day analytics data and return a JSON object with exactly this structure:
{
  "insights": [
    { "title": "...", "body": "...", "evidence": "..." }
  ],
  "problems": [
    { "title": "...", "body": "...", "rootCause": "...", "priority": "high|medium|low" }
  ],
  "recommendations": [
    { "title": "...", "body": "...", "impact": "..." }
  ]
}

Rules:
- Return EXACTLY 3 insights, 3 problems, and 3 recommendations
- Be extremely specific — reference actual numbers from the data
- Focus on: case study engagement, drop-offs, recruiter intent (contact clicks), mobile vs desktop split, storytelling effectiveness
- Problems should identify the single biggest conversion killer, the biggest mobile issue, and the biggest missed opportunity
- Recommendations must be actionable and specific to THIS portfolio — no generic advice
- Each recommendation should include a projected impact estimate
- If data is sparse (early days of tracking), acknowledge this but still provide directional insights based on what patterns are visible
- Write in a confident, analytical tone — like a UX researcher presenting to a product team`
            },
            {
              role: "user",
              content: `Here is the 30-day analytics data for the portfolio:\n\n${dataSnapshot}`
            }
          ],
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          aiAnalysis = JSON.parse(content);
        }
      } catch (aiErr) {
        console.error("OpenAI analysis error:", aiErr);
        // Non-fatal — we still return data without AI insights
      }
    }

    const finalData = {
      ...data,
      aiAnalysis,
    };

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(finalData);
  } catch (err) {
    console.error("Analytics API error:", err);
    return res.status(500).json({
      error: String(err),
      fallback: true,
    });
  }
}
