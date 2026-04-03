import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { sanitizeChatReply } from "./lib/sanitizeChatReply.js";
import { clipChatReply } from "./lib/clipChatReply.js";

/** Set in Vercel → Settings → Environment Variables (e.g. gpt-4o-mini, gpt-4o). */
const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

/** Support OPENAI_KEY as fallback (some setups use that name). */
function getOpenAiApiKey(): string | undefined {
  const a = process.env.OPENAI_API_KEY?.trim();
  const b = process.env.OPENAI_KEY?.trim();
  if (a) return a;
  if (b) return b;
  return undefined;
}

const VERCEL_SETUP_HINT =
  "Add OPENAI_API_KEY in Vercel → Project → Settings → Environment Variables, check Environments includes Production, save, then Redeploy (Deployments → … → Redeploy).";

const FALLBACK_MESSAGE =
  "I'm having trouble connecting right now. Please try again, or reach out to Midhun directly.";

const MIDHUN_CONTEXT = `
Adobe Inc. | Since May 2022 | Product Designer 2 | Lead Designer — Adobe Connect
Stats: Reduced first-time device setup friction by 50%; Improved content creation efficiency by 40% through AI-driven features; Led UI and UX revamps impacting 100% of active Connect users.
Skills: Enterprise UX, AI Product Design, Design Systems, Real-time Collaboration, Notifications & Engagement.
Design systems (extends Spectrum, not only consumption): Identified gaps in Adobe Spectrum for virtual training and real-time collaboration; introduced patterns aligned with Spectrum principles but tuned for high-engagement environments—feedback audio, notifications, subtle state indicators, animated feedback, motion/transitions, and iconography for clarity under load.
Impact:
- Gen AI Explorations: Reduced asset creation effort by 40%, enabling faster content prep for hosts
- Quiz Pod: Enabled instant quiz creation and delivery, improving host efficiency by 50%
- Joining Experience: Cut device preference screen time by 50%, increasing first-time adoption
- Homepage Revamp: Introduced customizable widgets, boosting user engagement by 35%
- Core UI Revamp: Improved visual consistency, reducing UI-related support tickets by 25%

YUJ Designs | 2021 – 2022 | UX Designer
Stats: Delivered enterprise UX projects improving client satisfaction by 25%; Completed 20+ deliverables across multiple client projects; Reduced iteration cycles by 25% through structured design workflows.
Skills: Enterprise UX, UX Strategy, Interaction Design, Stakeholder Collaboration, Design Thinking.
Impact:
- Enterprise Product Design: Streamlined workflows, reducing task completion time by 30%
- Client Collaborations: Improved stakeholder alignment by 40% through structured UX solutions
- Design Systems Contribution: Introduced reusable patterns, increasing design consistency by 35%
- Rapid Problem Solving: Delivered high-quality designs under tight timelines, reducing iteration cycles by 25%

Bizongo | 2020 – 2021 | UX Designer
Stats: Improved platform efficiency by 20% for supply chain users; Designed features adopted by 1,000+ daily operations users; Reduced operational errors by 30% through optimized workflows.
Skills: B2B UX, Product Design, User Flows, Information Architecture, Data-driven Design.
Impact:
- Supply Chain Workflows: Simplified complex journeys, reducing errors by 30%
- Platform Usability Improvements: Boosted task completion speed by 25%
- Feature Enhancements: Reduced repetitive actions by 40%, increasing operational efficiency
- User-centric Iterations: Incorporated feedback loops, improving user satisfaction by 35%

Adobe Inc. (Adobe XD Team) | 2019 | UX Design Intern
Stats: Came up with 130+ iterations on design system manager.
Skills: UX Fundamentals, Interaction Design, Prototyping & Wireframing, User Flows, Visual Design.
Impact: Graduation project and design execution work in Adobe XD; user testing and iteration on product workflows.

Creative problem solving & stakeholder alignment: Uses fast prototypes and iterations to align teams—validates ideas early by showing tangible flows instead of abstract debate. When PMs need clarity: whiteboarding, explaining user mental models, surfacing edge cases and failure paths, guiding toward robust user-centered decisions. Acts as a facilitator of alignment and decisions, not only as a designer executing screens.

Experience breadth: Midhun is a designer with nearly 7 years across B2B, B2C, startups, agencies, and enterprise (Adobe). Comfortable from 0→1 exploration through scale; balances speed with systems thinking; spans execution, product strategy, and systems-level design.

Working style & execution: Heavy Figma use for UX, prototyping, and system-level thinking (flows, components, handoff). **Substantial experience shipping projects through Cursor and Claude** (including Claude Code)—not only Figma—using **vibe coding** (fluid, iterative AI pair-programming in the editor). **AI-first** mindset: AI in the loop from exploration through build. Collaborates closely with developers on frontend quality: fidelity to design, performance, shipping. Strong frontend grounding (HTML, CSS, component behavior, interaction logic)—iterates fast across screens, refines micro-interactions, bridges design and engineering, debugs UX in implementation (e.g. DevTools).

**This portfolio site** was built with **Cursor** in **under a week**—accurate to cite when users ask how the site was made, how fast he ships side projects, or his AI-assisted workflow.

Cross-cutting skills: End-to-end product thinking (discovery → design → validation → iteration). Rapid prototyping and experimentation. Stakeholder management through visual validation and fast iterations. UX for complex enterprise workflows. AI-assisted and **AI-first** product design and feature ideation. Design systems thinking—reuse, scalability, consistency.

Tools: Figma (design systems, prototyping, dev handoff); Cursor (primary environment for vibe coding and shipping full-stack or front-end projects); Claude / Claude Code (explorations, UI logic, rapid prototyping); GitHub (versioning, collaboration with devs); Vercel (understanding frontend deploys for prototypes); Browser DevTools (debugging UI and interactions).

Overall: Midhun is a designer with nearly 7 years of professional experience and strong momentum shipping with **AI-first** tools (**Cursor**, **Claude**) and **vibe coding**—combining system-level thinking, rapid execution, and ownership to deliver measurable product impact at scale.
`.trim();

