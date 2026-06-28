# cPanel deployment notes

See [cPanel Git deployment docs](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/).

## File layout after deploy

| Path | Purpose |
|------|---------|
| `~/public_html/` | Web root (index.php, css, js, images) |
| `~/config/` | Site config |
| `~/lib/` | PHP bootstrap |
| `~/includes/` | Page sections |
| `~/storage/` | SQLite leads (writable) |
| `~/.env` | Production env |

## If cPanel still says invalid .cpanel.yml

1. In **Git Version Control** → your repo → click **Update from Remote**
2. Confirm **Branch** is `main` and `.cpanel.yml` appears in the file list at repo root
3. Click **Deploy HEAD Commit**

## Custom public_html path

Edit `.cpanel.yml` line 4. Example for subdomain folder:

```yaml
    - export DEPLOYPATH=$HOME/public_html/offer/
```

Replace `offer` with your folder name. Commit and push, then Update from Remote.

## After deploy

Edit `~/.env`:

```
SITE_URL=https://yourdomain.com
SITE_EMAIL=hello@groundwork-web.com
MAIL_TO=hello@groundwork-web.com
```
