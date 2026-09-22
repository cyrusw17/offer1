/*
  GroundWork — integration config.
  Fill these in as you set up accounts. Empty strings fall back to
  email-based flows so the funnel never dead-ends.
*/
window.GW = {
  business: "GroundWork-Web",
  email: "hello@groundwork-web.com",         // replace with your real inbox
  phone: "",                                  // optional: "(281) 555-0100"

  // Booking: Calendly event URL or Google Appointment Schedule URL
  // e.g. "https://calendly.com/groundwork/15min"
  calendlyUrl: "https://calendly.com/cyruswilburn2005/30min",

  // Stripe Payment Links (Dashboard → Payment Links).
  // `build` is the $399 Website Build charged today; the retainer is set up at
  // go-live. If you later make plan-specific links (Build + Grow, Build + Host),
  // fill `grow` / `host` and they take priority over `build`.
  stripe: {
    build: "https://buy.stripe.com/00w9AV85m2lm479c2IfUQ01",
    grow: "",
    host: ""
  },

  // Lead endpoint. /api/lead.php stores every start/audit submission in the
  // analytics DB and emails it (set GW_LEAD_EMAIL in api/config.php).
  // Swap for Formspree/Getform if you prefer: "https://formspree.io/f/xxxx"
  formEndpoint: "/api/lead.php",

  pricing: { build: 399, host: 99, grow: 199 }
};