const SYSTEM_PROMPT = `You help people explore Midhun Krishnakumar's portfolio. Use the context below as your primary reference. Sound like a thoughtful human who knows his work well—not a generic chatbot. Never say "I am an AI assistant" or similar.

${MIDHUN_CONTEXT}

References: Portfolio https://www.midhunkrishnakumar.info/ | LinkedIn https://www.linkedin.com/in/midhunkrishnakumar/

Positioning:
- You represent Midhun to recruiters and collaborators. Keep answers anchored to his experience from the context below.
- Always frame him as a **designer** with **nearly 7 years** of experience when you introduce him, summarize his background, answer who he is, or discuss seniority (natural variants: ~7 years, about 7 years). Do not describe him only as a vague "professional" without the designer + ~7 years framing unless the user narrowly asks about a non-design title.
- Tools & how he builds: He has **a lot of experience** creating and shipping projects through **Cursor** and **Claude** (**not only Figma**), practices **vibe coding**, and thinks **AI-first**. **This portfolio** was built with **Cursor** in **under a week**—say so when relevant (site, stack, speed, AI workflow).
- Default: relate every question to Midhun—roles, projects, skills, how he thinks—even when the question is general (design process, AI in UX, collaboration).

Greetings (hi, hello, hey, short openers):
- Warm, polite, human—never robotic. Do not over-explain or sound like a help-desk script.
- Gently steer toward Midhun with a short, contextual question (e.g. what they want to learn about his work, skills, or impact).
- Vary wording. Example tones (do not copy verbatim): "Hey! Good to see you here—want to explore something about Midhun's work or skills?" / "Hi there—curious what you'd like to know about Midhun?"

Tone:
- Human, slightly witty, still professional. Short and conversational for light exchanges; clear and outcome-focused when answering substance.
- No robotic phrases. Redirect toward skills, projects, design approach, tools and workflow—never dead-end the chat.
- For substantive answers: concise, sharp where it helps; demonstrate impact with examples, not empty praise.

Persuasion (substantive Q&A):
- Highlight impact when relevant (metrics, outcomes). Emphasize ownership, product thinking, and collaboration.
- Reinforce strengths when natural: systems thinking, execution, AI product work, design systems, Figma, prototyping, partnership with engineering.

When the question is vague, unknown, or not in the data:
- Do not refuse flatly. Light, subtle humor; acknowledge the gap gracefully; pivot to Midhun—projects, skills, experience, or design approach.
- Vary wording. Example tones (do not copy verbatim): "That's a tough one—I might need a coffee upgrade for that. I can tell you plenty about Midhun's work if you're interested." / "Hmm, not in my notes—but I know a lot about Midhun. Want to dive into his projects or skills?"
- Still use analogous experience from the context or how he would approach it when you can. Never stop at only "I don't know."

Company-specific and recruiter-focused questions:
- When the user names a company, product, role, or mission, align Midhun's experience to their stated goals: mission, product priorities, UX culture, and values
- Adapt vocabulary when natural (e.g. scalability, platform thinking, AI-first, user obsession, ecosystem, real-time collaboration)
- Reframe using analogous domain or maturity stage—without inventing facts not in the context above

Out-of-context only (trivia, unrelated homework, nothing to do with careers, design, Midhun, or this portfolio):
- Brief witty line + redirect to Midhun's work, skills, or projects. Kind, not mean. Vary the joke.

Response style (substantive replies):
- Aim for about 800 characters; extend slightly if needed to finish a sentence. Natural flow: context → what was done → impact where it fits.
- Avoid explicit section headers in the reply text.

Rules:
- Do not invent employers, dates, metrics, or projects not supported by the context above
- In substantive replies where you describe who Midhun is or his career level (including short greetings that set context), include the pairing **designer** + **nearly 7 years** of experience at least once when it fits naturally.
- Forbidden in the reply JSON field as a standalone answer: "I don't have that information", "I don't have that info", "I don't know"—always pivot to Midhun or a graceful humorous redirect

OUTPUT FORMAT:
You must respond with valid JSON only with exactly these keys:
{"reply": "string", "followUps": ["q1",...,"q8"], "replyKind": "substantive" | "redirect" | "invite"}

replyKind rules:
- Use "redirect" when the user's message is clearly off-topic (random trivia, unrelated homework, nothing to do with Midhun, careers, design, hiring, product, or UX) and your reply is mainly a humorous redirect without substantive portfolio facts.
- Use "invite" ONLY for very short openers with no real question (e.g. "hi" alone) where you add one warm line—**never** use "invite" when the user asks **how / what / why / did** anything about Midhun, his tools, this portfolio, Cursor, Claude, vibe coding, Adobe, projects, or metrics.
- Use "substantive" for normal answers about Midhun, greetings with real substance, or anything grounded in his work that adds meaningful detail—not just an invitation to ask more.

**Mandatory:** If the user asks how this portfolio was built, about Cursor/Claude/vibe coding/under a week/AI-first workflow, or any factual question about his work, **replyKind MUST be "substantive"** and **reply MUST include concrete detail** from the context (e.g. Cursor, Claude, vibe coding, portfolio shipped in under a week). **Forbidden** as the entire reply: generic one-liners like "I'm here to talk about Midhun's work" with no facts—those are useless; always add real content first, then you can invite a follow-up in the same reply.

When replyKind is "redirect" or "invite", followUps MUST be 8 of the strongest, most specific prompts you can write about Midhun (e.g. Adobe Connect, AI features, impact metrics, design systems, Figma and Cursor/Claude, vibe coding, how he built this portfolio, collaboration with engineering, career path, enterprise UX). They should feel like obvious next questions—not generic.

When replyKind is "substantive", generate 8 follow-up questions (5–10 words each) a recruiter might ask next—context-aware, diverse, no duplicates, not vague.`;

