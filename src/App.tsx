import { useRef, useState, useLayoutEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { AnimatePresence, motion } from "framer-motion";
import { SearchProvider, useSearchContext } from "./context/SearchContext";
import { useSearch } from "./hooks/useSearch";
import { Hero } from "./components/Hero";
import { InsightCard } from "./components/InsightCard";
import { ExperienceTimeline } from "./components/ExperienceTimeline";
import { AwardsCarousel } from "./components/AwardsCarousel";
import { ImpactDashboard } from "./components/ImpactDashboard";
import { Mentorship } from "./components/Mentorship";
import { CareerEvolution } from "./components/CareerEvolution";
import { ThoughtLayer } from "./components/ThoughtLayer";
import { Testimonials } from "./components/Testimonials";
import { Footer } from "./components/Footer";
import { RecruiterPanel } from "./components/RecruiterPanel";
import { BackgroundGlow } from "./components/BackgroundGlow";
import { CursorGlow } from "./components/CursorGlow";
import { ScrollHeader } from "./components/ScrollHeader";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ArticlePage } from "./pages/ArticlePage";
import { ExitFeedbackDemo } from "./pages/ExitFeedbackDemo";
import { WorksPage } from "./pages/WorksPage";
import { UXReport } from "./pages/UXReport";
import { ResumePage } from "./pages/ResumePage";
import { useScrollSaver, useScrollRestore } from "./hooks/useScrollRestore";
import { initAnalytics, trackPageView } from "./lib/analytics";
import { useSectionTracker } from "./hooks/useSectionTracker";

/* Initialize analytics once */
initAnalytics();

/** Track SPA route changes */
function RouteTracker() {
  const location = useLocation();
  useLayoutEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

/** Save scroll positions globally so back-navigation restores them. */
function ScrollManager() {
  useScrollSaver();
  useScrollRestore();
  return null;
}

/** Client navigations to `/#section` scroll to the matching element after paint. */
function ScrollToHashElement() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) return;
    const id = hash.replace(/^#/, "");
    const run = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    run();
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [pathname, hash]);
  return null;
}

function MainContent({
  homeInputFocused,
  onFocusStateChange,
  focusHomeSearchNonce,
}: {
  homeInputFocused: boolean;
  onFocusStateChange: (focused: boolean) => void;
  focusHomeSearchNonce: number;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  useSectionTracker();
  const { query, conversationHistory } = useSearchContext();
  const { summaryInsight, totalMatches, hasActiveFilter } = useSearch(query);
  const inChat = conversationHistory.length > 0;
  const showScrolledContent = !inChat && !homeInputFocused;

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      className="app-page-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <ScrollToHashElement />
      <Hero
        homeInputFocused={homeInputFocused}
        onScrollClick={scrollToContent}
        onFocusStateChange={onFocusStateChange}
        focusHomeSearchNonce={focusHomeSearchNonce}
      />

      <AnimatePresence mode="wait">
        {showScrolledContent && (
          <motion.div
            key="mainContent"
            ref={contentRef}
            className="content-area"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={pageTransition}
          >
            <main>
              <AnimatePresence>
                {hasActiveFilter && summaryInsight && (
                  <InsightCard
                    message={summaryInsight}
                    matchCount={totalMatches > 0 ? totalMatches : undefined}
                  />
                )}
              </AnimatePresence>
              <ExperienceTimeline />
              <AwardsCarousel />
              <ImpactDashboard />
              <Mentorship />
              <CareerEvolution />
              <ThoughtLayer />
              <Testimonials />
              <Footer />
            </main>

            <RecruiterPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const pageTransition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

function AppContent() {
  const { conversationHistory } = useSearchContext();
  const [homeInputFocused, setHomeInputFocused] = useState(false);
  const [focusHomeSearchNonce, setFocusHomeSearchNonce] = useState(0);
  const inChat = conversationHistory.length > 0;
  const showScrollHeader = !inChat && !homeInputFocused;

  return (
    <>
      <AnimatePresence mode="wait">
        {showScrollHeader && (
          <motion.div
            key="scrollHeader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={pageTransition}
          >
            <ScrollHeader
              onOpenAskFocused={() => {
                setHomeInputFocused(true);
                setFocusHomeSearchNonce((n) => n + 1);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <MainContent
        homeInputFocused={homeInputFocused}
        onFocusStateChange={setHomeInputFocused}
        focusHomeSearchNonce={focusHomeSearchNonce}
      />
    </>
  );
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "";

export default function App() {
  return (
    <BrowserRouter basename={basename} unstable_useTransitions={false}>
      <ScrollManager />
      <RouteTracker />
      <SearchProvider>
        <BackgroundGlow />
        <CursorGlow />
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/works/:companyId" element={<WorksPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/exit-feedback" element={<ExitFeedbackDemo />} />
          <Route path="/ux-report" element={<UXReport />} />
          <Route path="/resume" element={<ResumePage />} />
        </Routes>
      </SearchProvider>
    </BrowserRouter>
  );
}
