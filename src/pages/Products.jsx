import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import PageHero from "../components/ui/PageHero";
import Marquee from "../components/common/Marquee";
import { useContent } from "../context/contentStore";
import { getProductImage } from "../images/imageRegistry";
import SEOHead from "../components/common/SEOHead";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import ProgressiveImage from "../components/ui/ProgressiveImage";
import styles from "./Products.module.css";

export default function Products() {
  const location = useLocation();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const { categories, products, loading, error, reload } = useContent();
  const filters = [
    { key: "all", label: "All Products" },
    ...categories.map((category) => ({
      key: category.slug,
      label: category.name,
    })),
  ];

  useScrollReveal([filter]);

  // Handle hash navigation (e.g. /products#chamomile-honey)
  useEffect(() => {
    if (location.hash) {
      const slug = location.hash.replace("#", "");
      const el = document.getElementById(slug);
      if (el)
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          200,
        );
    }
  }, [location, products]);

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  const riceFiltered = filtered.filter((p) => p.category === "rice");
  const teaFiltered = filtered.filter((p) => p.category === "tea");

  return (
    <>
      <SEOHead
        title="Our Products – Instant Fried Rice & Herbal Teas"
        description="Explore Grain Muse's full range: 3 instant fried rice varieties and 4 herbal tea blends, all made with 100% natural ingredients."
        path="/products"
      />
      <PageHero
        eyebrow="Our Offerings"
        title="Pure ingredients,<br/><em>thoughtful recipes</em>"
        subtitle="Explore our full range of instant fried rice and herbal teas, each crafted with care to bring nourishment and flavour into your everyday life."
        size="md"
      />

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={`container ${styles.filterInner}`}>
          <div
            className={styles.filterGroup}
            role="group"
            aria-label="Filter products"
          >
            {filters.map(({ key, label }) => {
              const count =
                key === "all"
                  ? products.length
                  : products.filter((p) => p.category === key).length;
              return (
                <button
                  key={key}
                  className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ""}`}
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                >
                  {label}
                  <span className={styles.filterCount}>{count}</span>
                </button>
              );
            })}
          </div>
          <p className={styles.filterMeta}>
            Showing <strong>{filtered.length}</strong> product
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className={`container ${styles.pageBody}`}>
        {loading && (
          <LoadingSkeleton variant="rows" count={4} label="Loading products" />
        )}
        {error && (
          <div role="alert">
            <p>{error}</p>
            <button type="button" className="btn btn-outline" onClick={reload}>
              Try Again
            </button>
          </div>
        )}
        {/* Rice Category */}
        {riceFiltered.length > 0 && (
          <div className={styles.category}>
            <div className={`${styles.categoryHeader} sr`}>
              <h2 className={styles.categoryTitle}>
                Instant Fried Rice
                <span className={styles.categoryCount}>
                  {riceFiltered.length} varieties
                </span>
              </h2>
              <p className={styles.categoryDesc}>
                Premium grain blends, naturally seasoned and ready in under
                three minutes without compromising on quality or flavour.
              </p>
            </div>
            <div className={styles.productGrid}>
              {riceFiltered.map((p, i) => (
                <FullProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  expanded={expanded === p.id}
                  onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tea Category */}
        {teaFiltered.length > 0 && (
          <div className={styles.category}>
            <div className={`${styles.categoryHeader} sr`}>
              <h2 className={styles.categoryTitle}>
                Herbal Teas
                <span className={styles.categoryCount}>
                  {teaFiltered.length} blends
                </span>
              </h2>
              <p className={styles.categoryDesc}>
                Whole-botanicals brewed for wellness, balance, and ritual
                caffeine-free blends for every hour of your day.
              </p>
            </div>
            <div className={styles.productGrid}>
              {teaFiltered.map((p, i) => (
                <FullProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  expanded={expanded === p.id}
                  onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Marquee dark={false} />

      {/* Trade CTA */}
      <section className={styles.tradeCta}>
        <div className={`container ${styles.tradeCtaInner}`}>
          <div className="sr">
            <p className="section-eyebrow">For Businesses</p>
            <h2
              className="display-sm"
              style={{ marginTop: "var(--space-sm)", color: "var(--gm-deep)" }}
            >
              Wholesale &amp; distribution <em>enquiries welcome</em>
            </h2>
            <p
              className="body-sm"
              style={{ marginTop: "var(--space-md)", maxWidth: 480 }}
            >
              We partner with retailers, distributors, and hospitality
              businesses across Sri Lanka. Reach out to discuss bulk orders,
              private label, and bespoke formulations.
            </p>
          </div>
          <div className="sr sr-delay-2">
            <Link to="/contact" className="btn btn-primary btn-lg">
              Get in Touch <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Full Product Card with Expandable Detail ────────────── */
function FullProductCard({ product, index, expanded, onToggle }) {
  const {
    slug,
    name,
    subtitle,
    tagline,
    desc,
    longDesc,
    tags,
    highlights,
    nutrition,
    badge,
    color,
  } = product;

  return (
    <article
      id={product.slug}
      className={`${styles.productCard} sr`}
      style={{ "--accent": color, transitionDelay: `${index * 0.1}s` }}
    >
      <div className={styles.pcTop}>
        <div className={styles.pcLeft}>
          <ProductImage slug={slug} alt={"avatar" || name} />
          {badge && <span className={styles.pcBadge}>{badge}</span>}
        </div>
        <div className={styles.pcContent}>
          <p className={styles.pcSubtitle}>{subtitle}</p>
          <h3 className={styles.pcName}>{name}</h3>
          <p className={styles.pcTagline}>{tagline}</p>
          <p className={styles.pcDesc}>{desc}</p>
          <div className={styles.pcTags}>
            {tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.pcRight}>
          <button
            className={`${styles.pcExpand} ${expanded ? styles.pcExpandOpen : ""}`}
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Expandable panel */}
      <div
        className={`${styles.pcPanel} ${expanded ? styles.pcPanelOpen : ""}`}
      >
        <div className={styles.pcPanelInner}>
          <div className={styles.pcDetail}>
            <h4 className={styles.pcDetailTitle}>About This Product</h4>
            {longDesc.split("\n\n").map((para, i) => (
              <p key={i} className={styles.pcDetailPara}>
                {para}
              </p>
            ))}
          </div>
          <div className={styles.pcSideInfo}>
            {/* Highlights */}
            <div className={styles.pcHighlights}>
              <h4 className={styles.pcDetailTitle}>Key Highlights</h4>
              {highlights.map((h) => (
                <p
                  key={h}
                  className="highlight-line"
                  style={{ marginBottom: 10 }}
                >
                  {h}
                </p>
              ))}
            </div>
            {/* Nutrition */}
            <div className={styles.pcNutrition}>
              <h4 className={styles.pcDetailTitle}>
                Nutrition per Serving ({nutrition.servingSize})
              </h4>
              <div className={styles.pcNutrGrid}>
                {Object.entries(nutrition)
                  .filter(([k]) => k !== "servingSize")
                  .map(([key, val]) => (
                    <div key={key} className={styles.pcNutrItem}>
                      <span className={styles.pcNutrVal}>{val}</span>
                      <span className={styles.pcNutrKey}>{key}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.pcAccentBar} />
    </article>
  );
}

function ProductImage({ slug, alt }) {
  const imgUrl = getProductImage(slug);
  const altText = alt || `${slug.replace(/-/g, " ")} product image`;

  return (
    <ProgressiveImage
      src={imgUrl}
      alt={altText}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadius: "12px",
      }}
    />
  );
}
