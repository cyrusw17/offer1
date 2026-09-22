/* GroundWork — shared behaviour */
(function () {
  const GW = window.GW || {};

  // ---- UTM persistence: keep attribution across internal links
  const params = new URLSearchParams(location.search);
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "demo", "city"];
  const saved = JSON.parse(localStorage.getItem("gw_attr") || "{}");
  let touched = false;
  keys.forEach(k => { if (params.get(k)) { saved[k] = params.get(k); touched = true; } });
  if (touched) localStorage.setItem("gw_attr", JSON.stringify(saved));
  window.gwAttr = saved;

  // ---- Mobile nav
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    const links = nav.querySelector(".nav-links");
    if (links && !links.id) links.id = "primary-nav";
    if (links) toggle.setAttribute("aria-controls", links.id);
    const setOpen = (open) => { nav.classList.toggle("open", open); toggle.setAttribute("aria-expanded", String(open)); };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    // Escape closes the menu and returns focus to the toggle
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); }
    });
  }

  // ---- Current page marker
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href && href !== "/" && location.pathname.startsWith(href)) a.setAttribute("aria-current", "page");
  });

  // ---- Scale demo iframes to fit their frame
  function fitFrames() {
    document.querySelectorAll(".frame-view").forEach(v => {
      const f = v.querySelector("iframe");
      if (!f) return;
      const s = v.clientWidth / 1280;
      f.style.transform = `scale(${s})`;
      f.style.height = (v.clientHeight / s) + "px";
    });
  }
  fitFrames();
  addEventListener("resize", fitFrames);

  // ---- Fill contact placeholders
  document.querySelectorAll("[data-gw-email]").forEach(el => {
    el.textContent = GW.email; if (el.tagName === "A") el.href = "mailto:" + GW.email;
  });

  // ---- Year
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  // ---- Calendly / booking embed (audit page)
  const embed = document.querySelector("[data-calendly]");
  if (embed) {
    if (GW.calendlyUrl) {
      const url = new URL(GW.calendlyUrl);
      url.searchParams.set("hide_gdpr_banner", "1");
      url.searchParams.set("background_color", "16181e");
      url.searchParams.set("text_color", "e6e1d6");
      url.searchParams.set("primary_color", "e5a00d");
      // Carry campaign attribution into the booking so each call shows its source in Calendly
      const attr = window.gwAttr || {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(k => { if (attr[k]) url.searchParams.set(k, attr[k]); });
      if (attr.demo || attr.city) url.searchParams.set("utm_term", [attr.demo, attr.city].filter(Boolean).join("-"));
      const div = document.createElement("div");
      div.className = "calendly-inline-widget";
      div.dataset.url = url.toString();
      div.style.minWidth = "320px"; div.style.height = "700px";
      embed.replaceChildren(div);
      const s = document.createElement("script");
      s.src = "https://assets.calendly.com/assets/external/widget.js"; s.async = true;
      document.body.appendChild(s);
      // When a call is booked: count the conversion, then hand off to the thanks page
      addEventListener("message", (e) => {
        if (!/https:\/\/([a-z0-9-]+\.)?calendly\.com$/.test(e.origin)) return;
        if (e.data && e.data.event === "calendly.event_scheduled") {
          try {
            if (navigator.sendBeacon && navigator.globalPrivacyControl !== true && navigator.doNotTrack !== "1") {
              navigator.sendBeacon((GW.analyticsEndpoint || "/api/track.php"),
                new Blob([JSON.stringify({ type: "submit", label: "calendly-booked", path: location.pathname, w: innerWidth })], { type: "application/json" }));
            }
          } catch (_) {}
          setTimeout(() => { location.href = "/thanks/?from=booked"; }, 1200);
        }
      });
    } else {
      const fb = document.querySelector("[data-calendly-fallback]");
      if (fb) { fb.hidden = false; embed.hidden = true; }
    }
  }

  // ---- Start / audit forms
  document.querySelectorAll("form[data-gw-form]").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      data.attribution = JSON.stringify(window.gwAttr || {});
      data.page = location.pathname;
      data.form = form.dataset.gwForm;
      const btn = form.querySelector("button[type=submit]");
      const status = form.querySelector("[role=status]");
      const say = (msg) => { if (status) status.textContent = msg; };
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; btn.setAttribute("aria-busy", "true"); }
      say("Sending your details…");
      localStorage.setItem("gw_lead", JSON.stringify(data));

      // Deliver the lead
      let delivered = false;
      if (GW.formEndpoint) {
        try {
          const r = await fetch(GW.formEndpoint, {
            method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
          delivered = r.ok;
        } catch (_) { delivered = false; }
      }
      if (!delivered) {
        // Fallback: pre-composed email so nothing is lost before a form service exists.
        const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
        const mail = `mailto:${GW.email}?subject=${encodeURIComponent("[GroundWork] " + (form.dataset.gwForm))}&body=${encodeURIComponent(body)}`;
        // Only open mail client if we're not about to redirect to Stripe
        if (form.dataset.gwForm !== "start") window.open(mail, "_blank");
      }

      // Buy-now: hand off to Stripe if configured
      if (form.dataset.gwForm === "start") {
        const plan = data.plan === "host" ? "host" : "grow";
        const link = GW.stripe && (GW.stripe[plan] || GW.stripe.build);
        if (link) {
          const u = new URL(link);
          if (data.email) u.searchParams.set("prefilled_email", data.email);
          // Shows on the Stripe payment as "shop-name--grow" so you know which plan they chose
          const ref = (data.shop || "shop").replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").slice(0, 60) + "--" + plan;
          u.searchParams.set("client_reference_id", ref);
          say("Taking you to secure checkout.");
          location.href = u.toString();
          return;
        }
      }
      say("Received. Taking you to the confirmation page.");
      location.href = "/thanks/?from=" + encodeURIComponent(form.dataset.gwForm) + "&plan=" + encodeURIComponent(data.plan || "");
    });
  });

  // ---- Thanks page personalisation
  const thanks = document.querySelector("[data-thanks]");
  if (thanks) {
    const lead = JSON.parse(localStorage.getItem("gw_lead") || "{}");
    const from = new URLSearchParams(location.search).get("from");
    const who = document.querySelector("[data-thanks-name]");
    if (who && lead.shop) who.textContent = lead.shop;
    document.querySelectorAll("[data-thanks-if]").forEach(el => { el.hidden = el.dataset.thanksIf !== from; });
  }
})();
