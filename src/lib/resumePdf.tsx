import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import {
  EXPERIENCE_TIMELINE,
  CASE_STUDIES,
  AWARDS,
  IMPACT_METRICS,
  CONTACT,
  MENTORSHIP,
} from "../data/portfolioData";

/* ── Constants ── */
const SITE = "https://www.midhunkrishnakumar.info";
const PORTFOLIO = "https://midhun-portfolio-ai.vercel.app";

const EDUCATION = [
  {
    degree: "Bachelor of Design (B.Des)",
    school: "National Institute of Design (NID - Andhra Pradesh)",
    period: "2015 – 2019",
    focus: "Industrial Design — UI/UX, Product Design, Design Business",
  },
  {
    degree: "Sainik School Kazhakootam",
    school: "Kerala, India",
    period: "2012 – 2014",
    focus: "Programming, Algorithms, Computing Fundamentals",
  },
];

const SKILLS = {
  design: [
    "Product Design",
    "UX Strategy",
    "Interaction Design",
    "Information Architecture",
    "Design Systems",
    "Prototyping",
    "Visual Design",
    "User Research",
  ],
  tools: [
    "Figma",
    "Adobe XD",
    "Framer",
    "Principle",
    "Adobe Creative Suite",
    "Miro",
    "FigJam",
    "Claude Code",
    "Cursor",
    "Google Stitch",
    "NanoBanana",
  ],
  domains: [
    "Enterprise UX",
    "AI / Gen-AI Products",
    "B2B & B2C Platforms",
    "Real-time Collaboration",
    "SaaS",
    "E-Commerce",
  ],
  soft: [
    "Design Leadership",
    "Stakeholder Management",
    "Cross-functional Collaboration",
    "Mentorship",
    "Design Thinking",
  ],
};

const RESUME_EXP = EXPERIENCE_TIMELINE.filter((e) =>
  ["adobe", "yuj", "bizongo", "adobe-xd-intern"].includes(e.id)
);
const KEY_PROJECTS = CASE_STUDIES.filter(
  (c) => c.metrics && c.metrics.length > 0
).slice(0, 6);
const TOP_AWARDS = AWARDS.slice(0, 6);

/* ── Colours ── */
const C = {
  bg: "#FFFFFF",
  text: "#1a1a1a",
  textMed: "#444444",
  textLight: "#777777",
  textMuted: "#999999",
  accent: "#111111",
  border: "#e0e0e0",
  borderLight: "#eeeeee",
  tagBg: "#f5f5f5",
  cardBg: "#fafafa",
  link: "#0055cc",
  arrow: "#555555",
};

