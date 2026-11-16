# Aidlin Design – Studio Website

Structure:

- `docs/` – the built site. **This is what GitHub Pages serves.**
- `site-source/` – the source code (Vite + React + Tailwind).
- `archive/` – old files kept for reference.

## Publish on GitHub Pages

1. Push the repo to GitHub.
2. Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `main`, folder: `/docs` → Save.
3. The site will be live at `https://amitaidlin.github.io/studio_wabsite/`.

## Update the site

```bash
cd site-source
npm install      # first time only
npm run dev      # work locally
npm run build    # rebuilds ../docs
```

Then commit and push the updated `docs/` folder.

Notes: the site uses hash routes (`#/projects`) so page links work on GitHub Pages.
The admin / login pages need the Supabase backend configured in `site-source/src/integrations/supabase/client.ts`.
