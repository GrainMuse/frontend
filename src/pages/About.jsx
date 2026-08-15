import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import PageHero from "../components/ui/PageHero";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import Marquee from "../components/common/Marquee";
import { useContent } from "../context/contentStore";
import SEOHead from "../components/common/SEOHead";
import styles from "./About.module.css";

const PILLARS = [
  {
    icon: "🌾",
    title: "Heritage of Taste",
    desc: "Rooted in Sri Lankan food culture, our recipes celebrate the grain traditions and botanical knowledge passed down through generations, reimagined for modern lives.",
    color: "#BF9A56",
  },
  {
    icon: "🌿",
    title: "Pure Craftsmanship",
    desc: "We choose ingredients with intention. Every grain is sourced for quality, every herb selected for potency. Small batch production means we never lose sight of the details.",
    color: "#4E6040",
  },
  {
    icon: "🌏",
    title: "Honest Nutrition",
    desc: "No hidden additives. No artificial preservatives. We believe you deserve to know exactly what you're eating, and feel great about it. Clean labels, always.",
    color: "#7A5235",
  },
];

const STATS = [
  { to: 7, suffix: "+", label: "Signature Products" },
  { to: 100, suffix: "%", label: "Natural Ingredients" },
  { to: 4, suffix: "", label: "Minutes to Prepare" },
  { to: 2, suffix: "", label: "Product Categories" },
];

export default function About() {
  const { processSteps } = useContent();
  useScrollReveal([]);

  return (
    <>
      <SEOHead
        title="Our Story – About Grain Muse"
        description="Learn about Grain Muse, a Sri Lankan craft food company born from a belief that everyday meals deserve real ingredients and genuine care."
        path="/about"
      />
      <PageHero
        eyebrow="Our Story"
        title="We are<br/><em>Grain Muse</em>"
        subtitle="A Sri Lankan craft food company born from a simple belief: that everyday meals deserve real ingredients and genuine care."
        size="lg"
      />

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <section className={styles.statsBar}>
        <div className={`container ${styles.statsGrid}`}>
          {STATS.map((s) => (
            <AnimatedCounter
              key={s.label}
              to={s.to}
              suffix={s.suffix}
              label={s.label}
            />
          ))}
        </div>
      </section>

      {/* ── ORIGIN STORY ───────────────────────────────────── */}
      <section className={`section-pad ${styles.storySection}`}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={`${styles.storyLeft} sr`}>
              <p className="section-eyebrow">The Beginning</p>
              <h2
                className="display-md"
                style={{
                  marginTop: "var(--space-sm)",
                  color: "var(--gm-deep)",
                }}
              >
                Born from a kitchen table &amp; a question
              </h2>
            </div>
            <div className={styles.storyRight}>
              {[
                {
                  label: "01",
                  text: "<strong>Grain Muse began</strong> with a kitchen table, a handful of recipes, and an honest question: why should convenience food mean compromise? Our founders, food lovers with a deep respect for traditional Sri Lankan flavour, set out to answer that question one product at a time.",
                },
                {
                  label: "02",
                  text: "Today, our range of instant fried rice blends and herbal teas reflects that founding spirit. <strong>Every recipe is developed with whole ingredients</strong>, minimal processing, and a commitment to flavour that doesn't rely on artificial shortcuts.",
                },
                {
                  label: "03",
                  text: "We are a small company with a big belief in the power of good food, food that sustains, comforts, and connects us. Whether it's a bowl of our jasmine fried rice on a busy evening or a calming cup of chamomile at night, <strong>we want Grain Muse to be a quiet, trusted presence in your daily life</strong>.",
                },
              ].map((p, i) => (
                <div
                  key={p.label}
                  className={`${styles.storyPara} sr sr-delay-${i + 1}`}
                >
                  <span className={styles.storyParaNum}>{p.label}</span>
                  <p
                    className="body-lg"
                    dangerouslySetInnerHTML={{ __html: p.text }}
                    style={{ color: "var(--gm-earth)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PILLARS ────────────────────────────────────────── */}
      <section className={styles.pillarsSection}>
        <div className="container">
          <div className={`${styles.pillarsHeader} sr`}>
            <p className="section-eyebrow">What We Stand For</p>
            <h2
              className="display-md"
              style={{ color: "var(--gm-cream)", marginTop: "var(--space-sm)" }}
            >
              Three pillars of{" "}
              <em style={{ fontStyle: "italic", color: "var(--gm-gold)" }}>
                everything we do
              </em>
            </h2>
          </div>
          <div className={styles.pillarsGrid}>
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className={`${styles.pillarCard} sr sr-delay-${i + 1}`}
                style={{ "--pillar-color": p.color }}
              >
                <span className={styles.pillarIcon}>{p.icon}</span>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.desc}</p>
                <div className={styles.pillarAccent} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ────────────────────────────────────────── */}
      <section className={`section-pad ${styles.processSection}`}>
        <div className="container">
          <div className={`${styles.processHeader} sr`}>
            <p className="section-eyebrow">How We Make It</p>
            <h2
              className="display-md"
              style={{ marginTop: "var(--space-sm)", color: "var(--gm-deep)" }}
            >
              Craft in every step
            </h2>
            <p
              className="body-lg"
              style={{ maxWidth: 500, marginTop: "var(--space-md)" }}
            >
              From sourcing to sealing, every stage of our process is designed
              to protect quality, nutrition, and integrity.
            </p>
          </div>
          <div className={styles.processSteps}>
            {processSteps.map((step, i) => (
              <div
                key={step.step}
                className={`${styles.processStep} sr sr-delay-${i + 1}`}
              >
                <div className={styles.processStepLeft}>
                  <span className={styles.processNum}>{step.step}</span>
                  <div
                    className={`${styles.processLine} ${i < processSteps.length - 1 ? styles.processLineVisible : ""}`}
                  />
                </div>
                <div className={styles.processStepContent}>
                  <h3 className={styles.processTitle}>{step.title}</h3>
                  <p className={styles.processDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marquee />

      {/* ── QUOTE ──────────────────────────────────────────── */}
      <section className={styles.quoteSection}>
        <div className={`container ${styles.quoteInner}`}>
          <div className={`${styles.quoteBlock} sr`}>
            <span className={styles.quoteGlyph}>&ldquo;</span>
            <blockquote className={styles.quoteText}>
              Every product we make is a small promise to use real ingredients,
              to respect the craft, and to make your everyday a little more
              nourishing.
            </blockquote>
            <cite className={styles.quoteAuthor}>— The Grain Muse Team</cite>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className={`section-pad ${styles.aboutCta}`}>
        <div className={`container ${styles.aboutCtaInner}`}>
          <div className="sr">
            <p className="section-eyebrow">Discover More</p>
            <h2
              className="display-sm"
              style={{ marginTop: "var(--space-sm)", color: "var(--gm-deep)" }}
            >
              Ready to taste the difference?
            </h2>
          </div>
          <div className={`${styles.aboutCtaButtons} sr sr-delay-2`}>
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
