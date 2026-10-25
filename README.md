# Chroma — launch checklist
1. [x] Base URL set to `https://cinch2108.github.io/chroma` (see GitHub Pages below).
2. [ ] Replace the placeholder `contact@example.com` in `privacy.html` and `terms.html` with a real address.
3. [ ] Ads: paste each ad unit inside the matching `<div data-ad-slot="...">` (top, side-1, side-2, foot), put the publisher line in ads.txt, and add the ad network's domains to the CSP meta in `template.html` (then rebuild; also `_headers` if you ever move hosts).
4. [ ] Create the `cinch2108/chroma` repo, push this folder as the root, enable Pages (branch `main`, `/`), and check https://cinch2108.github.io/chroma/ and a random missing URL (should show the 404 page).
5. [ ] Submit `https://cinch2108.github.io/chroma/sitemap.xml` in Google Search Console.

## SEO
- Each tool has its own page: ./ (palette generator), color-converter/, contrast-checker/, gradient-generator/, image-color-picker/.
- Edit `template.html`, then run `python3 build_pages.py` to regenerate all pages and sitemap.xml (titles, descriptions, FAQs live in the script).
- After launch: verify the domain in Google Search Console and submit sitemap.xml, then list the site on Product Hunt, AlternativeTo, and design/dev directories, and share it on Reddit (r/web_design, r/webdev, r/accessibility) for backlinks.

## GitHub Pages (https://cinch2108.github.io/chroma/)
This folder is the repo root for the `chroma` repo under `cinch2108` (Settings → Pages → Deploy from branch `main`, folder `/`). It is served from the `/chroma/` sub-path, so:
- All internal links and assets are relative (`styles.css`, `../contrast-checker/`, `./`). Never add root-absolute links like `href="/..."`; they would point at `cinch2108.github.io/` instead of the site.
- The base URL `https://cinch2108.github.io/chroma` is set in `DOMAIN` at the top of `build_pages.py` (canonical, og:url, JSON-LD, sitemap) plus `template.html`, `robots.txt`, `privacy.html`, `terms.html`. To move to a custom domain later, change it there, run `python3 build_pages.py`, and add a `CNAME` file.
- `404.html` is served by Pages for any missing URL at any depth, so it uses `<base href="/chroma/">` (the one intentional root-relative path) to keep its CSS and links working. If the repo is renamed, update that line.
- `.nojekyll` is present so Pages serves files as-is (no Jekyll processing).
- `robots.txt` here is informational only: crawlers read robots.txt only at the domain root (`cinch2108.github.io/robots.txt`). Submit the sitemap directly in Search Console (URL-prefix property `https://cinch2108.github.io/chroma/`).
- All three sites share the `cinch2108.github.io` origin, so local storage is shared between them; this site's keys are all prefixed (`chroma.*`) so nothing collides.

### Headers GitHub Pages can't set
GitHub Pages ignores `_headers` (kept only for a future move to Netlify/Cloudflare Pages). What is covered instead:
- **Content-Security-Policy** and **Referrer-Policy**: set as `<meta>` tags on every page (tool pages, privacy, terms, 404).
- **frame-ancestors** (CSP, not allowed in a meta tag) and **X-Frame-Options**: cannot be set. `app.js` starts with a frame-buster that breaks out of (or blanks the page inside) any frame from another origin. Privacy, terms and 404 have no JS and nothing interactive, so they aren't covered.
- **Strict-Transport-Security**: can't be set by you, but github.io is HSTS-preloaded and Pages enforces HTTPS (tick "Enforce HTTPS" if you add a custom domain).
- **X-Content-Type-Options**, **Permissions-Policy**, **Cross-Origin-Opener-Policy**: cannot be set on Pages (not valid as meta tags).

### Contact email
The privacy and terms pages use the placeholder **contact@example.com**. Change it to a real address you read before launch: `grep -rl contact@example.com .`
