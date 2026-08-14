import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Zap, Heart, Shield } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import Marquee from "../components/common/Marquee";
import ProductCard from "../components/common/ProductCard";
import SectionHeader from "../components/ui/SectionHeader";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import { useContent } from "../context/contentStore";
import { getHeroImage } from "../images/imageRegistry";
import SEOHead from "../components/common/SEOHead";
import styles from "./Home.module.css";
import { useState } from "react";

const WHY_CARDS = [
  {
    icon: <Leaf size={22} />,
    num: "01",
    title: "No Artificial Additives",
    desc: "Every ingredient in our products is 100% natural. No artificial colours, flavours, or preservatives ever. We put what belongs in food, and nothing else.",
  },
  {
    icon: <Zap size={22} />,
    num: "02",
    title: "Ready in Minutes",
    desc: "Convenience you can feel good about. Our instant range delivers a wholesome, satisfying meal in under five minutes without compromise on quality.",
  },
  {
    icon: <Heart size={22} />,
    num: "03",
    title: "Whole Ingredient Philosophy",
    desc: "We start with whole grains and whole botanicals, not powdered extracts or concentrates. Real ingredients that retain their natural integrity.",
  },
  {
    icon: <Shield size={22} />,
    num: "04",
    title: "Crafted for Balance",
    desc: "Each recipe is developed to be deeply flavourful yet nutritionally balanced for everyday enjoyment that you can feel great about.",
  },
];