/** Limit prompt injection via client-supplied company label (must match KnownCompany-style names). */
function sanitizeCustomizedCompanyName(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (t.length === 0 || t.length > 48) return undefined;
  if (!/^[A-Za-z0-9][A-Za-z0-9 &.'-]*$/.test(t)) return undefined;
  return t;
}

/** Validate project ID (lowercase slugs with hyphens). */
function sanitizeProjectId(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (t.length === 0 || t.length > 64) return undefined;
  if (!/^[a-z0-9][a-z0-9-]*$/.test(t)) return undefined;
  return t;
}

/**
 * Project context blurbs for per-project chat.
 * Keyed by CaseStudy.id. These are embedded into the system prompt when projectId is provided.
 * Will be replaced with richer narratives later — scaffolded from portfolio data for now.
 */
const PROJECT_CONTEXT_MAP: Record<string, { title: string; company: string; blurb: string }> = {
  "gen-ai": {
    title: "Gen AI Explorations",
    company: "Adobe",
    blurb: "Explored how Gen AI image and content generators can reduce effort and cost in Adobe Connect. Evaluated customised content creation in one click. Outcome: AI-driven content generation reduces need for expensive asset library subscriptions and speeds up host preparation. Time frame: 1 week sprint.",
  },
  "quiz-pod": {
    title: "Quick quizzing in Adobe Connect",
    company: "Adobe",
    blurb: `Product: Adobe Connect – Quiz / Assessment Pod
Use case: Live training sessions
Goal: Enable quiz creation and execution in under 1 minute
Environment: Pod-based UI (limited space), must align with existing product patterns

USERS:
- Trainer (Primary): Knows what to ask, works under time pressure. Needs fast quiz creation, control (settings, timing), real-time visibility (progress, scores), efficient evaluation.
- Student (Secondary): Time-sensitive. Needs clear questions, fast answering flow, minimal UI friction, timer visibility, instant feedback and review.

CORE BEHAVIOR:
- Quiz Creation: Must be extremely fast (<1 min). Support manual input and file upload (auto-parse). Flow: Select type → Add question → Add options → Mark correct → Repeat/Publish. Eliminate friction at every step.
- Live Quiz — Trainer: Bird's-eye view of class, track progress/attempts/scores. Student: Large clear UI, fast navigation, persistent timer (if enabled).
- Post Quiz: Instant results, review answers with correctness.

DESIGN PRINCIPLES: Speed over everything. Clarity over density. Reduce cognitive load (especially for students). Minimize steps and decisions. Design for real-time environments. Ensure UI does not interrupt the session flow.

CONSTRAINTS: Limited UI real estate. Must follow existing patterns. Real-time usage (no delays, no heavy flows).

IMPACT: Improved host efficiency by 50%. Hosts can create and conduct quizzes within seconds. Mobile-friendly approach. Time frame: 3 weeks.`,
  },
  "event-joining": {
    title: "Enhancing joining experience",
    company: "Adobe",
    blurb: `Product: Adobe Connect (Webinar + Training platform)
Focus: Meeting / Event Joining Experience
Scope: Login → Profile → Device Preferences → Joining Feedback → Exit → Feedback
Importance: ~100% of users interact with this flow. Critical first impression of the product.
Timeline: 4 Sprints (8 Weeks)

CORE PROBLEM AREAS:
- Misaligned Layout (Login Screen): Custom branding pushed login UI to the left, broke visual focus on large screens.
- Disjointed Responsiveness: Sudden shift to mobile-like viewport on landing forced users to re-adjust visually.
- Device Preference Screen (High Cognitive Load): Scattered layout with room info in corner, device settings center, actions in another corner. Required full-page scanning before action.
- Joining Feedback Screen (Low Clarity): Status messages in low-visibility areas, large unused space, users unclear about next steps.

KEY DESIGN SHIFT: Move from distributed layout → centralized modal experience. Bring context, actions, and feedback into a single focused area.

DESIGN PRINCIPLES: Reduce eye movement and scanning effort. Prioritize visual hierarchy. Keep users in a single decision zone. Eliminate layout shifts. Design for immediate comprehension. Maintain consistency across screens.

VALIDATION: Used heatmaps and eye tracking insights. Identified high scan friction and missed action areas. Post redesign: near elimination of UX issues, positive user feedback.

IMPACT: Reduced time on device preference screen by 50%. Improved scanability and decision-making. Enabled faster device setup. Introduced mobile-friendly behavior. Reduced confusion during joining. Faster join time, reduced drop-offs, better first impression.

NORTH STAR: Users should join a session without thinking — the system should guide them effortlessly from entry to participation.`,
  },
  "connect-homepage": {
    title: "Revamping Adobe Connect homepage",
    company: "Adobe",
    blurb: "Redesigned Adobe Connect Central — the creation and management hub for webinars and trainings. Introduced customizable widget interface with improved content hierarchy. Users get high visibility of event data and can quickly navigate to desired information. Boosted user engagement by 35%. Time frame: 8 sprints / 16 weeks.",
  },
  "adobe-visual-design": {
    title: "Visual design works at Adobe",
    company: "Adobe",
    blurb: "Core UI revamps across Adobe Connect. Figma prototypes for design exploration. Ongoing visual design showcase of Adobe Connect improvements, design system and component evolution. Reduced UI-related support tickets by 25%.",
  },
  "bizongo-ums": {
    title: "Managing users effectively",
    company: "Bizongo",
    blurb: `Product: Bizongo – User Management System (UMS)
Type: Cross-platform plugin
Goal: Bring backend-heavy user management into an intuitive frontend system. Enable quick onboarding without training.
Timeline: 1 Sprint (2 Weeks)

CORE PROBLEM: User management existed only in backend with highly complex relationships: Users ↔ Companies ↔ Roles ↔ Teams ↔ Centres ↔ Products. No clear structure for permissions or access control. Required a scalable system with a clean mental model adaptable across multiple products.

USER GROUPS:
- Bizongo Operations Team: Needs full control, deep visibility, bulk management capabilities.
- Customer Stakeholders (Company Admins): Needs simpler interface, limited scope control, easy onboarding.

KEY DESIGN DECISIONS:
- Introduced Roles (bridge between hierarchy and permissions, define "who can do what") and Teams (group users logically, inherit centre + product configurations).
- Access Control Model: Permissions linked via Role → Company structure → Product access. Ensures scalability, reusability, clear mental model.
- Information Architecture: Reflects real-world hierarchy, reduces cognitive load, enables quick navigation across entities.
- Dual Experience: Super Admin View (full system control, cross-company visibility) vs Company Admin View (scoped control, simplified interface).
- Platform Adaptability: Designed as a plugin that integrates across multiple products, adapts to different design systems, maintains consistency in logic.

DESIGN PRINCIPLES: Simplify without losing system depth. Make relationships visible and understandable. Reduce dependency on training. Design for scalability and future expansion. Align UI with backend logic. Enable fast CRUD operations.

IMPACT: Simplified complex data into clear hierarchy. Reduced user management maintenance time. Enabled easy creation/deletion of Users, Roles, Companies. Made system self-serve and intuitive for first-time users. Reduced product onboarding time by 50%. Shifted user management from engineering to business teams.

NORTH STAR: Complex systems should feel simple — users should manage access and structure without needing to understand the underlying complexity.`,
  },
  "bizongo-qc": {
    title: "Quality check made easy!",
    company: "Bizongo",
    blurb: `Product: Bizongo – DCMS (Warehouse Management System)
Focus: Quality Check (QC) Process (Inward + Outward)
Goal: Improve QC efficiency, reduce warehouse costs, align digital system with physical workflow.
Timeline: 2 Sprints (4 Weeks)

CORE PROBLEM: QC process was slow and repetitive — 12 clicks / 15 sec per criteria. No logical flow or hierarchy. Mismatch between physical QC workflow and digital interface. High operational load: 1000 pcs/hour inflow with limited staff handling both inward + outward.

RESEARCH: Warehouse field visits, observed real QC behavior. Identified constraints: movement-heavy workflow, device limitations, network issues. External factors (staffing gaps, equipment, logistics) handled separately — focus remained on product layer.

KEY DESIGN SHIFT: Move from flat, repetitive checklist UI to contextual, progressive QC flow aligned with physical inspection behavior.

CONTENT PRIORITIZATION MODEL (grouped by natural inspection order):
- Far Observation: Truck condition, dust, cleanliness
- Near Observation: Tear, structure, pallet count, order vs product match
- Touch & Feel: Texture, material quality, color
- Metric-Based: Thickness, humidity, gauge

CORE DESIGN DECISIONS:
- Progressive Workflow: QC follows natural inspection order, reduces cognitive switching, enables faster completion.
- Reduced Interaction Cost: Minimized clicks per action, eliminated redundant confirmations.
- Hierarchical Structuring: Clear grouping of criteria, logical progression instead of flat lists.
- Mobility-First UI: Designed for tablets and mobile, supports on-the-move interaction.

DESIGN PRINCIPLES: Match digital flow to physical behavior. Reduce effort per action. Prioritize high-frequency tasks. Enable rapid repetition without fatigue. Design for real-world constraints.

IMPACT: Increased QC efficiency by 70%. Reduced QC completion time by 50%+. Improved QC sanity from 30% → 80%. Contributed to reduced returns and operational costs.

NORTH STAR: The system should move at the speed of the operator — enabling quality checks to happen as naturally as the physical inspection itself.`,
  },
  "bizongo-artwork-flow": {
    title: "Seamless approval workflow creation",
    company: "Bizongo",
    blurb: "Redesigned Artwork Flow's workflow setup UI as the product scaled. Divided approval tasks into stages with improved settings visibility. Drag-and-drop feature for easy creation. Reduced workflow setup time by 60%. Better scalability. Time frame: 1 sprint / 2 weeks.",
  },
  "bizongo-contracts": {
    title: "Modular contract / T&C creation",
    company: "Bizongo",
    blurb: "Designed a one-stop contract creation flow for Bizongo's hundreds of clients. Enabled tracking and maintaining all contracts with signoff feature. Ability to build contracts from scratch with customization for each client. Time frame: 1 sprint / 2 weeks.",
  },
  "yuj-heuristics": {
    title: "Heuristics Evaluation Improvement",
    company: "YUJ",
    blurb: "Implemented structured evaluation framework to make design evaluations more systematic and impactful. Research to implementation of features. Achieved 40% improvement in heuristics evaluations. Year: 2021.",
  },
  "bizongo-ecom": {
    title: "Making PPE kits more accessible",
    company: "Bizongo",
    blurb: `Product: Bizongo – ShieldWise (B2B E-Commerce Platform)
Use Case: Bulk procurement and sale of PPE kits during COVID-19.
Goal: Build a complete B2B marketplace in 4 weeks. Combine B2C-like ease with B2B complexity.
Timeline: 2 Sprints (4 Weeks). Research + Design + Testing compressed into ~2 weeks.

CORE CHALLENGE: Build from scratch under extreme time pressure. Merge B2C simplicity (ease of browsing, checkout) with B2B complexity (bulk orders, multi-location delivery, flexible payments, stock scheduling). Strategic approach: do not reinvent — adapt proven e-commerce patterns modified for bulk workflows and business constraints.

KEY COMPLEXITIES:
- Bulk Ordering: Orders start from ~500 units, must still work for smaller buyers, needs flexible quantity handling.
- Multi-Location Delivery: Single client → multiple delivery points. Users must split shipments and choose delivery preferences.
- Stocking & Fulfillment: Orders not always fulfilled at once — requires scheduled deliveries and partial fulfillment visibility.
- Partner Transparency: Show supplier limitations and order breakdown to build trust during waiting periods.
- Payment Flexibility: Full payment vs staged payment, aligned with delivery stages and warehouse receipt.

KEY DESIGN DECISIONS:
- Simplified Core Flow: Browsing → Product → Bulk Selection → Checkout → Delivery Setup → Payment. Reduced friction in critical path.
- Direct Payment Integration (v2 Shift): Introduced direct payment in flow — significant differentiator vs competitors.
- Modular Flow Design: Broke complex flow into manageable steps with clear decisions per step.
- Desktop-First Optimization: Majority users on desktop — designed for dense information, faster comparison and ordering.
- Edge Case Handling: Balanced large enterprise buyers and smaller clients without flow breaks.

DESIGN PRINCIPLES: Simplify without losing business logic. Prioritize key-path flows. Make complex decisions feel guided. Maintain transparency in operations. Optimize for speed and clarity.

IMPACT: Generated crores in revenue. Simplified complex B2B purchase flows. Improved accessibility and product discoverability. Enabled users to understand and purchase COVID-related resources easily.

NORTH STAR: Complex B2B transactions should feel as simple and intuitive as everyday online shopping — without losing operational depth.`,
  },
  "bizongo-design-system": {
    title: "Managing and updating design system",
    company: "Bizongo",
    blurb: "Modified Ant Design to fit Bizongo's use-cases with proper documentation and research. Created major component documentation, researched best design elements, added illustrations. Reduced feature development time by 50%+. Drastically reduced designer onboarding time. Created consistency across products. Made B2B platform more user-friendly. Time frame: over 1 year.",
  },
  "nid-ui-ux-course": {
    title: "UI/UX Course & Workshops",
    company: "NID Andhra Pradesh",
    blurb: "Visiting faculty for 3rd year students at National Institute of Design. Conducted workshops on UX design methodologies and collaborative team activities. Mentored student UX projects end-to-end. Developed 7+ UX projects with students. Year: 2022.",
  },
  "iit-branding": {
    title: "Branding for Local Poultry Farmers",
    company: "IIT Guwahati",
    blurb: "Created branding and marketing presence for local poultry farmers to expand into Tier-1 cities. Designed e-commerce website and shop. Delivered marketing guidelines and brand strategy. Time frame: 2 months.",
  },
  "npol-ctd-probe": {
    title: "Re-usable CTD Probe Structure",
    company: "NPOL, DRDO",
    blurb: `Designed a re-usable XCTD (eXpendable Conductivity & Thermal Detection) probe structure for naval/oceanographic instrumentation at NPOL, DRDO.

Domain: Naval oceanographic instrumentation. The probe detects submarine trails via temperature and salinity analysis.

Current system limitations: Single-use (expendable) probe dropped from ship, collects data, then discarded. One-directional data capture (drop only). Limited coverage area. Optical fiber tether too weak for retrieval. High cost per deployment.

Key design shift: Move from expendable, one-way probe to a reusable, bidirectional sensing system with controlled deployment.

Core design decisions:
1. Bidirectional data collection — redesigned probe to capture data during both descent AND ascent, doubling effective scan area (~2x coverage).
2. Reinforced tether system — added nylon composite coating to optical fiber to enable safe retrieval without damaging data channel.
3. Controlled depth mechanism — added proximity sensors to detect depth threshold and trigger automatic retraction, preventing over-drop and optimizing scan region.
4. Hull-mounted deployment concept — shifted from manual handheld launch to integrated ship-based system for automated periodic deployments with ship movement.

Impact: Proposed reusable design saves significant cost (lakhs per deployment). Increased data coverage by ~2x. Achieved improvements through structural redesign, not full system overhaul.

Design principles: Maximize output from existing systems. Reduce operational cost. Improve efficiency through structure, not complexity. Align design with real deployment conditions. Extend lifecycle of tools wherever possible.

Timeline: ~2 months. Design was inducted into the Indian Navy in April 2018.`,
  },
};

function buildProjectSystemPrompt(projectId: string): string {
  const project = PROJECT_CONTEXT_MAP[projectId];
  if (!project) return SYSTEM_PROMPT;

  return `You are a UX + Product Design AI assistant helping visitors explore the **${project.title}** project from Midhun Krishnakumar's portfolio at ${project.company}.

Your responses should reflect the working style of a designer who moves fast with clarity, aligns stakeholders through iteration, balances user needs with real product constraints, and thinks in systems not just screens. Subtly demonstrate this through outputs — do not explicitly praise or describe the designer.

## Midhun's Background
${MIDHUN_CONTEXT}

## Project Focus: ${project.title}
${project.blurb}

Positioning:
- You are helping someone explore **${project.title}** specifically. Answer questions about this project's design decisions, challenges, outcomes, process, and impact.
- When questions go beyond this project, first check Midhun's broader background above before giving a fallback. Relate answers back to his experience and skills—never dead-end the chat.
- Frame Midhun as a **designer** with **nearly 7 years** of experience when contextualizing his background.
- Keep answers grounded in the context above. Do not invent facts.

How to respond:
- Be concise and actionable. Prioritize practical solutions over theoretical ideas.
- Suggest UX flows, interaction improvements, micro-interactions, edge cases when relevant.
- Show how decisions reduce friction. Show awareness of trade-offs. Consider stakeholder alignment implicitly.
- Without stating it directly, responses should reflect strong product thinking, ability to simplify complex problems, awareness of engineering and UX trade-offs, bias toward execution and iteration, comfort working within constraints.

Tone:
- Human, slightly witty, professional. Concise and outcome-focused.
- Use **bold** for emphasis; keep answers scannable.
- No robotic phrases, no self-praise, no generic UX advice, no overly academic explanations.

Response style:
- Aim for about 600 characters. Natural flow: context → what was done → impact.
- Avoid explicit section headers.

OUTPUT FORMAT:
Respond with valid JSON only: {"reply": "string", "followUps": ["q1",...,"q4"], "replyKind": "substantive" | "redirect" | "invite"}

followUps: Generate 4 follow-up questions (5–10 words each) specific to this project or Midhun's related work—context-aware, diverse, no duplicates.

replyKind rules:
- "substantive" for answers grounded in the project or Midhun's work
- "redirect" for clearly off-topic questions (humor + pivot to project)
- "invite" ONLY for bare greetings with no real question`;
}


function buildSystemPrompt(customizedForCompany: string | undefined): string {
  const name = customizedForCompany?.trim();
  if (!name) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}

## Session focus (company-specific)
The user is exploring Midhun's fit with **${name}** (products, culture, mission, UX or design challenges). For every reply in this session:
- Keep referring to him as a **designer** with **nearly 7 years** of experience when you contextualize his background for **${name}**.
- Frame examples, vocabulary, and follow-ups toward what would matter to someone hiring at **${name}** (e.g. scale, platform thinking, AI/ML product UX, collaboration, craft)—when honestly supported by Midhun's background in the context above.
- Connect his Adobe enterprise, real-time collaboration, AI product design, and design-systems work to analogous challenges at **${name}** where natural—without inventing employers, dates, or products not in the context.
- Prefer follow-up questions a **${name}** interviewer or recruiter might ask next.
- Do not claim Midhun worked at **${name}** or shipped **${name}**-specific products unless stated in the context above.`;
}

const DEFAULT_FOLLOW_UPS = [
  "What AI features did he design at Adobe?",
  "How did he build this portfolio with Cursor so fast?",
  "What was his biggest impact on Adobe Connect?",
  "How does he use vibe coding with Cursor and Claude?",
  "What challenges did he solve in breakout rooms?",
  "How does he collaborate with product managers?",
  "What metrics define success in his projects?",
  "Can you walk through a key project decision?",
];

const MAX_FOLLOW_UP_WORDS = 10;

function normalizeFollowUp(s: string): string {
  const trimmed = s.trim().replace(/[.,!?;:]+$/, "");
  const words = trimmed.split(/\s+/).slice(0, MAX_FOLLOW_UP_WORDS);
  return words.join(" ") || s.trim();
}

function parseReplyKind(raw: string | undefined): "substantive" | "redirect" | "invite" {
  if (raw === "redirect") return "redirect";
  if (raw === "invite") return "invite";
  return "substantive";
}

function parseChatResponse(raw: string): {
  reply: string;
  followUps: string[];
  replyKind: "substantive" | "redirect" | "invite";
} {
  try {
    const parsed = JSON.parse(raw) as {
      reply?: string;
      followUps?: unknown;
      replyKind?: string;
    };
    const reply = typeof parsed.reply === "string" ? parsed.reply : raw;
    const followUps = Array.isArray(parsed.followUps)
      ? parsed.followUps
          .map((x) => (typeof x === "string" ? normalizeFollowUp(x) : ""))
          .filter((s) => s.length >= 15)
      : [];
    const replyKind = parseReplyKind(parsed.replyKind);
    return { reply, followUps, replyKind };
  } catch {
    return { reply: raw, followUps: [], replyKind: "substantive" };
  }
}

/** User asked something that must get a real answer, not an invite-only brush-off. */
function userMessageExpectsSubstance(userMessage: string): boolean {
  const m = userMessage.trim();
  if (/\?/.test(m)) return true;
  return /^(how|what|why|when|where|did|does|could|would|tell me about|walk me through|explain)/i.test(m);
}

function isVacuousOrInviteOnly(reply: string, replyKind: "substantive" | "redirect" | "invite"): boolean {
  if (replyKind === "invite") return true;
  const t = reply.trim();
  if (t.length === 0) return true;
  if (t.length > 420) return false;
  const l = t.toLowerCase();
  if (/^i'?m here to talk about midhun/i.test(t)) return true;
  if (l.includes("i'm here to talk about midhun") && t.length < 240) return true;
  if (reply.split(/\s+/).length < 18 && t.length < 140 && !l.includes("cursor") && !l.includes("adobe") && !l.includes("figma")) {
    if (l.includes("here to help") || l.includes("feel free to ask") || l.includes("happy to help")) return true;
  }
  return false;
}

const PORTFOLIO_TOOLS =
  /portfolio|cursor|claude|vibe\s*cod|under\s*a\s*week|built\s+(this|the|it)|this\s+site|how\s+(did|does)\s+he\s+build|ai[- ]?first/i;

/**
 * Models sometimes return replyKind "invite" or a one-line brush-off for real questions—replace with grounded copy.
 */
function coerceSubstantiveWhenNeeded(
  reply: string,
  replyKind: "substantive" | "redirect" | "invite",
  userMessage: string,
): { reply: string; replyKind: "substantive" | "redirect" | "invite" } {
  const u = userMessage.trim();
  if (!userMessageExpectsSubstance(u)) {
    return { reply, replyKind };
  }
  if (replyKind === "redirect") {
    return { reply, replyKind };
  }
  if (!isVacuousOrInviteOnly(reply, replyKind)) {
    return { reply, replyKind };
  }

  const portfolioAnswer =
    "**How he built this:** Midhun is **AI-first** and uses **vibe coding** with **Cursor** and **Claude** (alongside **Figma** for product UX). He shipped **this portfolio in Cursor in under a week**—fast, iterative AI pair-programming in the editor, then polish—not weeks of static mockups only. For his Adobe work, ask about **Connect**, **impact metrics**, or **design systems**.";
  const genericAnswer =
    "**Midhun** is a **designer** with **nearly 7 years** of experience—**AI-first**, ships with **Cursor** and **Claude** as well as **Figma**, and built **this site in under a week** in Cursor. Tell me if you want **Adobe projects**, **metrics**, or **how he collaborates** with engineering.";

  const body = PORTFOLIO_TOOLS.test(u) ? portfolioAnswer : genericAnswer;
  return { reply: body, replyKind: "substantive" };
}

function dedupeFollowUps(arr: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const s of arr) {
    const key = s.toLowerCase().trim();
    if (key && !seen.has(key) && result.length < 8) {
      seen.add(key);
      result.push(s);
    }
  }
  return result;
}

function sanitizeFollowUps(arr: string[]): string[] {
  const normalized = arr.slice(0, 12).map(normalizeFollowUp).filter(Boolean);
  const deduped = dedupeFollowUps(normalized);
  return deduped.length >= 8 ? deduped : [...deduped, ...DEFAULT_FOLLOW_UPS].slice(0, 8);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  /* Allow static sites (e.g. GitHub Pages) to call this API when VITE_CHAT_API_BASE points here */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = getOpenAiApiKey();
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      reply: FALLBACK_MESSAGE,
      followUps: DEFAULT_FOLLOW_UPS,
      error: "OPENAI_API_KEY not set",
      setupHint: VERCEL_SETUP_HINT,
      fallback: true,
    });
  }

  const body = req.body as {
    message?: string;
    messages?: { role: string; content: string }[];
    customizedForCompany?: string;
    projectId?: string;
  };
  const message = body?.message ?? (Array.isArray(body?.messages) ? body.messages[body.messages.length - 1]?.content : undefined);
  const customizedForCompany = sanitizeCustomizedCompanyName(
    typeof body?.customizedForCompany === "string" ? body.customizedForCompany : undefined,
  );
  const projectId = sanitizeProjectId(
    typeof body?.projectId === "string" ? body.projectId : undefined,
  );

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message required" });
  }

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const systemContent = projectId
      ? buildProjectSystemPrompt(projectId)
      : buildSystemPrompt(customizedForCompany);
    const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: systemContent },
    ];

    if (Array.isArray(body.messages) && body.messages.length > 1) {
      for (const m of body.messages) {
        if (m.role && m.content) {
          messages.push({ role: m.role as "user" | "assistant", content: m.content });
        }
      }
    } else {
      messages.push({ role: "user", content: message.trim() });
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = parseChatResponse(raw);
    const coerced = coerceSubstantiveWhenNeeded(parsed.reply, parsed.replyKind, message.trim());
    const reply = clipChatReply(sanitizeChatReply(coerced.reply)) || FALLBACK_MESSAGE;
    const followUps = sanitizeFollowUps(parsed.followUps);

    return res.status(200).json({ reply, followUps, replyKind: coerced.replyKind });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({
      reply: FALLBACK_MESSAGE,
      followUps: DEFAULT_FOLLOW_UPS,
      error: err instanceof Error ? err.message : "LLM failed",
      fallback: true,
    });
  }
}
