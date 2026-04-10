import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import PageHero from "../components/ui/PageHero";
import {
  sendContactEmail,
  validateContactForm,
  getRemainingAttempts,
} from "../services/emailService";
import { COMPANY } from "../data";
import SEOHead from "../components/common/SEOHead";
import styles from "./Contact.module.css";

const ENQUIRY_TYPES = [
  "General Enquiry",
  "Wholesale / Trade",
  "Distribution Partnership",
  "Media & Press",
  "Product Feedback",
  "Other",
];

const CONTACT_INFO = [
  {
    icon: <Mail size={18} />,
    label: "Email Us",
    value: COMPANY.email,
    sub: "We respond within 24 hours on weekdays",
    href: `mailto:${COMPANY.email}`,
  },
  {
    icon: <Phone size={18} />,
    label: "Call Us",
    value: COMPANY.phone1,
    sub: COMPANY.hours,
    href: `tel:${COMPANY.phone1}`,
  },
  {
    icon: <Phone size={18} />,
    label: "Call Us",
    value: COMPANY.phone2,
    sub: COMPANY.hours,
    href: `tel:${COMPANY.phone2}`,
  },
  {
    icon: <MapPin size={18} />,
    label: "Find Us",
    value: COMPANY.location,
    sub: "Proudly crafted and distributed across Sri Lanka",
    href: null,
  },
  {
    icon: <Clock size={18} />,
    label: "Trade Enquiries",
    value: COMPANY.tradeEmail,
    sub: "Wholesale, bulk orders & partnerships",
    href: `mailto:${COMPANY.tradeEmail}`,
  },
];

const FAQS = [
  {
    q: "Where can I buy Grain Muse products?",
    a: "We currently supply through selected retailers and distributors across Sri Lanka. Contact us to find your nearest stockist or to enquire about online ordering.",
  },
  {
    q: "Are your products suitable for vegetarians?",
    a: "Yes — our Garden Herb Fried Rice and all herbal teas are 100% vegetarian. Our other fried rice flavours contain no meat but do use naturally brewed soy sauce.",
  },
  {
    q: "Do you use any artificial additives?",
    a: "Never. Every ingredient across our entire range is natural. No artificial colours, flavours, preservatives, or flavour enhancers.",
  },
  {
    q: "Can I place a wholesale or bulk order?",
    a: 'Absolutely. We welcome wholesale, retail, and hospitality enquiries. Please reach out at trade@grainmuse.net or use the contact form selecting "Wholesale / Trade".',
  },
];

const INITIAL_FORM = { name: "", email: "", phone: "", type: "", message: "" };

