# Personal resume site

A single-page portfolio and resume, built with React, TypeScript and Vite, and
deployed to GitHub Pages automatically on every push to `main`.

**Live site:** https://annoximeme.github.io/Resume/ *(after the one-time setup below)*

---

## Running it locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

| Command           | What it does                                          |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                             |
| `npm run build`   | Type-checks, then builds the production site to `dist` |
| `npm run preview` | Serves the built `dist` folder locally                 |
| `npm run lint`    | Type-check only, no build                              |

---

## Making it yours

**Almost everything lives in one file: [`src/content/resume.ts`](src/content/resume.ts).**

Open it and replace the placeholder text. It is fully typed, so your editor will
tell you if you miss a field, and the page updates as you save. Each export maps
to a block on the page:

| Export       | Section                                          |
| ------------ | ------------------------------------------------ |
| `profile`    | Your name, title, pitch, availability badge      |
| `links`      | GitHub / LinkedIn / email links in the hero      |
| `about`      | The About paragraphs                             |
| `skills`     | Skill groups and tags                            |
| `experience` | The timeline of roles                            |
| `projects`   | Project cards (`featured: true` gets the top row) |
| `education`  | Education and courses                            |
| `site`       | Page title, meta description, footer note        |

Delete an entry and it disappears; empty an array and the whole section renders
empty. Sections you do not want at all can be removed from
[`src/App.tsx`](src/App.tsx) and from `NAV_ITEMS` in
[`src/components/Header.tsx`](src/components/Header.tsx).

### Two things that are *not* in the content file

1. **`index.html`** — the `<title>`, description, Open Graph and JSON-LD tags.
   Search engines and social previews read these before any JavaScript runs, so
   update them there too when your details change.
2. **`public/favicon.svg`** — the initials in the browser tab.

### Changing the colours

Every colour resolves from [`src/styles/tokens.css`](src/styles/tokens.css).
Change `--c-accent` (and its dark-theme counterpart further down the file) and
the entire site follows — buttons, links, timeline dots, the hero glow.

---

## Deploying

### One-time setup

On GitHub, go to **Settings → Pages** and under **Source** choose
**GitHub Actions**.

This step has to be done by hand, once. The workflow cannot do it for you:
creating a Pages site needs repo-admin rights, and the `GITHUB_TOKEN` that
Actions runs with only has permission to *publish* to a Pages site that already
exists. Until it is set, `configure-pages` fails with
`Get Pages site failed … Not Found` and the deploy job is skipped.

After that it is automatic: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
type-checks, builds and publishes on every push to `main`. Re-run the last
failed run from the **Actions** tab to publish immediately, without a new commit.

### About the base path

A GitHub Pages *project* site is served from a subfolder
(`/Resume/`), so the build needs to know that prefix. The workflow passes it
automatically via `BASE_PATH`.

If you move to a **custom domain** or rename the repo to
`Annoximeme.github.io`, the site is served from the root instead — change
`BASE_PATH` in the workflow to `/`.

---

## What is built in

- **Light and dark themes** — follows the OS by default, with a toggle that
  remembers an explicit choice. An inline script in `index.html` applies the
  theme before first paint, so there is no white flash on load.
- **Print stylesheet** — the printer button (or ⌘/Ctrl-P) produces a clean
  black-on-white resume with the navigation stripped out and link URLs written
  out in full. "Save as PDF" gives you a resume file to attach to applications.
- **Scroll-spy navigation** — the current section stays highlighted in the header.
- **Accessibility** — skip link, visible focus rings, labelled icon buttons,
  semantic landmarks, and full `prefers-reduced-motion` support.
- **Responsive** — one column on phones with a slide-down menu, up to a
  four-column skills grid on desktop.
- **No external requests** — no font CDN, no icon library, no analytics. Icons
  are inline SVG, so the page renders identically offline.

---

## Adding a contact form later

The contact section is a `mailto:` link, because a static site has no server to
receive a form post. If you want a real form, the least-effort options are
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) — both
give you an endpoint you can point a plain `<form action="...">` at without
adding a backend.
