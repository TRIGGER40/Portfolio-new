import { useRef, useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ARTICLES, getArticleBySlug, thoughtLayerCardId } from "../data/articles";
import type { ArticleBodyBlock } from "../data/articles";
import { ShimmerImg } from "../components/ShimmerImg";
import { trackArticleOpen } from "../lib/analytics";
import styles from "./ArticlePage.module.css";

function ArticleBody({ blocks }: { blocks: ArticleBodyBlock[] }) {
  return (
    <div className={styles.body}>
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return <h2 key={i}>{block.text}</h2>;
        }
        if (block.type === "p") {
          return <p key={i}>{block.text}</p>;
        }
        if (block.type === "ul") {
          return (
            <ul key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "figure") {
          return (
            <figure key={i} className={styles.figure}>
              <p className={styles.figureCaption}>{block.caption}</p>
            </figure>
          );
        }
        if (block.type === "link") {
          return (
            <div key={i} className={styles.callout}>
              <a href={block.href} target="_blank" rel="noopener noreferrer">
                {block.label}
              </a>
              {block.description ? <p className={styles.calloutDesc}>{block.description}</p> : null}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function BlogNav({ articleSlug, fromSection }: { articleSlug: string; fromSection?: string }) {
  const navRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
  }, [updateArrows]);

  const scroll = (dir: -1 | 1) => {
    const el = navRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: "smooth" });
  };

  return (
    <div className={styles.blogNavColumn}>
      <h2 className={styles.blogNavHeader}>Articles</h2>
      <div className={styles.blogNavRow}>
        {canScrollLeft && (
          <button
            type="button"
            className={`${styles.blogNavArrow} ${styles.blogNavArrowLeft}`}
            onClick={() => scroll(-1)}
            aria-label="Scroll articles left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        <nav ref={navRef} className={styles.blogNav} aria-label="Blog articles">
          {ARTICLES.map((item) => {
            const isActive = item.slug === articleSlug;
            return (
              <Link
                key={item.slug}
                to={`/articles/${item.slug}`}
                state={{ fromSection: fromSection || "thoughts" }}
                className={`${styles.blogNavPill} ${isActive ? styles.blogNavPillActive : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={(e) => {
                  if (!isActive) return;
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <ShimmerImg
                  src={item.coverSrc}
                  alt=""
                  className={styles.blogNavThumb}
                  loading="lazy"
                />
                <span className={styles.blogNavPillLabel}>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        {canScrollRight && (
          <button
            type="button"
            className={`${styles.blogNavArrow} ${styles.blogNavArrowRight}`}
            onClick={() => scroll(1)}
            aria-label="Scroll articles right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSection = (location.state as { fromSection?: string } | null)?.fromSection;
  const article = getArticleBySlug(slug);

  useEffect(() => {
    if (article) trackArticleOpen(article.slug, article.title);
  }, [article?.slug]);

  if (!article) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <h1>Article not found</h1>
          <button onClick={() => fromSection ? navigate(`/#${fromSection}`) : navigate(-1)} className={styles.backLink}>
            ← Back to Thought Layer
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${styles.page} ${styles.pageArticle}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarSide}>
            <button onClick={() => fromSection ? navigate(`/#${fromSection}`) : navigate(-1)} className={styles.backLink}>
              ← Back
            </button>
          </div>
          <p className={styles.topBarTitle}>My thoughts</p>
          <div className={`${styles.topBarSide} ${styles.topBarSideEnd}`}>
            <Link to="/#thoughts" className={styles.allLink}>
              All articles
            </Link>
          </div>
        </div>
      </header>

      <div className={styles.articleShell}>
        <div className={styles.blogNavTrack}>
          <div className={styles.blogNavSpacer} aria-hidden="true" />
          <BlogNav articleSlug={article.slug} fromSection={fromSection} />
        </div>
        <div className={styles.articleMain}>
          <article className={styles.article}>
            <div className={styles.heroImageWrap}>
              <ShimmerImg src={article.coverSrc} alt={article.coverAlt} className={styles.heroImage} loading="eager" />
            </div>
            <div className={styles.authorByline}>
              <img
                src={`${import.meta.env.BASE_URL}midhun-headshot.png`}
                alt=""
                className={styles.authorAvatar}
                width={72}
                height={72}
                decoding="async"
              />
              <div className={styles.authorMeta}>
                <p className={styles.authorName}>{article.author}</p>
                <p className={styles.authorSubrow}>
                  <span className={styles.authorRole}>{article.roleLine}</span>
                  <span className={styles.authorSep} aria-hidden>
                    ·
                  </span>
                  <time className={styles.authorDate}>{article.published}</time>
                </p>
              </div>
            </div>
            <h1 className={styles.title}>{article.title}</h1>
            <ArticleBody blocks={article.blocks} />
          </article>
        </div>
      </div>
    </motion.div>
  );
}
