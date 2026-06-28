# Deploy groundwork-web.com (cPanel)

**Domain:** `groundwork-web.com`  
**cPanel user:** `grouevbi`  
**GitHub repo:** https://github.com/cyrusw17/offer1.git  
**Server repo path:** `/home/grouevbi/repositories/offer1/`

---

## Step 1 — Attach domain to the repo (one time)

**cPanel → Domains → groundwork-web.com → Document Root**

Set to:

```
/home/grouevbi/repositories/offer1/public
```

Save. This replaces the default `public_html` parking page for this domain.

---

## Step 2 — Pull and deploy from GitHub

**cPanel → Git Version Control → offer1**

1. **Update from Remote** (branch: `main`)
2. **Deploy HEAD Commit**

Enable **File Manager → Settings → Show Hidden Files** and confirm `.cpanel.yml` exists in `repositories/offer1/`.

---

## Step 3 — Production `.env` on server

In `/home/grouevbi/repositories/offer1/`:

Copy `.env.example` → `.env` (or edit `.env` if it exists):

```env
SITE_URL=https://groundwork-web.com
SITE_EMAIL=hello@groundwork-web.com
MAIL_TO=hello@groundwork-web.com
CALENDLY_URL=
```

---

## Step 4 — Email (recommended)

**cPanel → Email Accounts** → create `hello@groundwork-web.com`

Then form submissions to `MAIL_TO` will reach your inbox.

---

## Step 5 — SSL

**cPanel → SSL/TLS Status** → run **AutoSSL** for `groundwork-web.com`

Site should load at **https://groundwork-web.com**

---

## Step 6 — Verify

- [ ] https://groundwork-web.com shows the founding partner landing page
- [ ] Not the Namecheap/parking page
- [ ] Submit contact form → check `repositories/offer1/storage/leads.sqlite` or email
- [ ] Mobile looks correct

---

## Future updates (every change)

**On your Mac:**

```bash
cd /Users/cyrus/Desktop/Business/mvp-website
git add .
git commit -m "Your change"
git push origin main
```

**In cPanel:** Git Version Control → offer1 → **Update from Remote** → **Deploy HEAD Commit**

Live site at **https://groundwork-web.com** will match GitHub.

---

## DNS (if domain not pointed yet)

At your domain registrar, point to your hosting:

| Type | Name | Value |
|------|------|--------|
| A | `@` | *(IP from cPanel → Server Information)* |
| A or CNAME | `www` | same as above or `groundwork-web.com` |

DNS can take up to 24–48 hours. SSL works after DNS resolves.
