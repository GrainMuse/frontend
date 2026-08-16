# Existing auto-reply and PATHFINDER EmailJS template

Keep the existing main contact template and its linked auto-reply. Replace the
body of the existing auto-reply template with `emailjs-template.html`. The same
auto-reply template then handles contact confirmations and every PATHFINDER
transactional message, avoiding a third template slot.

## EmailJS settings

- **To email:**
  `{{#is_contact_confirmation}}{{email}}{{/is_contact_confirmation}}{{#is_academy}}{{to_email}}{{/is_academy}}`
- **From name:**
  `{{#is_contact_confirmation}}Grain Muse{{/is_contact_confirmation}}{{#is_academy}}PATHFINDER Academy{{/is_academy}}`
- **Reply to:**
  `{{#is_contact_confirmation}}trade@grainmuse.net{{/is_contact_confirmation}}{{#is_academy}}{{reply_to}}{{/is_academy}}`
- **Subject:**
  `{{#is_contact_confirmation}}Thank you for contacting Grain Muse{{/is_contact_confirmation}}{{#is_academy}}{{subject}}{{/is_academy}}`
- **Content:** Select HTML mode and paste the complete contents of
  `emailjs-template.html`.

The two Edge Functions supply these variables:

- `to_email`
- `reply_to`
- `subject`
- `preheader`
- `eyebrow`
- `headline`
- `message`
- `action_label`
- `action_url`
- `event_type`
- `notification_id`
- `idempotency_key`
- `is_contact_enquiry`
- `is_contact_confirmation`
- `is_academy`
- `sender_name`
- `header_title`
- `header_subtitle`
- `from_name`
- `email`
- `phone`
- `enquiry_type`
- `submitted_at`
- `site_url`

Keep the main contact template ID in `EMAILJS_TEMPLATE_ID`. Put the existing
auto-reply template ID in `EMAILJS_AUTOREPLY_TEMPLATE_ID`; the academy processor
uses it directly. Keep the EmailJS private key in `EMAILJS_PRIVATE_KEY`; never
expose it as a `VITE_` variable.

Leave the main contact template linked to this auto-reply template. Do not link an
additional auto-reply from the auto-reply template itself. Direct academy sends
therefore render the academy section without producing another message.

Test a contact enquiry, its customer confirmation, and all four academy events
before enabling the production scheduler.