export default function Home() {
  useScrollReveal([]);
  const [activeTab, setActiveTab] = useState("rice");
  const {
    products,
    company,
    values,
    loading: contentLoading,
    error: contentError,
  } = useContent();
  const riceProducts = products.filter((product) => product.category === "rice");
  const teaProducts = products.filter((product) => product.category === "tea");
  const displayProducts = activeTab === "rice" ? riceProducts : teaProducts;

  useScrollReveal([activeTab]);

  return (
    <>
      <SEOHead
        title="Craft Instant Fried Rice & Herbal Teas"
        description="Grain Muse crafts artisan instant fried rice and restorative herbal teas using 100% natural Sri Lankan ingredients. No artificial additives, ever."
        path="/"
      />
      <section className={`${styles.heroIntro}`}>
        <div className={styles.heroBrand}>
          <div className={styles.heroLogoMark}>
            <LogoImage
              slug={company.logo}
              alt={"logo"}
              className={styles.logoImg}
            />
          </div>

          <div className={styles.heroWordmark}>
            <span className={styles.heroWordGrain}>Grain</span>
            <span className={styles.heroWordDot}>.</span>
            <span className={styles.heroWordMuse}>Muse</span>
          </div>

          <div className={styles.heroDivider}>
            <span className={styles.heroDividerLine} />
            <span className={styles.heroDividerLabel}>
              Craft Foods &amp; Herbal Teas
            </span>
            <span className={styles.heroDividerLine} />
          </div>
          <div className={styles.heroStats}>
            <AnimatedCounter
              to={7}
              suffix="+"
              label="Signature Products"
              light
            />
            <div className={styles.statDivider} />
            <AnimatedCounter
              to={100}
              suffix="%"
              label="Natural Ingredients"
              light
            />
            <div className={styles.statDivider} />
            <AnimatedCounter to={4} label="Min to Prepare" light />
          </div>
          <div className={styles.marqueeWrap}>
            <Marquee />
          </div>
        </div>
      </section>
      <section className={styles.hero}>
        <div className={styles.heroNoise} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />

        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <p className={`${styles.heroEyebrow} section-eyebrow`}>
              Natural · Wholesome · Crafted
            </p>
            <h1 className={styles.heroTitle}>
              Food made with
              <br />
              <em className={styles.heroEm}>intention</em> &amp;
              <br />
              pure ingredients
            </h1>
            <p className={styles.heroDesc}>
              Grain Muse brings you artisan instant fried rice and restorative
              herbal teas, real ingredients, no shortcuts, crafted to nourish
              your everyday moments.
            </p>
            <div className={styles.heroCta}>
              <Link to="/products" className="btn btn-gold btn-lg">
                Explore Products
                <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn btn-ghost btn-lg">
                Our Story
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <HeroIllustration />
          </div>
        </div>

        {/* Scroll hint */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollLine} />
          <span className={styles.scrollText}>Scroll to discover</span>
        </div>
      </section>

      {/* ── ABOUT PREVIEW ────────────────────────────────────── */}
      <section className={`section-pad ${styles.aboutSection}`}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <div className={styles.aboutVisual}>
              <AboutVisual />
            </div>
            <div className={styles.aboutContent}>
              <SectionHeader
                eyebrow="Our Philosophy"
                title="Grown from the earth,<br/><em>made with care</em>"
                subtitle="At Grain Muse, we believe that convenience should never come at the cost of quality. Every product begins with carefully sourced ingredients, whole grains, hand-picked herbs, and natural seasonings that honour tradition."
              />
              <div className={styles.valuesGrid}>
                {values.map((v) => (
                  <div key={v.title} className={`${styles.valueItem} sr`}>
                    <span className={styles.valueIcon}>{v.icon}</span>
                    <div>
                      <p className={styles.valueTitle}>{v.title}</p>
                      <p className={styles.valueDesc}>{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                className={`btn btn-primary ${styles.aboutCta}`}
              >
                Read Our Story
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTS PREVIEW ─────────────────────────────────── */}
      <section className={styles.productsSection}>
        <div className={styles.productsBg} aria-hidden="true">
          <span className={styles.productsBgText}>PRODUCTS</span>
        </div>
        <div className="container">
          <div className={`${styles.productsHeader} sr`}>
            <SectionHeader
              eyebrow="Our Range"
              title="Crafted for every<br/><em>moment &amp; mood</em>"
              light
            />
            <p className={styles.productsHeaderDesc}>
              Three bold instant fried rice varieties and four restorative
              herbal teas, each formulated to fit naturally into your day.
            </p>
          </div>

          {/* Tabs */}
          <div className={`${styles.tabs} sr`} role="tablist">
            {[
              {
                key: "rice",
                label: "Instant Fried Rice",
                count: riceProducts.length,
              },
              {
                key: "tea",
                label: "Herbal Teas",
                count: teaProducts.length,
              },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                className={`${styles.tab} ${activeTab === key ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(key)}
              >
                {label}
                <span className={styles.tabCount}>{count}</span>
              </button>
            ))}
          </div>

          <div className={styles.productsGrid}>
            {contentLoading && <p role="status">Loading products…</p>}
            {contentError && <p role="alert">{contentError}</p>}
            {displayProducts?.map((p, i) => (
              <ProductCard key={p.id} product={p} dark index={i} />
            ))}
          </div>

          <div className={`${styles.productsFooter} sr`}>
            <Link to="/products" className="btn btn-gold">
              View All {products.length} Products
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY GRAIN MUSE ───────────────────────────────────── */}
      <section className={`section-pad ${styles.whySection}`}>
        <div className="container">
          <div className={styles.whyGrid}>
            <div className={`${styles.whyLeft} sr`}>
              <SectionHeader
                eyebrow="Why Grain Muse"
                title="The difference<br/>you can <em>taste</em>"
                subtitle="We don't chase trends. We chase quality in every grain, every leaf, every second of flavour."
              />
              <Link
                to="/about"
                className="btn btn-outline"
                style={{ marginTop: "var(--space-xl)" }}
              >
                Learn More
              </Link>
            </div>
            <div className={styles.whyRight}>
              {WHY_CARDS.map((c, i) => (
                <div
                  key={c.num}
                  className={`${styles.whyCard} sr sr-delay-${i + 1}`}
                >
                  <div className={styles.whyCardTop}>
                    <span className={styles.whyCardNum}>{c.num}</span>
                    <span className={styles.whyCardIcon}>{c.icon}</span>
                  </div>
                  <h3 className={styles.whyCardTitle}>{c.title}</h3>
                  <p className={styles.whyCardDesc}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBg} aria-hidden="true" />
        <div className={`container ${styles.ctaInner}`}>
          <div className={`${styles.ctaText} sr`}>
            <p className={styles.ctaEyebrow}>Ready?</p>
            <h2 className={styles.ctaTitle}>
              Taste the <em>Grain Muse</em> difference
            </h2>
          </div>
          <div className={`${styles.ctaActions} sr sr-delay-2`}>
            <Link to="/products" className="btn btn-gold btn-lg">
              Explore Products
            </Link>
            <Link to="/contact" className="btn btn-ghost btn-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Inline SVG Illustrations ─────────────────────────────── */
function HeroIllustration() {
  return (
    <div className={styles.heroSvgWrap}>
      <svg
        viewBox="0 0 560 600"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.heroSvg}
      >
        <defs>
          <radialGradient id="hglow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#BF9A56" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2C1A10" stopOpacity="0" />
          </radialGradient>
          <filter id="hblur">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="hblur2">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {/* ambient glow */}
        <ellipse
          cx="280"
          cy="300"
          rx="240"
          ry="260"
          fill="url(#hglow)"
          filter="url(#hblur)"
        />

        {/* Bowl group — floats */}
        <g className={styles.floatA}>
          <ellipse
            cx="280"
            cy="430"
            rx="148"
            ry="36"
            fill="#1a0f08"
            opacity="0.18"
            filter="url(#hblur2)"
          />
          <path
            d="M136 320 Q136 468 280 490 Q424 468 424 320 Z"
            fill="#EDE0C8"
          />
          <path
            d="M136 320 Q208 344 280 348 Q352 344 424 320"
            fill="none"
            stroke="#BF9A56"
            strokeWidth="1.5"
            opacity="0.5"
          />
          {/* Rice grains */}
          {[...Array(32)].map((_, i) => (
            <ellipse
              key={i}
              cx={192 + (i % 8) * 28 + (Math.floor(i / 8) % 2) * 14}
              cy={358 + Math.floor(i / 8) * 24}
              rx={9}
              ry={4}
              fill="#FAF4EA"
              opacity={0.75 + (i % 3) * 0.08}
              transform={`rotate(${(i * 41) % 180} ${192 + (i % 8) * 28 + (Math.floor(i / 8) % 2) * 14} ${358 + Math.floor(i / 8) * 24})`}
            />
          ))}
          {/* Steam */}
          {[220, 280, 340].map((x, i) => (
            <path
              key={i}
              d={`M${x} 268 Q${x + 6} 248 ${x} 226 Q${x - 6} 204 ${x} 182`}
              fill="none"
              stroke="#BF9A56"
              strokeWidth="1.5"
              opacity="0.35"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Tea cup — floats offset */}
        <g className={styles.floatB}>
          <path
            d="M380 490 Q380 546 416 556 Q452 546 452 490 Z"
            fill="#7A5235"
            opacity="0.9"
          />
          <path
            d="M380 490 Q416 498 452 490"
            fill="none"
            stroke="#BF9A56"
            strokeWidth="1.5"
            opacity="0.45"
          />
          <path
            d="M452 508 Q474 512 476 526 Q474 540 452 536"
            fill="none"
            stroke="#7A5235"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.55"
          />
          <rect
            x="378"
            y="483"
            width="76"
            height="7"
            rx="2"
            fill="#4A3020"
            opacity="0.5"
          />
          {[403, 418].map((x, i) => (
            <path
              key={i}
              d={`M${x} 460 Q${x + 4} 444 ${x} 428`}
              fill="none"
              stroke="#BF9A56"
              strokeWidth="1.5"
              opacity="0.4"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* Herbs */}
        <g className={styles.floatC} opacity="0.72">
          <ellipse
            cx="108"
            cy="246"
            rx="26"
            ry="11"
            fill="#4E6040"
            transform="rotate(-28 108 246)"
          />
          <ellipse
            cx="94"
            cy="226"
            rx="20"
            ry="9"
            fill="#7A9068"
            transform="rotate(-52 94 226)"
          />
          <ellipse
            cx="124"
            cy="232"
            rx="20"
            ry="9"
            fill="#4E6040"
            transform="rotate(-8 124 232)"
          />
          <line
            x1="108"
            y1="268"
            x2="104"
            y2="308"
            stroke="#4E6040"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Label badge */}
        <g transform="translate(52,140)">
          <rect width="148" height="52" rx="0" fill="#2C1A10" />
          <text
            x="74"
            y="19"
            textAnchor="middle"
            fill="#BF9A56"
            fontFamily="'Outfit',sans-serif"
            fontSize="7.5"
            letterSpacing="3.5"
            fontWeight="600"
          >
            GRAIN MUSE
          </text>
          <text
            x="74"
            y="37"
            textAnchor="middle"
            fill="#FAF4EA"
            fontFamily="'Cormorant Garamond',serif"
            fontSize="14"
            fontWeight="300"
          >
            Crafted Foods
          </text>
        </g>

        {/* Decorative dots */}
        {[...Array(16)].map((_, i) => (
          <circle
            key={i}
            cx={70 + (i % 4) * 148}
            cy={90 + Math.floor(i / 4) * 160}
            r={i % 3 === 0 ? 4 : 2.5}
            fill="#BF9A56"
            opacity={0.08 + (i % 4) * 0.06}
          />
        ))}

        {/* Rotating badge ring */}
        <g transform="translate(440,136)" className={styles.spinRing}>
          <circle cx="0" cy="0" r="52" fill="#BF9A56" />
          <text
            textAnchor="middle"
            fontFamily="'Outfit',sans-serif"
            fontSize="7"
            letterSpacing="2.5"
            fill="#2C1A10"
            fontWeight="700"
          >
            <textPath href="#ringPath">
              PURE · NATURAL · CRAFT · WHOLESOME ·
            </textPath>
          </text>
          <defs>
            <path
              id="ringPath"
              d="M-46,0 A46,46 0 1,1 46,0 A46,46 0 1,1 -46,0"
            />
          </defs>
          <text
            x="0"
            y="6"
            textAnchor="middle"
            fontFamily="'Cormorant Garamond',serif"
            fontSize="20"
            fill="#2C1A10"
            fontWeight="400"
          >
            ✦
          </text>
        </g>
      </svg>
    </div>
  );
}

function AboutVisual() {
  return (
    <div className={styles.aboutSvgWrap}>
      <div className={styles.aboutCard1}>
        <svg
          viewBox="0 0 320 300"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <radialGradient id="ag1" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#BF9A56" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E8D9BE" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="320" height="300" fill="#E8D9BE" />
          <ellipse cx="160" cy="150" rx="110" ry="100" fill="url(#ag1)" />
          {[0, 51, 102, 153, 204, 255, 306].map((angle, i) => (
            <g key={i} transform={`rotate(${angle} 160 150)`}>
              <ellipse
                cx="160"
                cy="78"
                rx="13"
                ry="26"
                fill={i % 2 === 0 ? "#4E6040" : "#7A9068"}
                opacity="0.65"
              />
            </g>
          ))}
          <circle cx="160" cy="150" r="38" fill="#BF9A56" opacity="0.9" />
          <text
            x="160"
            y="158"
            textAnchor="middle"
            fill="#2C1A10"
            fontFamily="'Cormorant Garamond',serif"
            fontSize="28"
            fontWeight="300"
          >
            GM
          </text>
        </svg>
      </div>
      <div className={styles.aboutCard2}>
        <div className={styles.aboutStatStack}>
          <AnimatedCounter to={7} suffix="+" label="Products" />
          <AnimatedCounter to={100} suffix="%" label="Natural" />
        </div>
      </div>
      <div className={styles.aboutCard3}>
        <p className={styles.aboutCard3Text}>&ldquo;Crafted with intention&rdquo;</p>
      </div>
    </div>
  );
}

function LogoImage({ slug, alt, className }) {
  const imgUrl = getHeroImage(slug);
  const altText = alt || `${slug.replace(/-/g, " ")} product image`;

  return (
    <img
      src={imgUrl}
      alt={altText}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
