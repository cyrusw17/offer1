# MVP Website — Founding Client Landing Page

> **One goal:** Fill the first 3 founding client spots.  
> **Stack:** PHP 8.3+, SQLite (MySQL-ready), HTML/CSS/JS, GSAP, Lenis, Lucide  
> **Evolves to:** Laravel (`../website/app/`)

---

## What this is

A single-page, conversion-focused landing page for the **Founding Client Program**:

- **3 spots** — no setup fee (normally $2,500+)
- **$199/month** — hosting, maintenance, updates included
- **12-month** minimum partnership
- Testimonial + case study required

Not a full agency site. Not a blog. One page, one CTA: **book a strategy call**.

---

## Project structure

```
mvp-website/
├── config/site.php          # All copy, offer terms, FAQs
├── docs/01-research.md      # Conversion research principles
├── includes/
│   ├── head.php             # SEO, schema, assets
│   ├── header.php
│   ├── footer.php
│   └── sections/            # One file per page section
├── lib/
│   ├── bootstrap.php        # Env + helpers
│   └── LeadStore.php        # SQLite lead storage
├── public/                  # Web root (point domain here)
│   ├── index.php
│   ├── css/app.css
│   ├── js/app.js
│   └── robots.txt
├── storage/                 # leads.sqlite + leads.log (gitignored)
├── .env.example
└── README.md
```

---

## Local setup

```bash
cd mvp-website
cp .env.example .env
# Edit .env — set SITE_URL=https://groundwork-web.test for local
```

### Laravel Herd (recommended)

```bash
cd public
herd link groundwork-web --secure --update-env
```

Open **https://groundwork-web.test**

### PHP built-in server

```bash
cd public
php -S 127.0.0.1:8080
```

Open **http://127.0.0.1:8080**

---

## cPanel deploy (Git → offer1)

This repo includes **`.cpanel.yml`** for [cPanel Git deployment](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/).

### Setup in cPanel

1. **Git Version Control** → Clone `https://github.com/cyrusw17/offer1.git`
2. Enable **Deployable** / pull deployment for the repo
3. Click **Deploy HEAD Commit** (or push to trigger auto-deploy)

### After first deploy

1. **File Manager** → edit `~/.env` (home directory, not public_html):
   ```
   SITE_URL=https://yourdomain.com
   SITE_EMAIL=hello@groundwork-web.com
   MAIL_TO=hello@groundwork-web.com
   ```
2. Confirm `~/storage/` is writable (775)
3. Test the contact form → check `~/storage/leads.sqlite` and your inbox

### How files land

| Path | Purpose |
|------|---------|
| `~/public_html/` | Web root — CSS, JS, `index.php` |
| `~/config/` | Offer copy & settings |
| `~/lib/` | PHP bootstrap + SQLite |
| `~/includes/` | Page sections |
| `~/storage/` | Lead database (gitignored) |

If your site uses a subdomain folder, edit `DEPLOYPATH` in `.cpanel.yml` before deploying.

---

## Production deploy (manual)

1. Register **groundwork-web.com**
2. Point document root to `mvp-website/public/`
3. Copy `.env.example` → `.env` on server
4. Set `SITE_URL=https://groundwork-web.com`
5. Set `MAIL_TO=hello@groundwork-web.com`
6. Ensure `storage/` is writable (755)
7. Configure SMTP or use host mail for lead notifications
8. Test form submission → check `storage/leads.sqlite` + inbox

---

## Checklist before ads

- [ ] Domain live with HTTPS
- [ ] `hello@groundwork-web.com` working
- [ ] Form test → email + SQLite row
- [ ] Update `spots_remaining` in `config/site.php` as spots fill
- [ ] Add Calendly URL to `.env` when ready (`CALENDLY_URL=`)
- [ ] Mobile test on real phone

---

## Updating spots remaining

Edit `config/site.php`:

```php
'spots_remaining' => 2,  // decrement as you close clients
```

---

## Related docs

| Doc | Purpose |
|-----|---------|
| `../first-steps.md` | Full launch + outreach playbook |
| `docs/01-research.md` | Why each section exists |
| `../website/app/` | Full Laravel site (post-MVP) |