/* ── Styles ── */
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.text,
    backgroundColor: C.bg,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
  },

  /* Header */
  header: { alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.accent, marginBottom: 3 },
  titleText: { fontSize: 10, color: C.textLight, marginBottom: 8 },
  contactRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  contactLink: { fontSize: 8, color: C.link, textDecoration: "none" },
  contactDot: { fontSize: 8, color: C.textMuted },

  /* Sections */
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: C.textMuted,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderLight,
  },

  /* Summary */
  summaryText: { fontSize: 9, lineHeight: 1.65, color: C.textMed },

  /* Experience */
  expEntry: { marginBottom: 12 },
  expHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  expRole: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.accent },
  expCompany: { fontSize: 8.5, color: C.textLight, marginTop: 1 },
  expPeriod: { fontSize: 8, color: C.textMuted },
  expSummary: { fontSize: 8.5, lineHeight: 1.5, color: C.textMed, marginTop: 3, marginBottom: 4 },
  expBullet: { flexDirection: "row", marginBottom: 2, paddingLeft: 6 },
  expBulletDash: { fontSize: 8.5, color: C.textMuted, width: 8 },
  expBulletText: { fontSize: 8.5, lineHeight: 1.45, color: C.textMed, flex: 1 },
  expLink: { fontSize: 7.5, color: C.link, textDecoration: "none", marginTop: 3 },

  /* Metrics grid */
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metricBox: {
    width: "23%",
    padding: 7,
    backgroundColor: C.cardBg,
    borderWidth: 0.5,
    borderColor: C.borderLight,
    borderRadius: 4,
  },
  metricValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.accent, marginBottom: 2 },
  metricLabel: { fontSize: 7.5, color: C.textMed, lineHeight: 1.3 },
  metricContext: { fontSize: 6.5, color: C.textMuted, marginTop: 2 },

  /* Projects */
  projectsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  projectCard: {
    width: "48%",
    padding: 8,
    backgroundColor: C.cardBg,
    borderWidth: 0.5,
    borderColor: C.borderLight,
    borderRadius: 4,
    marginBottom: 2,
  },
  projectCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 },
  projectTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.accent },
  projectCompany: { fontSize: 7, color: C.textMuted },
  projectDesc: { fontSize: 7.5, lineHeight: 1.4, color: C.textMed, marginBottom: 4 },
  projectMetricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  projectMetricTag: { fontSize: 7, backgroundColor: C.tagBg, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 3, color: C.textMed },
  projectLink: { fontSize: 7, color: C.link, textDecoration: "none", marginTop: 4 },

  /* Skills */
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillGroup: { width: "46%", marginBottom: 6 },
  skillGroupTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.textLight, marginBottom: 4 },
  skillTagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 3 },
  skillTag: { fontSize: 7.5, backgroundColor: C.tagBg, paddingVertical: 2, paddingHorizontal: 5, borderRadius: 3, color: C.textMed },

  /* Education */
  eduEntry: { marginBottom: 8 },
  eduHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1 },
  eduDegree: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: C.accent },
  eduSchool: { fontSize: 8, color: C.textLight, marginTop: 1 },
  eduPeriod: { fontSize: 8, color: C.textMuted },
  eduFocus: { fontSize: 8, color: C.textMed, marginTop: 2 },

  /* Awards */
  awardsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  awardBox: {
    width: "48%",
    padding: 6,
    backgroundColor: C.cardBg,
    borderWidth: 0.5,
    borderColor: C.borderLight,
    borderRadius: 4,
  },
  awardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 },
  awardTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.accent },
  awardDate: { fontSize: 7, color: C.textMuted },
  awardIssuer: { fontSize: 7.5, color: C.textLight },

  /* Mentorship */
  mentorEntry: { marginBottom: 8 },
  mentorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1 },
  mentorRole: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.accent },
  mentorOrg: { fontSize: 8, color: C.textLight, marginTop: 1 },
  mentorPeriod: { fontSize: 8, color: C.textMuted },
  mentorDesc: { fontSize: 8.5, lineHeight: 1.45, color: C.textMed, marginTop: 2 },

  /* Footer */
  footer: { marginTop: 16, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: C.borderLight, alignItems: "center" },
  footerText: { fontSize: 7, color: C.textMuted },
  footerLink: { fontSize: 7, color: C.link, textDecoration: "none" },
});

