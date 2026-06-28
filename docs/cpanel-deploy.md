# cPanel deploy — Groundwork Web (offer1)

Account from your host: **`grouevbi`** on `server313.web-hosting.com`

## Why File Manager shows no .cpanel.yml

Dotfiles are hidden by default.

**File Manager → Settings (top right) → check “Show Hidden Files”**

You should then see in `/home/grouevbi/repositories/offer1/`:

- `.cpanel.yml`
- `.env.example`
- `.gitignore`

## Recommended setup (simplest)

Your code already lives at:

```
/home/grouevbi/repositories/offer1/
├── public/          ← point your domain HERE
├── config/
├── lib/
├── includes/
├── storage/
└── .cpanel.yml
```

### Step 1 — Pull latest from GitHub

**cPanel → Git Version Control → offer1 → Update from Remote**

Confirm `.cpanel.yml` exists (enable hidden files).

### Step 2 — Set document root

**cPanel → Domains → your domain → Document Root**

Change from:

```
/home/grouevbi/public_html
```

To:

```
/home/grouevbi/repositories/offer1/public
```

Save. This makes the site serve from the repo’s `public/` folder (no copy step needed).

### Step 3 — Deploy

**Git Version Control → offer1 → Deploy HEAD Commit**

The `.cpanel.yml` only ensures `storage/` exists and is writable for the lead form.

### Step 4 — Environment file

In File Manager (show hidden files), copy:

```
repositories/offer1/.env.example  →  repositories/offer1/.env
```

Edit `.env`:

```
SITE_URL=https://yourdomain.com
SITE_EMAIL=hello@groundwork-web.com
MAIL_TO=hello@groundwork-web.com
```

### Step 5 — Test

Visit your domain. Submit the contact form. Check `repositories/offer1/storage/leads.sqlite`.

---

## If Git still says “needs a valid .cpanel.yml”

1. **Update from Remote** (must be on branch `main`)
2. Enable **Show Hidden Files** — confirm `.cpanel.yml` is in `repositories/offer1/` (not `public_html`)
3. Repo must be **clean** (no uncommitted changes in cPanel’s copy)
4. Delete and **re-clone** the repo in Git Version Control if it was created before `.cpanel.yml` existed:
   - Clone URL: `https://github.com/cyrusw17/offer1.git`
   - Repository Path: `repositories/offer1`
   - Check **Deployable** if offered

---

## Alternate: copy to public_html

Only use this if you cannot change document root. Replace `.cpanel.yml` with:

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/grouevbi/public_html/
    - /bin/mkdir -p /home/grouevbi/storage
    - /bin/cp public/index.php $DEPLOYPATH
    - /bin/cp public/robots.txt $DEPLOYPATH
    - /bin/cp public/.htaccess $DEPLOYPATH
    - /bin/cp -R public/css $DEPLOYPATH
    - /bin/cp -R public/js $DEPLOYPATH
    - /bin/cp -R public/images $DEPLOYPATH
    - /bin/cp -R config /home/grouevbi/config
    - /bin/cp -R lib /home/grouevbi/lib
    - /bin/cp -R includes /home/grouevbi/includes
    - /bin/chmod 775 /home/grouevbi/storage
```

Then document root stays `/home/grouevbi/public_html`.
