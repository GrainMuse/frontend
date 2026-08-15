import emailjs from '@emailjs/browser';

// ── Runtime config from environment variables ─────────────────
const CONFIG = {
  publicKey:           import.meta.env.VITE_EMAILJS_PUBLIC_KEY            ?? '',
  serviceId:           import.meta.env.VITE_EMAILJS_SERVICE_ID            ?? '',
  contactTemplateId:   import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT      ?? '',
  autoreplyTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_AUTOREPLY    ?? '',
};

// Detect development mode for verbose logging
const IS_DEV = import.meta.env.DEV;

// ── Rate Limiting (client-side guard) ─────────────────────────
// Prevents spam. SessionStorage is cleared when the tab/browser closes.
const RATE_LIMIT = {
  maxSubmissions: 3,       // max 3 submissions
  windowMs:       3_600_000, // per 10-minute rolling window
  storageKey:     'gm_contact_attempts',
};

function getStoredAttempts() {
  try {
    const raw  = sessionStorage.getItem(RATE_LIMIT.storageKey);
    if (!raw)  return [];
    const data = JSON.parse(raw);
    const now  = Date.now();
    // Purge expired attempts
    return data.filter(ts => now - ts < RATE_LIMIT.windowMs);
  } catch {
    return []; // sessionStorage may be blocked in privacy mode
  }
}

function recordAttempt() {
  try {
    const attempts = [...getStoredAttempts(), Date.now()];
    sessionStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify(attempts));
  } catch {
    /* non-critical */
  }
}

export function getRemainingAttempts() {
  const used = getStoredAttempts().length;
  return Math.max(0, RATE_LIMIT.maxSubmissions - used);
}

function isRateLimited() {
  return getStoredAttempts().length >= RATE_LIMIT.maxSubmissions;
}

// ── Input Sanitisation ────────────────────────────────────────
// Strips HTML tags and limits field length to prevent injection.
const FIELD_MAX = 5000;

function sanitise(value = '', maxLen = FIELD_MAX) {
  return String(value)
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;')
    .trim()
    .slice(0, maxLen);
}

// ── EmailJS Initialisation ────────────────────────────────────
let initialised = false;

export function initEmailService() {
  if (initialised) return;
  if (!CONFIG.publicKey) {
    if (IS_DEV) console.warn('[EmailService] VITE_EMAILJS_PUBLIC_KEY not set. Email will not send.');
    return;
  }
  emailjs.init({
    publicKey:     CONFIG.publicKey,
    blockHeadless: true,   // blocks automated/headless browser submissions
    limitRate: {
      id:    'grainmuse_contact',
      throttle: 10_000,    // 10s throttle inside EmailJS SDK itself
    },
  });
  initialised = true;
  if (IS_DEV) console.info('[EmailService] Initialised ✓');
}

// ── Form Validation ───────────────────────────────────────────
/**
 * @param {{ name: string, email: string, phone: string, type: string, message: string }} form
 * @returns {{ [field: string]: string }} — empty object means valid
 */
export function validateContactForm(form) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = 'Please enter your name';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!form.email?.trim()) {
    errors.email = 'Please enter your email address';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (form.phone?.trim() && !/^[\d\s+()-]{7,20}$/.test(form.phone.trim())) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (!form.message?.trim()) {
    errors.message = 'Please enter a message';
  } else if (form.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (form.message.trim().length > 4000) {
    errors.message = 'Message must be under 4000 characters';
  }

  return errors;
}

// ── Error Classifier ──────────────────────────────────────────
function classifyError(err) {
  const status = err?.status ?? 0;

  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }
  if (status === 429) {
    return 'Too many requests. Please wait a few minutes before trying again.';
  }
  if (status === 400) {
    return 'There was an issue with your submission. Please check your details and try again.';
  }
  if (status === 401 || status === 403) {
    return 'Email service configuration error. Please contact us directly at trade@grainmuse.net';
  }
  if (status >= 500) {
    return 'The email service is temporarily unavailable. Please try again in a few minutes, or contact us at trade@grainmuse.net';
  }
  return 'Something went wrong sending your message. Please try again or email trade@grainmuse.net directly.';
}

// ── Main Send Function ────────────────────────────────────────
/**
 * sendContactEmail
 *
 * @param {{ name: string, email: string, phone?: string, type?: string, message: string }} form
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function sendContactEmail(form) {
  // ── 1. Rate limit ─────────────────────────────────────────
  if (isRateLimited()) {
    return {
      ok: false,
      error: `You've sent ${RATE_LIMIT.maxSubmissions} messages recently. Please wait 10 minutes before sending another.`,
    };
  }

  // ── 2. Config guard ───────────────────────────────────────
  if (!CONFIG.publicKey || !CONFIG.serviceId || !CONFIG.contactTemplateId) {
    if (IS_DEV) {
      console.error('[EmailService] Missing config. Required .env variables:', {
        VITE_EMAILJS_PUBLIC_KEY:         CONFIG.publicKey    ? '✓' : '✗ MISSING',
        VITE_EMAILJS_SERVICE_ID:         CONFIG.serviceId   ? '✓' : '✗ MISSING',
        VITE_EMAILJS_TEMPLATE_CONTACT:   CONFIG.contactTemplateId   ? '✓' : '✗ MISSING',
      });
    }
    return {
      ok: false,
      error: 'Email service is not configured. Please contact us directly at trade@grainmuse.net',
    };
  }

  // ── 3. Build template params ──────────────────────────────
  const timestamp = new Date().toLocaleString('en-GB', {
    weekday:  'long',
    year:     'numeric',
    month:    'long',
    day:      'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
    timeZone: 'Asia/Colombo',
    timeZoneName: 'short',
  });

  const params = {
    from_name:    sanitise(form.name,    100),
    reply_to:     sanitise(form.email,   254), // RFC 5321 max
    phone:        sanitise(form.phone,   30)  || 'Not provided',
    enquiry_type: sanitise(form.type,    60)  || 'General Enquiry',
    message:      sanitise(form.message, 4000),
    submitted_at: timestamp,
    to_email:     'trade@grainmuse.net',       // for template reference
    site_url:     typeof window !== 'undefined' ? window.location.origin : 'grainmuse.lk',
  };

  // ── 4. Send notification email to trade@grainmuse.net ─────
  try {
    const result = await emailjs.send(
      CONFIG.serviceId,
      CONFIG.contactTemplateId,
      params
    );

    if (IS_DEV) console.info('[EmailService] Notification sent ✓', result);

  } catch (err) {
    if (IS_DEV) console.error('[EmailService] Notification failed:', err);
    return { ok: false, error: classifyError(err) };
  }

  // ── 5. Send auto-reply to visitor (fire-and-forget) ───────
  if (CONFIG.autoreplyTemplateId) {
    emailjs.send(
      CONFIG.serviceId,
      CONFIG.autoreplyTemplateId,
      params
    ).then(() => {
      if (IS_DEV) console.info('[EmailService] Auto-reply sent ✓');
    }).catch(err => {
      // Non-critical: log but do not fail the overall submission
      if (IS_DEV) console.warn('[EmailService] Auto-reply failed (non-critical):', err);
    });
  }

  // ── 6. Record attempt for rate limiting ───────────────────
  recordAttempt();

  return { ok: true };
}