/* ── Helpers ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function getProjectUrl(id: string) {
  return `${PORTFOLIO}/project/${id}`;
}

function getWorksUrl(companyId: string) {
  return `${PORTFOLIO}/works/${companyId}`;
}

/* ── PDF Document ── */
function ResumeDocument() {
  return (
    <Document>
      {/* Page 1 — Header, Summary, Experience */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.name}>Midhun Krishnakumar</Text>
          <Text style={s.titleText}>Product Designer · AI-first Design · Enterprise UX</Text>
          <View style={s.contactRow}>
            <Link src={`mailto:${CONTACT.email}`} style={s.contactLink}>
              {CONTACT.email}
            </Link>
            <Text style={s.contactDot}>·</Text>
            <Link src={CONTACT.linkedin} style={s.contactLink}>
              linkedin.com/in/midhunkrishnakumar
            </Link>
            <Text style={s.contactDot}>·</Text>
            <Link src={PORTFOLIO} style={s.contactLink}>
              Portfolio
            </Link>
          </View>
        </View>

        {/* Summary */}
        <Section title="Summary">
          <Text style={s.summaryText}>
            Product Designer with 6+ years of experience driving AI-first innovation, enterprise UX strategy,
            and design systems at scale. Currently leading design for Adobe Connect — a collaboration platform
            serving millions of users globally. Proven track record of shipping high-impact features that reduce
            friction by 50%, boost engagement by 35%, and cut operational costs by 80%. NID Ahmedabad alumnus
            with deep expertise across B2B, B2C, and AI product domains.
          </Text>
        </Section>

        {/* Experience */}
        <Section title="Experience">
          {RESUME_EXP.map((exp) => (
            <View key={exp.id} style={s.expEntry} wrap={false}>
              <View style={s.expHeader}>
                <View>
                  <Text style={s.expRole}>{exp.role}</Text>
                  <Text style={s.expCompany}>{exp.company}</Text>
                </View>
                <Text style={s.expPeriod}>{exp.period}</Text>
              </View>
              {exp.summary && <Text style={s.expSummary}>{exp.summary}</Text>}
              {exp.highlights
                .filter((h) => !(exp.id === "adobe-xd-intern" && h.startsWith("User Testing")))
                .slice(0, 4)
                .map((h, i) => (
                  <View key={i} style={s.expBullet}>
                    <Text style={s.expBulletDash}>–</Text>
                    <Text style={s.expBulletText}>{h}</Text>
                  </View>
                ))}
              {exp.link && (
                <Link src={getWorksUrl(exp.id)} style={s.expLink}>
                  View works →
                </Link>
              )}
            </View>
          ))}
        </Section>
      </Page>

      {/* Page 2 — Metrics, Projects, Skills */}
      <Page size="A4" style={s.page}>
        {/* Impact Metrics */}
        <Section title="Key Impact Metrics">
          <View style={s.metricsRow}>
            {IMPACT_METRICS.slice(0, 8).map((m, i) => {
              const isReduction = /friction|ticket|error|time|setup/i.test(m.label);
              return (
                <View key={i} style={s.metricBox} wrap={false}>
                  <Text style={s.metricValue}><Text style={{ color: C.arrow }}>{isReduction ? "▼ " : "▲ "}</Text>{m.value}</Text>
                  <Text style={s.metricLabel}>{m.label}</Text>
                  <Text style={s.metricContext}>{m.context}</Text>
                </View>
              );
            })}
          </View>
        </Section>

        {/* Selected Projects */}
        <Section title="Selected Projects">
          <View style={s.projectsRow}>
            {KEY_PROJECTS.map((p) => (
              <View key={p.id} style={s.projectCard} wrap={false}>
                <View style={s.projectCardHeader}>
                  <Text style={s.projectTitle}>{p.title}</Text>
                  <Text style={s.projectCompany}>{p.company}</Text>
                </View>
                <Text style={s.projectDesc}>
                  {p.opportunity.length > 120
                    ? p.opportunity.slice(0, 120).trim() + "…"
                    : p.opportunity}
                </Text>
                {p.metrics && (
                  <View style={s.projectMetricsRow}>
                    {p.metrics.slice(0, 2).map((m, i) => (
                      <Text key={i} style={s.projectMetricTag}>{m}</Text>
                    ))}
                  </View>
                )}
                <Link src={getProjectUrl(p.id)} style={s.projectLink}>
                  View case study →
                </Link>
              </View>
            ))}
          </View>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <View style={s.skillsRow}>
            {(Object.entries(SKILLS) as [string, string[]][]).map(([group, tags]) => (
              <View key={group} style={s.skillGroup}>
                <Text style={s.skillGroupTitle}>
                  {group === "soft" ? "Leadership" : group.charAt(0).toUpperCase() + group.slice(1)}
                </Text>
                <View style={s.skillTagsRow}>
                  {tags.map((t) => (
                    <Text key={t} style={s.skillTag}>{t}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </Section>
      </Page>

      {/* Page 3 — Education, Awards, Mentorship */}
      <Page size="A4" style={s.page}>
        {/* Education */}
        <Section title="Education">
          {EDUCATION.map((edu, i) => (
            <View key={i} style={s.eduEntry} wrap={false}>
              <View style={s.eduHeader}>
                <View>
                  <Text style={s.eduDegree}>{edu.degree}</Text>
                  <Text style={s.eduSchool}>{edu.school}</Text>
                </View>
                <Text style={s.eduPeriod}>{edu.period}</Text>
              </View>
              <Text style={s.eduFocus}>{edu.focus}</Text>
            </View>
          ))}
        </Section>

        {/* Awards */}
        <Section title="Awards & Recognition">
          <View style={s.awardsRow}>
            {TOP_AWARDS.map((a) => (
              <View key={a.id} style={s.awardBox} wrap={false}>
                <View style={s.awardHeader}>
                  <Text style={s.awardTitle}>{a.title}</Text>
                  <Text style={s.awardDate}>{a.date}</Text>
                </View>
                <Text style={s.awardIssuer}>{a.issuer}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Mentorship */}
        <Section title="Mentorship & Leadership">
          {MENTORSHIP.map((m) => (
            <View key={m.id} style={s.mentorEntry} wrap={false}>
              <View style={s.mentorHeader}>
                <View>
                  <Text style={s.mentorRole}>{m.role}</Text>
                  <Text style={s.mentorOrg}>{m.org}</Text>
                </View>
                <Text style={s.mentorPeriod}>{m.period}</Text>
              </View>
              <Text style={s.mentorDesc}>{m.description}</Text>
            </View>
          ))}
        </Section>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Generated from{" "}
            <Link src={PORTFOLIO} style={s.footerLink}>
              midhun-portfolio-ai.vercel.app
            </Link>
            {" "}· Interactive portfolio with AI-powered search
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/* ── Download function ── */
export async function downloadResumePdf() {
  const blob = await pdf(<ResumeDocument />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Midhun Krishnakumar Resume 2026.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
