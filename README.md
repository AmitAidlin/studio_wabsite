# Aidlin Design – Studio Website

Structure:

- `index.html`, `assets/`, `lovable-uploads/`, `favicon.ico`, `robots.txt`, `.nojekyll` – the built site, served by GitHub Pages from the repo root. `index.html` is the home page.
- `site-source/` – the source code (Vite + React + Tailwind).
- `archive/` – old files kept for reference.

## Publish on GitHub Pages

1. Commit and push with GitHub Desktop.
2. Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `main`, folder: `/ (root)` → Save.
3. The site will be live at `https://amitaidlin.github.io/studio_wabsite/`.

## Shop products (Excel)

Products are managed in `shop/products.xlsx` (photos go in `shop/photos`).
After editing the file, run `npm run update-shop` inside `site-source` (or ask Claude), then Commit + Push.

## Update the site

```bash
cd site-source
npm install      # first time only
npm run build    # creates site-source/dist
```

Then copy the contents of `site-source/dist` into the repo root (replace `index.html` and `assets/`), commit and push.

Notes: the site uses hash routes (`#/projects`) so page links work on GitHub Pages.
The admin / login pages need the Supabase backend configured in `site-source/src/integrations/supabase/client.ts`.
