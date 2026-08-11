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
| `npm run contrast`| Checks every colour pair against WCAG AA               |

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

### Four things that are *not* in the content file

1. **`index.html`** — the `<title>`, description, Open Graph and JSON-LD tags.
   Search engines and social previews read these before any JavaScript runs, so
   update them there too when your details change.
2. **`public/favicon.svg`** — the initials in the browser tab.
3. **`public/portrait.jpg`** — the hero photo. Replace the file to change the
   picture; keep it square, since it is cropped to a 1:1 frame. Setting
   `profile.portrait` to `null` removes it and lets the text run full width.
4. **`public/fonts/`** — the two variable fonts and their OFL licences. The
   licences must ship with the fonts; do not delete them.

### Changing the colours

Every colour resolves from [`src/styles/tokens.css`](src/styles/tokens.css).
Two hues do the work, and they have distinct jobs:

- `--c-accent` (terracotta) is **voice** — headings, links, buttons, taglines,
  timeline dots, the hero glow.
- `--c-tech` (deep teal) is **data** — date stamps and skill tags.

Keeping them apart is what stops the page reading as one flat orange wash.
Change either and the whole site follows. Light values live at the top of the
file; dark values are the `--d-*` block, defined once and mapped onto `--c-*`
by the two theme selectors below it.

**The colours are enforced.** `npm run contrast` parses the token file and
checks every pair that matters against WCAG AA — 4.5:1 for text, 3:1 for
control borders. It runs as part of `npm run build` and in CI, so a colour
change that hurts legibility fails the build and names the pair. If you want a
lighter grey than it allows, the honest fix is to change the threshold in
[`scripts/check-contrast.mjs`](scripts/check-contrast.mjs) deliberately rather
than to discover the problem from a visitor.

One deliberate distinction: `--c-border-strong` is decorative (hairlines,
separators) and exempt from the 3:1 rule, while `--c-border-control` bounds
real buttons and is not. Use the latter on anything clickable.

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
- **Editorial two-column layout** — on desktop each section heading sits in a
  rail on the left and stays put while its content scrolls past, so you always
  know which part of the resume you are reading. Collapses to one column on
  narrow screens.
- **Skills cross-reference the projects.** Every skill carries the number of
  projects that used it, and hovering one picks those projects out while the
  rest recede — it works from either side, so a project's stack chips highlight
  the matching skill too. Click to pin the selection. The link is derived from
  the `stack` arrays already in the content file, so it stays true as you edit
  them, and a skill no project uses is simply not interactive.
- **Project detail views** that morph out of their card using the View
  Transitions API, in a native `<dialog>` so focus trapping, Escape and
  inertness are the browser's job rather than reimplemented. Browsers without
  view transitions just open the dialog.
- **A cursor-reactive wordmark.** Each letter of the name interpolates along
  the font's real `wght` and `wdth` axes by distance from the pointer. It is
  the typeface deforming, not a transform.
- **A dithered portrait** — a 1-bit ordered (Bayer) dither computed on a canvas
  at load, cross-fading to the photograph on hover or focus.
- **A living design system** at [`#/system`](#/system), linked from the footer.
  Colours, type scale and spacing are read from the running stylesheet, and the
  contrast figures are computed in your browser from the colours actually
  rendered — switch theme and they recalculate.
- **Reading-progress bar** in the header and **scroll-reveal on every section**,
  both driven by CSS scroll timelines — no JavaScript, no main-thread work, and
  no IntersectionObserver. The reveal lives entirely inside `@supports`, so a
  browser that cannot animate it never gets the hidden starting state either.
- **Responsive** — one column on phones with a slide-down menu and the portrait
  stacked above the text, two columns from 60rem up.
- **Typography** — Bricolage Grotesque for display and Instrument Sans for
  text, both self-hosted as Latin-subset variable woff2 and preloaded. Variable
  means one file covers every weight, and the axes are available to animate.
- **No external requests** — no font CDN, no icon library, no analytics. Icons
  are inline SVG and fonts are local, so the page renders identically offline
  and leaks nothing about who visits it.

---

## Adding a contact form later

The contact section is a `mailto:` link, because a static site has no server to
receive a form post. If you want a real form, the least-effort options are
[Formspree](https://formspree.io) or [Web3Forms](https://web3forms.com) — both
give you an endpoint you can point a plain `<form action="...">` at without
adding a backend.
