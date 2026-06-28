# Deploy groundwork-web.com (Namecheap / shared cPanel)

**Domain:** `groundwork-web.com`  
**cPanel user:** `grouevbi`

---

## Why you can't change the document root

On **Namecheap shared hosting**, `groundwork-web.com` is usually your **primary domain**. cPanel **does not allow** changing the document root for the main domain — it stays:

```
/home/grouevbi/public_html/
```

You won't see "New Document Root" on the Manage screen, or the field will be greyed out. **That's normal.**

**Solution:** Git deploy **copies** your site into `public_html` automatically via `.cpanel.yml`.

---

## Where to look (if you still want to check)

**cPanel home → search bar → type `Domains`**

Try these (depends on your skin):

| Menu item | What to do |
|-----------|------------|
| **Domains** → find `groundwork-web.com` → **Manage** | Look for "Document Root" (often read-only for primary domain) |
| **Addon Domains** | Only if you added the domain as an addon |
| **Subdomains** | Not needed here |

If there's no editable field, use the deploy steps below instead.

---

## Deploy steps (use this)

### 1. Pull + deploy from GitHub

**Git Version Control → offer1**

1. **Update from Remote** (branch `main`)
2. **Deploy HEAD Commit**

This copies files to `public_html` and app folders to your home directory.

### 2. Remove parking page (one time)

**File Manager → public_html**

Delete or rename:

- `parking-page.shtml`

Your site uses `index.php` from the deploy.

### 3. Edit `.env` on server

**File Manager → Settings → Show Hidden Files**

Open `/home/grouevbi/.env` (home folder, **not** inside public_html):

```env
SITE_URL=https://groundwork-web.com
SITE_EMAIL=hello@groundwork-web.com
MAIL_TO=hello@groundwork-web.com
```

### 4. SSL

**SSL/TLS Status → Run AutoSSL** for `groundwork-web.com`

### 5. Test

Visit **https://groundwork-web.com** — founding partner landing page.

---

## File layout after deploy

| Path | Contents |
|------|----------|
| `/home/grouevbi/public_html/` | index.php, css, js, images (what visitors see) |
| `/home/grouevbi/config/` | Site copy & offer settings |
| `/home/grouevbi/lib/` | PHP code |
| `/home/grouevbi/includes/` | Page sections |
| `/home/grouevbi/storage/` | Lead form database |
| `/home/grouevbi/.env` | Production settings |
| `/home/grouevbi/repositories/offer1/` | Git repo (source — not served directly) |

---

## Future updates

```bash
# Mac
cd /Users/cyrus/Desktop/Business/mvp-website
git push origin main
```

cPanel → **Update from Remote** → **Deploy HEAD Commit**