export default function Contact() {
  useScrollReveal([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [apiError, setApiError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [remaining, setRemaining] = useState(() => getRemainingAttempts());
  const honeypotRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateContactForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setStatus("sending");
    setApiError("");
    const result = await sendContactEmail(
      form,
      honeypotRef.current?.value ?? "",
    );
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setApiError(result.error ?? "Something went wrong. Please try again.");
    }
    setRemaining(getRemainingAttempts());
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
    setApiError("");
    setRemaining(getRemainingAttempts());
  };

  return (
    <>
      <SEOHead
        title="Contact Us – Grain Muse"
        description="Get in touch with Grain Muse for wholesale enquiries, distribution partnerships, or general questions. We respond within one business day."
        path="/contact"
      />
      <PageHero
        eyebrow="Reach Out"
        title="Let's start a<br/><em>conversation</em>"
        subtitle="Whether you're a retailer, distributor, press, or simply a curious food lover — we'd love to hear from you."
        size="sm"
      />

      <section className={`section-pad ${styles.contactSection}`}>
        <div className="container">
          <div className={styles.contactGrid}>
            {/* LEFT: Info + FAQ */}
            <div className={styles.infoCol}>
              <div className={`${styles.infoCards} sr`}>
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className={styles.infoCard}>
                    <div className={styles.infoCardIcon}>{item.icon}</div>
                    <div>
                      <p className={styles.infoCardLabel}>{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className={styles.infoCardValue}>
                          {item.value}
                        </a>
                      ) : (
                        <p className={styles.infoCardValue}>{item.value}</p>
                      )}
                      <p className={styles.infoCardSub}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`${styles.faq} sr sr-delay-2`}>
                <h3 className={styles.faqTitle}>Frequently Asked</h3>
                {FAQS.map((faq, i) => (
                  <div
                    key={i}
                    className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ""}`}
                  >
                    <button
                      className={styles.faqQuestion}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                      aria-controls={`faq-${i}`}
                    >
                      {faq.q}
                      <span className={styles.faqChevron} aria-hidden="true">
                        {openFaq === i ? "−" : "+"}
                      </span>
                    </button>
                    <div
                      id={`faq-${i}`}
                      className={styles.faqAnswer}
                      role="region"
                    >
                      <p>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Form */}
            <div className={`${styles.formCol} sr sr-delay-2`}>
              {status === "success" ? (
                <SuccessState onReset={handleReset} name={form.name} />
              ) : (
                <form
                  className={styles.form}
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label="Contact form"
                >
                  <div className={styles.formHeader}>
                    <h2 className={styles.formTitle}>Send us a message</h2>
                    <p className={styles.formSubtitle}>
                      We&apos;ll get back to you within one business day.
                      {remaining < 3 && remaining > 0 && (
                        <span className={styles.rateBadge}>
                          {remaining} submission{remaining !== 1 ? "s" : ""}{" "}
                          remaining
                        </span>
                      )}
                      {remaining === 0 && (
                        <span className={styles.rateBadgeWarn}>
                          Limit reached — please wait 1 hour
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Honeypot — invisible to humans, traps bots */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: "-9999px",
                      top: "-9999px",
                      opacity: 0,
                      height: 0,
                    }}
                    tabIndex={-1}
                  >
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      ref={honeypotRef}
                      defaultValue=""
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <FormField
                      label="Your Name *"
                      name="name"
                      placeholder="Full name"
                      value={form.name}
                      onChange={handleChange}
                      error={errors.name}
                      disabled={status === "sending" || remaining === 0}
                    />
                    <FormField
                      label="Email Address *"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                      error={errors.email}
                      disabled={status === "sending" || remaining === 0}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <FormField
                      label="Phone (optional)"
                      name="phone"
                      type="tel"
                      placeholder="+94 ..."
                      value={form.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      disabled={status === "sending" || remaining === 0}
                    />
                    <div className="form-field">
                      <label className="form-label" htmlFor="type">
                        Enquiry Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        className="form-input form-select"
                        value={form.type}
                        onChange={handleChange}
                        disabled={status === "sending" || remaining === 0}
                      >
                        <option value="">Select a type</option>
                        {ENQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="message">
                      Message *
                      <span className={styles.charCount}>
                        {form.message.length}/4000
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className={`form-textarea ${errors.message ? styles.inputError : ""}`}
                      placeholder="Tell us about your enquiry..."
                      value={form.message}
                      onChange={handleChange}
                      maxLength={4000}
                      disabled={status === "sending" || remaining === 0}
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message ? "message-error" : undefined
                      }
                    />
                    {errors.message && (
                      <span
                        id="message-error"
                        className={styles.errorMsg}
                        role="alert"
                      >
                        <AlertCircle size={12} /> {errors.message}
                      </span>
                    )}
                  </div>

                  {/* API Error Banner */}
                  {status === "error" && apiError && (
                    <div
                      className={styles.apiError}
                      role="alert"
                      aria-live="assertive"
                    >
                      <AlertCircle size={18} className={styles.apiErrorIcon} />
                      <div>
                        <p className={styles.apiErrorTitle}>Message not sent</p>
                        <p className={styles.apiErrorText}>{apiError}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                    disabled={status === "sending" || remaining === 0}
                    aria-busy={status === "sending"}
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 size={16} className={styles.spinner} />{" "}
                        Sending…
                      </>
                    ) : (
                      <>
                        Send Message <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className={styles.privacyNote}>
                    <Lock
                      size={14}
                      style={{ marginTop: "2px", opacity: 0.8 }}
                    />
                    <span>
                      Your message is securely delivered to{" "}
                      <strong>trade@grainmuse.net</strong>. We respect your
                      privacy and never share your details.
                    </span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled,
}) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`form-input ${error ? styles.inputError : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        autoComplete={
          type === "email" ? "email" : type === "tel" ? "tel" : "off"
        }
      />
      {error && (
        <span id={`${name}-error`} className={styles.errorMsg} role="alert">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

function SuccessState({ onReset, name }) {
  const firstName = name ? name.split(" ")[0] : "there";
  return (
    <div className={styles.success} role="status" aria-live="polite">
      <div className={styles.successIconWrap}>
        <CheckCircle2 size={40} className={styles.successIcon} />
      </div>
      <h3 className={styles.successTitle}>Message sent, {firstName}!</h3>
      <p className={styles.successText}>
        Your message has been delivered to our team at{" "}
        <strong>trade@grainmuse.net</strong>. We&apos;ll get back to you within
        one business day.
      </p>
      <p className={styles.successAutoReply}>
        A confirmation copy has been sent to your email address.
      </p>
      <div className={styles.successActions}>
        <Link to="/products" className="btn btn-primary">
          Explore Products <ArrowRight size={15} />
        </Link>
        <button className="btn btn-outline" onClick={onReset}>
          Send Another Message
        </button>
      </div>
    </div>
  );
}
