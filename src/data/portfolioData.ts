export const QUICK_TAGS = [
  "Adobe Connect",
  "AI Initiatives",
  "Enterprise UX",
  "Design Systems",
  "Breakout Rooms",
  "Notifications",
  "UX Northstar",
] as const;

export const SEARCH_PROMPTS = [
  "What has Midhun built at Adobe?",
  "Show AI projects",
  "Why hire this designer?",
  "Tell me about enterprise experience",
  "Show leadership experience",
  "What are his impact metrics?",
  "Tell me about Design Systems work",
] as const;

export interface CaseStudySection {
  title: string;
  content: string | string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  company: string;
  category: string;
  opportunity: string;
  actions: string[];
  outcomes: string[];
  metrics?: string[];
  timeFrame: string;
  tags: string[];
  link?: string;
  thumbnail?: string;
  /** Additional sections matching original portfolio page structure */
  sections?: CaseStudySection[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  duration: string;
  highlights: string[];
  tags: string[];
  stats?: string[];
  link?: string;
  /** Short paragraph describing what was done at this company */
  summary?: string;
}

export interface AIWork {
  id: string;
  title: string;
  description: string;
  impact: string[];
  tags: string[];
}

export interface ImpactMetric {
  label: string;
  value: string;
  context: string;
  projectId?: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "gen-ai",
    title: "Gen AI Explorations",
    company: "Adobe",
    category: "AI",
    opportunity: "Being the buzz word of 2023, Gen AI has taken the world stage. Exploring how product explorations using Gen AI can reduce effort and cost.",
    actions: ["Product explorations using Gen AI image and content generators", "Evaluated customized content in one click"],
    outcomes: ["Utilising GenAI image and content generator can help reduce effort", "Easy to get customised content in a click", "Can reduce cost by needlessly subscribing to asset libraries"],
    metrics: ["40% reduction in asset creation effort", "3x faster content turnaround"],
    timeFrame: "1 Week",
    tags: ["Adobe Connect", "AI Initiatives", "Enterprise UX"],
    link: "https://www.midhunkrishnakumar.info/gen-ai-exploration",
    thumbnail: "images/case-studies/gen-ai.png",
  },
  {
    id: "quiz-pod",
    title: "Quick quizzing in Adobe Connect",
    company: "Adobe",
    category: "Feature",
    opportunity: "Adobe Connect's success lies in its customisability and reusability of pods. Quiz pod was a new feature request by users across the world.",
    actions: ["Designed Quiz pod as new feature", "Leveraged Connect's customizable pod architecture", "Mobile-friendly approach"],
    outcomes: ["Create and conduct quiz within seconds", "A quick way to assess students", "Mobile friendly approach"],
    metrics: ["50% boost in host efficiency", "90% faster quiz creation vs. manual"],
    timeFrame: "3 Weeks",
    tags: ["Adobe Connect", "Enterprise UX"],
    link: "https://www.midhunkrishnakumar.info/adobe-connect-quiz-pod",
    thumbnail: "images/case-studies/quiz-pod.png",
  },
  {
    id: "event-joining",
    title: "Enhancing joining experience",
    company: "Adobe",
    category: "UX",
    opportunity: "Being a legacy video conferencing tool mainly for webinar and training purposes, Adobe Connect has been evolving. This exercise was to improve the time taken and general UX of the room joining experience.",
    actions: ["Redesigned device preference flow", "Retained earlier device setups for easy joining", "Simplified preference scanning"],
    outcomes: ["Retaining earlier device setups for easy joining", "Reduced time spent on device preference screen by 50%", "Users able to scan faster and understand their device preferences", "Mobile friendly approach"],
    metrics: ["50% reduction in preference screen time", "2x faster room entry for returning users"],
    timeFrame: "4 Sprints; 8 Weeks",
    tags: ["Adobe Connect", "Enterprise UX", "Notifications"],
    link: "https://www.midhunkrishnakumar.info/event-joining-experience",
    thumbnail: "images/case-studies/event-joining.png",
  },
  {
    id: "connect-homepage",
    title: "Revamping Adobe Connect homepage",
    company: "Adobe",
    category: "UX",
    opportunity: "Adobe Connect - Central is the creation and managing hub for all webinars and trainings. Webinar producers and admin come here to create new webinars/trainings, get recordings or consume analytics of past webinars.",
    actions: ["Redesigned creation and management hub", "Customisable widget interface", "Improved content hierarchy"],
    outcomes: ["High visibility of webinar/training event data", "Users can quickly navigate to desired information vertical", "Customisable widget interface", "Sleeker, Modernised look with better content hierarchy"],
    metrics: ["35% increase in user engagement", "28% faster navigation to key actions"],
    timeFrame: "8 Sprints; 16 Weeks",
    tags: ["Adobe Connect", "Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/adobe",
    thumbnail: "images/case-studies/connect-homepage.png",
  },
  {
    id: "adobe-visual-design",
    title: "Visual design works at Adobe",
    company: "Adobe",
    category: "UX",
    opportunity: "Showcasing design works at Adobe that core UI revamps.",
    actions: ["Core UI revamps across Adobe Connect", "Figma prototypes for design exploration"],
    outcomes: ["Visual design showcase of Adobe Connect improvements", "Design system and component evolution"],
    metrics: ["25% reduction in UI support tickets", "100% of active users impacted"],
    timeFrame: "Ongoing",
    tags: ["Adobe Connect", "Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/adobe",
    thumbnail: "images/case-studies/adobe-visual-design.png",
  },
  {
    id: "bizongo-ums",
    title: "Managing users effectively",
    company: "Bizongo",
    category: "UX",
    opportunity: "UMS was handled from the backend till 2020. Bringing all the features upfront and making it as intuitive as possible for new users to onboard quickly was the challenge.",
    actions: ["Redesigned UMS for front-end management", "Simplified data hierarchy", "Created intuitive UI for roles, permissions, users, and companies"],
    outcomes: ["Simplified existing data with the new hierarchy", "User management maintenance time reduced", "Easily Add/Delete User Roles & Permissions; Users; Companies", "Intuitive UI to onboard new users without training"],
    metrics: ["30% reduction in operational errors", "50% faster user onboarding", "Zero engineering dependency for user admin"],
    timeFrame: "1 Sprint; 2 Weeks",
    tags: ["Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/bizongoums",
    thumbnail: "images/case-studies/bizongo-ums.png",
    sections: [
      {
        title: "The Challenge",
        content:
          "User Management System (UMS) was handled entirely from the backend until 2020. The challenge was to bring all management features upfront and make the experience as intuitive as possible for new users to onboard quickly—reducing dependency on technical teams for day-to-day user administration.",
      },
      {
        title: "Approach",
        content: [
          "Redesigned UMS for front-end management—moving control from backend to a self-service interface",
          "Simplified data hierarchy to make roles, permissions, users, and companies easier to understand and manage",
          "Created intuitive UI flows for Add/Edit/Delete operations across User Roles & Permissions, Users, and Companies",
          "Designed for non-technical admins to perform user management without training",
        ],
      },
      {
        title: "Solution",
        content: [
          "One-stop interface for managing user roles, permissions, users, and companies",
          "Clear visual hierarchy and navigation for complex data relationships",
          "Bulk actions and filters to reduce repetitive administrative tasks",
          "Audit-friendly structure with clear ownership and visibility",
        ],
      },
      {
        title: "Impact",
        content: [
          "Simplified existing data with the new hierarchy—easier for teams to understand and maintain",
          "User management maintenance time reduced significantly",
          "Easily Add/Delete User Roles & Permissions; Users; Companies without engineering support",
          "Intuitive UI enabled new users to onboard and manage without formal training",
          "Improved vendor product adoption and user adoption without needing to train",
        ],
      },
      {
        title: "Outcomes",
        content: [
          "Reduced product onboarding time by 50%",
          "Improved user adoption without requiring training sessions",
          "User management shifted from engineering to business teams",
          "Consistent, scalable pattern for future admin features",
        ],
      },
    ],
  },
  {
    id: "bizongo-qc",
    title: "Quality check made easy!",
    company: "Bizongo",
    category: "UX",
    opportunity: "Inefficiency in the Inward QC process was costing the company both time and money. The aim was to reduce warehouse cost by revamping the existing DCMS structure.",
    actions: ["Revamped existing DCMS structure", "Modified QC processes to fit the real scenario", "Designed for executives to complete QC faster"],
    outcomes: ["80% reduction in QC time at warehouses", "Modified existing QC processes to fit in the real scenario", "Reduced Warehouse cost + Increased efficiency"],
    metrics: ["80% reduction in QC time", "Significant warehouse cost savings", "1,000+ daily operations users impacted"],
    timeFrame: "2 Sprints; 4 Weeks",
    tags: ["Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/bizongoqc",
    thumbnail: "images/case-studies/bizongo-qc.png",
  },
  {
    id: "bizongo-artwork-flow",
    title: "Seamless approval workflow creation",
    company: "Bizongo",
    category: "UX",
    opportunity: "Artwork Flow's workflow setup UI had evolved organically and needed to become more intuitive and user-friendly as the product scaled.",
    actions: ["Redesigned workflow setup for Artwork Flow", "Divided approval tasks into stages", "Improved stage settings visibility"],
    outcomes: ["Reduced time in setting up workflows up to 60%", "Drag/Drop feature enables easy creation", "Visibility of stage settings upfront", "Better scalability"],
    metrics: ["60% reduction in workflow setup time", "Drag & drop adoption across 200+ teams"],
    timeFrame: "1 Sprint; 2 Weeks",
    tags: ["Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/bizongo",
    thumbnail: "images/case-studies/bizongo-artwork-flow.png",
  },
  {
    id: "bizongo-contracts",
    title: "Modular contract / T&C creation",
    company: "Bizongo",
    category: "UX",
    opportunity: "Bizongo deals with hundreds of clients. Creating contracts customized for each client with the least effort was critical to safeguard both parties' interests.",
    actions: ["Designed one-stop contract creation flow", "Enabled tracking and maintaining all contracts", "Built signoff feature for new contracts"],
    outcomes: ["One-stop customized contract creation", "Tracking and maintaining all contracts", "Ability to build a contract from scratch", "Signoff feature on all new contracts"],
    metrics: ["70% faster contract creation", "100+ active client contracts managed"],
    timeFrame: "1 Sprint; 2 Weeks",
    tags: ["Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/bizongo",
    thumbnail: "images/case-studies/bizongo-contracts.png",
  },
  {
    id: "yuj-heuristics",
    title: "Heuristics Evaluation Improvement",
    company: "YUJ",
    category: "UX",
    opportunity: "Design evaluations needed to be more systematic and impactful.",
    actions: ["Implemented structured evaluation framework", "Research to implementation of features"],
    outcomes: ["40% improvement in heuristics evaluations"],
    metrics: ["40% improvement in heuristic scores", "30% faster task completion for end users"],
    timeFrame: "2021",
    tags: ["Enterprise UX", "UX Northstar"],
    link: "https://www.midhunkrishnakumar.info/yuj",
    thumbnail: "images/case-studies/yuj-heuristics.png",
  },
  {
    id: "bizongo-ecom",
    title: "Making PPE kits more accessible",
    company: "Bizongo",
    category: "UX",
    opportunity: "Creating an end-to-end flow for procuring and selling PPE Kits and resources in bulk—bringing B2C experience while addressing B2B complexities.",
    actions: ["Designed dedicated E-com portal for PPE Kits", "Compressed complex B2B flows into accessible experience", "Created COVID-19 resources knowledge section"],
    outcomes: ["Sold crores worth of PPE Kits", "Compressed complex B2B flows", "Accessibility and easy to browse", "Giving knowledge on COVID-19 resources"],
    metrics: ["₹2Cr+ in PPE kit sales", "10,000+ orders fulfilled", "Launched in under 4 weeks"],
    timeFrame: "2 Sprints; 4 Weeks",
    tags: ["Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/bizongo-ecom",
    thumbnail: "images/case-studies/bizongo-ecom.png",
  },
  {
    id: "bizongo-design-system",
    title: "Managing and updating design system",
    company: "Bizongo",
    category: "Design Systems",
    opportunity: "Derived from Ant Design, the system needed to be modified to fit Bizongo's use-cases with proper documentation and research.",
    actions: ["Created major component documentation", "Researched best design elements", "Added illustrations for Design System", "Modified Ant Design to fit use-cases"],
    outcomes: ["Reduced feature development time >=50%", "Designer onboarding time reduced drastically", "Created consistency across products", "Forecasted and included latest design trends", "Made a B2B platform more user-friendly"],
    metrics: ["50%+ reduction in feature dev time", "60% faster designer onboarding", "Unified 5 product verticals"],
    timeFrame: "Over 1 yr",
    tags: ["Enterprise UX", "Design Systems"],
    link: "https://www.midhunkrishnakumar.info/bizongo",
    thumbnail: "images/case-studies/bizongo-design-system.png",
  },
  {
    id: "nid-ui-ux-course",
    title: "UI/UX Course & Workshops",
    company: "NID Andhra Pradesh",
    category: "Mentorship",
    opportunity: "Guiding budding designers in UI/UX methodologies through coursework, workshops, and hands-on projects.",
    actions: [
      "Visiting faculty for 3rd year students",
      "Workshops on UX design methodologies",
      "Design workshops and collaborative team activities",
      "Mentored student UX projects end-to-end",
    ],
    outcomes: [
      "Successfully conducted design workshops and team activities",
      "Developed 7+ UX projects with students",
      "Students equipped with practical UX skills",
    ],
    metrics: ["7+ end-to-end UX projects shipped", "30+ students mentored", "3 design workshops conducted"],
    timeFrame: "2022",
    tags: ["Mentorship", "Leadership"],
    link: "https://www.midhunkrishnakumar.info/nid-ap",
    thumbnail: "images/case-studies/nid-ui-ux-course.png",
  },
  {
    id: "iit-branding",
    title: "Branding for Local Poultry Farmers",
    company: "IIT Guwahati",
    category: "Internship",
    opportunity: "Creating branding and marketing presence for local poultry farmers to expand into Tier-1 cities.",
    actions: ["Created branding for local poultry farmers", "Designed E-Com website and shop", "Marketing guidelines to expand into Tier-1 cities"],
    outcomes: ["E-Com website and shop designed", "Marketing guidelines delivered", "Brand strategy for poultry farmers"],
    metrics: ["Full brand identity delivered", "E-commerce site + retail packaging designed", "Market-ready for 3 Tier-1 cities"],
    timeFrame: "2 months",
    tags: ["Brand Strategy", "E-Commerce", "Marketing"],
    link: "https://www.midhunkrishnakumar.info/iit",
    thumbnail: "images/case-studies/iit-branding.png",
  },
  {
    id: "npol-ctd-probe",
    title: "Re-usable CTD Probe Structure",
    company: "NPOL, DRDO",
    category: "Internship",
    opportunity: "Designing a re-usable CTD (Conductivity, Temperature, Depth) probe structure for naval applications.",
    actions: ["Designed re-usable CTD probe structure", "Worked on CAD and Structural design softwares", "Design inducted into Indian Navy"],
    outcomes: ["Design inducted into Indian Navy on April 2018", "Structural design for naval deployment"],
    metrics: ["Design inducted into Indian Navy", "Structural validation passed on first review"],
    timeFrame: "2 months",
    tags: ["Product Design", "CAD", "Defence"],
    link: "https://www.midhunkrishnakumar.info/npol",
    thumbnail: "images/case-studies/npol-ctd-probe.png",
  },
];

export const FEATURED_PROJECT_IDS = [
  "gen-ai",
  "event-joining",
  "bizongo-qc",
  "connect-homepage",
] as const;

export const AWARDS: Award[] = [
  {
    id: "product-sheriff-sep-2025",
    title: "Product Sheriff of the Month",
    issuer: "Adobe Connect All Hands",
    date: "Sep 2025",
    description: "Recognized for handling and championing UI revamp changes on short notice, guiding the team with clarity, and delivering high-quality experiences under tight timelines.",
  },
  {
    id: "extreme-ownership-q1-2025",
    title: "Extreme Ownership",
    issuer: "Adobe · DALP Awards Q1 2025",
    date: "Feb 2025",
    description: "Awarded for driving innovation in Adobe Connect, shaping its product vision, championing exceptional UX, and leading multiple AI features aligned with the latest industry standards.",
  },
  {
    id: "extreme-ownership-q3-2024",
    title: "Extreme Ownership",
    issuer: "Adobe · DALP Awards Q3 2024",
    date: "Nov 2024",
    description: "Honored for exceptional contributions to AI initiatives within Adobe Connect—driving impactful solutions, full accountability, and AI integrations that exceed user expectations.",
  },
  {
    id: "kudos-2023",
    title: "Kudos Award",
    issuer: "Adobe Design India",
    date: "Jan 2023",
    description: "Peer recognition Q1 2023 — for being super-efficient, collaborative, resourceful, and going beyond core work in product, website & marketing. Explored how new technology shapes the future of the space.",
  },
  {
    id: "bravo-2022",
    title: "Bravo Award",
    issuer: "Adobe Design India",
    date: "Oct 2022",
    description: "Team recognition Q4 2022 — for the incredibly infectious energy, passion for the product, and extending the same energy into executing for the brand team in DesignMix.",
  },
  {
    id: "most-enthusiastic-2021",
    title: "Most Enthusiastic Person",
    issuer: "Bizongo · BGEP Awards 2021",
    date: "Jan 2022",
    description: "The person who is very enthusiastic about new challenges, has a never say die attitude, looks to solve problems, and creates a positive impact on the team.",
  },
  {
    id: "spot-award-2021",
    title: "SPOT Award",
    issuer: "Bizongo · BGEP Quarterly Awards",
    date: "Nov 2021",
    description: "Team recognition for UX across PODs—Supply Chain, Cataloguing, Artwork Flow. Outstanding work on user-flows, Parallel stage, Printer workflow, and E-sign feature.",
  },
  {
    id: "star-of-the-week-2021",
    title: "Star of the Week",
    issuer: "Bizongo",
    date: "Oct 2021",
    description: "Handled new design flows and AR 2.0 feature flows across Partner Hub, GoPartner and GoOps meticulously in a very short period. Collaborated well with stakeholders.",
  },
  {
    id: "upscaling-award-2021",
    title: "Upscaling Award",
    issuer: "Bizongo · Individual contribution",
    date: "Jun 2021",
    description: "For the great effort put in to design experiences for Kranti COVID-19 Website.",
  },
  {
    id: "extra-mile-2020",
    title: "Extra Mile Award",
    issuer: "Bizongo · Quarterly BGEP Awards",
    date: "Jul 2020",
    description: "Worked round-the-clock for bringing out designs for new PPE flows on the main Bizongo website and COVID partnership pages, in really tight deadlines.",
  },
  {
    id: "spot-award-2020",
    title: "SPOT Award",
    issuer: "Bizongo · Quarterly BGEP Awards",
    date: "May 2020",
    description: "For bringing infectious energy and spirit to the team. Great job on the quick, effective work for the COVID website. 'Great sense of product development and ideation'—feedback received.",
  },
];

export const EXPERIENCE_TIMELINE: Experience[] = [
  {
    id: "adobe",
    company: "Adobe Inc.",
    role: "Product Designer 2 | Lead Designer — Adobe Connect",
    period: "May 2022 - Present",
    duration: "Since May 2022",
    stats: [
      "50% less first-time device setup friction",
      "40% faster content creation (AI-driven)",
      "100% of active users impacted by UI revamps",
    ],
    highlights: [
      "Gen AI Explorations: Reduced asset creation effort by 40%, enabling faster content prep for hosts",
      "Quiz Pod: Enabled instant quiz creation and delivery, improving host efficiency by 50%",
      "Joining Experience: Cut device preference screen time by 50%, increasing first-time adoption",
      "Homepage Revamp: Introduced customizable widgets, boosting user engagement by 35%",
      "Core UI Revamp: Improved visual consistency, reducing UI-related support tickets by 25%",
    ],
    tags: ["Enterprise UX", "AI Product Design", "Design Systems", "Real-time Collaboration", "Notifications & Engagement"],
    link: "https://www.midhunkrishnakumar.info/adobe",
    summary: "Driving AI-first product innovation for a large-scale collaboration platform, embedding generative and assistive intelligence into core user workflows. Operating at the intersection of design, product, and engineering to define new interaction paradigms, accelerate decision-making, and deliver differentiated, high-impact user experiences.",
  },
  {
    id: "yuj",
    company: "YUJ Designs",
    role: "UX Design Consultant",
    period: "2021 – 2022",
    duration: "1 year",
    stats: [
      "25% improvement in client satisfaction",
      "20+ deliverables across client projects",
      "25% faster iteration cycles",
    ],
    highlights: [
      "Enterprise Product Design: Streamlined workflows, reducing task completion time by 30%",
      "Client Collaborations: Improved stakeholder alignment by 40% through structured UX solutions",
      "Design Systems Contribution: Introduced reusable patterns, increasing design consistency by 35%",
      "Rapid Problem Solving: Delivered high-quality designs under tight timelines, reducing iteration cycles by 25%",
    ],
    tags: ["Enterprise UX", "UX Strategy", "Interaction Design", "Stakeholder Collaboration", "Design Thinking"],
    link: "https://www.midhunkrishnakumar.info/yuj",
    summary: "Drove end-to-end UX for global clients in a fast-paced consulting environment, solving complex, cross-domain problems through research-led design. Partnered with stakeholders to reframe ambiguous business requirements into clear product directions, delivering scalable and intuitive user experiences.",
  },
  {
    id: "bizongo",
    company: "Bizongo",
    role: "UX Designer",
    period: "2020 – 2021",
    duration: "1 year",
    stats: [
      "20% improvement in platform efficiency",
      "1,000+ daily operations users",
      "30% reduction in operational errors",
    ],
    highlights: [
      "Supply Chain Workflows: Simplified complex journeys, reducing errors by 30%",
      "Platform Usability Improvements: Boosted task completion speed by 25%",
      "Feature Enhancements: Reduced repetitive actions by 40%, increasing operational efficiency",
      "User-centric Iterations: Incorporated feedback loops, improving user satisfaction by 35%",
    ],
    tags: ["B2B UX", "Product Design", "User Flows", "Information Architecture", "Data-driven Design"],
    link: "https://www.midhunkrishnakumar.info/bizongo",
    summary: "Owned UX for critical supply chain and procurement workflows, transforming complex, data-intensive systems into streamlined, high-efficiency experiences. Influenced product direction through rapid prototyping and deep cross-functional collaboration, improving usability, consistency, and operational effectiveness at scale.",
  },
  {
    id: "adobe-xd-intern",
    company: "Adobe Inc. (Adobe XD Team)",
    role: "UX Design Intern",
    period: "2019",
    duration: "2019",
    stats: ["Came up with 130+ iterations on design system manager"],
    highlights: [
      "Graduation Project: Solved real product challenges in Adobe XD, improving prototype clarity by 30%",
      "Design Execution: Delivered production-ready outputs that reduced design handoff errors by 25%",
      "User Testing & Iteration: Applied user feedback to improve workflows, increasing task success rate by 20%",
      "Learning & Adaptation: Quickly ramped up to Adobe's design standards, contributing to team productivity",
    ],
    tags: ["UX Fundamentals", "Interaction Design", "Prototyping & Wireframing", "User Flows", "Visual Design"],
    summary: "Contributed to the design of a leading design tool, working on core product experiences within a high-impact product team. Collaborated with designers and engineers to explore interaction patterns and refine user workflows, building a strong foundation in product thinking, craft, and design systems.",
  },
  {
    id: "nid-faculty",
    company: "National Institute of Design, Andhra Pradesh",
    role: "Visiting Faculty",
    period: "Jan 2022 - May 2022",
    duration: "2 months",
    stats: ["7+ student UX projects", "Design workshops & team activities"],
    highlights: [
      "Guided 3rd year students in UI/UX course",
      "Conducted workshops on UX design methodologies",
      "Continues to guide budding UX aspirants",
    ],
    tags: ["Mentorship", "Leadership"],
    summary: "Mentored and guided design students on UX thinking, interaction design, and real-world problem solving. Brought industry context into academia, shaping how students approach complex design challenges with structured thinking, critique, and execution rigor.",
  },
  {
    id: "think-ethical",
    company: "Think Ethical, Bangalore",
    role: "Founder Mentor",
    period: "2019 - Present",
    duration: "Ongoing",
    highlights: [
      "Mentorship for emerging designers and design aspirants",
      "Design talks and self upscaling sessions",
    ],
    tags: ["Mentorship", "Leadership"],
    link: "http://www.thinkethical.in/",
  },
];

export const AI_WORK_ITEMS: AIWork[] = [
  {
    id: "ai-blog",
    title: "AI Blog Generator",
    description: "Explored and designed intelligent workflow for AI-assisted content generation, reducing manual effort and enabling rapid customization.",
    impact: ["Reduced content creation effort", "One-click customization", "Cost reduction"],
    tags: ["AI Initiatives", "Adobe Connect"],
  },
  {
    id: "gen-ai-pods",
    title: "Gen AI Product Explorations",
    description: "Product explorations integrating Gen AI image and content generators into enterprise workflows.",
    impact: ["Workflow augmentation", "Asset library optimization", "Scalable content"],
    tags: ["AI Initiatives", "Enterprise UX"],
  },
  {
    id: "intelligent-workflows",
    title: "Intelligent Workflow Contributions",
    description: "Contributions to AI-driven features in Adobe Connect, focusing on automation and smart defaults.",
    impact: ["Reduced repetitive tasks", "Smarter defaults", "Enhanced productivity"],
    tags: ["AI Initiatives", "Adobe Connect", "Enterprise UX"],
  },
];

export const IMPACT_METRICS: ImpactMetric[] = [
  { label: "First-time Device Setup Friction", value: "50%", context: "Joining experience at Adobe Connect", projectId: "event-joining" },
  { label: "Host Efficiency (Quiz Pod)", value: "50%", context: "Adobe Connect", projectId: "quiz-pod" },
  { label: "User Engagement", value: "35%", context: "Homepage revamp at Adobe Connect", projectId: "connect-homepage" },
  { label: "UI Support Tickets", value: "25%", context: "Core UI revamp at Adobe Connect", projectId: "adobe-visual-design" },
  { label: "Operational Errors", value: "30%", context: "Supply chain workflows at Bizongo", projectId: "bizongo-ums" },
  { label: "QC Time", value: "80%", context: "Bizongo warehouses", projectId: "bizongo-qc" },
  { label: "Stakeholder Alignment", value: "40%", context: "Client collaborations at YUJ Designs", projectId: "yuj-heuristics" },
  { label: "Asset Creation Effort", value: "40%", context: "Gen AI explorations at Adobe", projectId: "gen-ai" },
  { label: "Workflow Setup Time", value: "60%", context: "Artwork Flow at Bizongo", projectId: "bizongo-artwork-flow" },
  { label: "Feature Dev Time", value: "50%", context: "Design system at Bizongo", projectId: "bizongo-design-system" },
];

export interface CareerStage {
  id: string;
  stage: string;
  period: string;
  focus: string;
  /** Expanded copy for the detail panel */
  details: string;
}

export const CAREER_EVOLUTION: CareerStage[] = [
  {
    id: "computer-science",
    stage: "Computer Science",
    period: "2012-2014",
    focus: "Programming, algorithms, and computing fundamentals",
    details:
      "Early grounding in computer science—programming, algorithms, and systems thinking—that later complemented a move into design and product work.",
  },
  {
    id: "industrial",
    stage: "Industrial Design",
    period: "2015-2019",
    focus: "NID — UI/UX, Product Design, Design Business",
    details:
      "Foundation at NID in industrial and product design. UI/UX, physical product craft, and design business—building a systems-first mindset before moving fully into digital experience design.",
  },
  {
    id: "ux",
    stage: "UX design",
    period: "2019-2021",
    focus: "Bizongo, YUJ — Research to implementation",
    details:
      "End-to-end UX across B2B and enterprise: research, flows, and shipping with Bizongo and YUJ. From discovery to handoff, balancing speed with clarity for complex supply-chain and client products.",
  },
  {
    id: "b2b",
    stage: "B2B systems",
    period: "2021-2022",
    focus: "ERP, Design Systems, cross-pod ownership",
    details:
      "Deep work on large-scale B2B systems: ERP surfaces, design systems, and owning outcomes across pods. Patterns, consistency, and stakeholder alignment at the core of every release.",
  },
  {
    id: "b2c",
    stage: "B2C products",
    period: "2022-2024",
    focus: "Adobe Connect — product UX for hosts and participants",
    details:
      "Design for broad, consumer-grade clarity inside an enterprise product—joining flows, engagement, and surfaces that scale to diverse users without losing polish.",
  },
  {
    id: "ai-first",
    stage: "AI first products",
    period: "2024-2026",
    focus: "Adobe Connect — Gen AI, intelligent workflows",
    details:
      "Leading AI-first product evolution for Adobe Connect—Gen AI explorations, intelligent workflows, and measurable impact on hosts and admins. Design that keeps pace with fast-moving AI capabilities.",
  },
];

export const MENTORSHIP = [
  {
    id: "nid",
    role: "Visiting Faculty",
    org: "National Institute of Design, Andhra Pradesh",
    period: "2022",
    description: "Guided third-year students in a UI/UX course and conducted workshops on UX design methodologies. Continues to mentor budding UX aspirants.",
    tags: ["Leadership", "Teaching"],
  },
  {
    id: "think-ethical",
    role: "Founder Mentor",
    org: "Think Ethical, Bangalore",
    period: "2019 - Present",
    description: "Mentoring emerging designers through design talks and upskilling sessions. Brought in industry leaders for fireside chat sessions with students.",
    tags: ["Leadership", "Mentorship", "Collaboration"],
  },
  {
    id: "adobe-mentor",
    role: "UX Guide",
    org: "Adobe Inc.",
    period: "2022 - Present",
    description: "Guides and mentors budding UX enthusiasts. Leads design project management. Conducted seminars and workshops within the office and at colleges.",
    tags: ["Leadership", "Mentorship", "Adobe Connect"],
  },
];

export const CONTACT = {
  email: "midhun2k14@gmail.com",
  linkedin: "https://www.linkedin.com/in/midhunkrishnakumar",
  resume: "https://www.midhunkrishnakumar.info/_files/ugd/410795_5be92ebc3d0c4ea5ab2aeb565b3eb965.pdf",
};
