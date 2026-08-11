# Personal resume site

My portfolio and resume as a single page. React + TypeScript + Vite, deployed to
GitHub Pages on every push to `main`.

Live at https://annoximeme.github.io/Resume/

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

| Command            | What it does                                          |
| ------------------ | ----------------------------------------------------- |
| `npm run dev`      | Dev server with hot reload                            |
| `npm run build`    | Type-check, contrast check, then build to `dist`      |
| `npm run preview`  | Serve the built `dist` folder                         |
| `npm run lint`     | Type-check only                                       |
| `npm run contrast` | Check every colour pair against WCAG AA               |

## Editing the content

Everything you'd normally want to change lives in
[`src/content/resume.ts`](src/content/resume.ts). It's typed, so the editor will
complain if a field is missing, and the page updates as you save.

| Export       | Section                                           |
| ------------ | ------------------------------------------------- |
| `profile`    | Name, title, pitch, availability badge            |
| `links`      | GitHub / LinkedIn / email links in the hero       |
| `about`      | The About paragraphs                              |
| `skills`     | Skill groups and tags                             |
| `experience` | Timeline of roles                                 |
| `projects`   | Project cards (`featured: true` leads)            |
| `education`  | Education and courses                             |
| `site`       | Page title, meta description, footer note         |

Delete an entry and it disappears. Empty an array and the section renders empty.
To drop a section entirely, remove it from [`src/App.tsx`](src/App.tsx) and from
`NAV_ITEMS` in [`src/components/Header.tsx`](src/components/Header.tsx).

Four things live outside that file:

1. `index.html` holds the `<title>`, description, Open Graph and JSON-LD tags.
   Crawlers read those before any JavaScript runs, so keep them in sync.
2. `public/favicon.svg` is the tab icon.
3. `public/portrait.jpg` is the hero photo. Replace the file to change it, and
   keep it square since it's cropped to 1:1. Set `profile.portrait` to `null` to
   remove the photo and let the text run full width.
4. `public/fonts/` holds the two variable fonts and their OFL licences. The
   licences have to ship with the fonts, so don't delete them.

## Colours

All of them resolve from [`src/styles/tokens.css`](src/styles/tokens.css). Two
hues do the work and they have separate jobs:

- `--c-accent` (terracotta) is voice: headings, links, buttons, taglines,
  timeline dots, the hero glow.
- `--c-tech` (deep teal) is data: date stamps and skill tags.

Keeping those apart is what stops the whole page reading as one flat orange
wash. Light values sit at the top of the file. Dark values are the `--d-*`
block, defined once and mapped onto `--c-*` by the two theme selectors below it,
so a dark colour is only ever written in one place.

`npm run contrast` parses the token file and checks every pair that matters
against WCAG AA (4.5:1 for text, 3:1 for control borders). It runs as part of
`npm run build` and in CI, so a colour change that hurts legibility fails the
build and tells you which pair broke. If you want a lighter grey than it allows,
change the threshold in
[`scripts/check-contrast.mjs`](scripts/check-contrast.mjs) on purpose rather
than finding out from a visitor.

Note the split between `--c-border-strong` (decorative hairlines and separators,
exempt from WCAG 1.4.11) and `--c-border-control` (real button edges, not
exempt). Use the second one on anything clickable.

## Deploying

One manual step, once: **Settings → Pages → Source → GitHub Actions**.

The workflow can't do this itself. Creating a Pages site needs repo-admin
rights, and the `GITHUB_TOKEN` Actions runs with can only publish to a site that
already exists. Until it's set, `configure-pages` fails with
`Get Pages site failed … Not Found` and the deploy job is skipped.

After that it's automatic. [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
type-checks, runs the contrast check, builds and publishes on every push to
`main`. You can re-run the last failed run from the Actions tab to publish
without a new commit.

### Base path

A project site is served from a subfolder (`/Resume/`), so the build needs that
prefix. The workflow passes it as `BASE_PATH`. On a custom domain, or if the
repo is renamed to `Annoximeme.github.io`, the site moves to the root and
`BASE_PATH` should become `/`.

## What's in it

**Themes.** Follows the OS by default with a toggle that remembers an explicit
choice. An inline script in `index.html` applies the theme before first paint so
there's no white flash.

**Print stylesheet.** The printer button (or Ctrl/Cmd-P) gives a clean
black-on-white resume with the navigation stripped and link URLs written out in
full. "Save as PDF" produces something you can attach to an application.

**Skills cross-reference the projects.** Each skill shows how many projects used
it, and hovering one picks those out while the rest recede. It works from the
project side too, and clicking pins the selection. The link comes from the
`stack` arrays in the content file, so it stays true as you edit them. A skill
no project uses simply isn't interactive.

**Project detail views** morph out of their card with the View Transitions API,
inside a native `<dialog>` so focus trapping, Escape and inertness are the
browser's job. Browsers without view transitions just open the dialog.

**Typography.** Bricolage Grotesque for display, Instrument Sans for text. Both
self-hosted as Latin-subset variable woff2 and preloaded, so one file covers
every weight and the axes are available to animate. Which is what the wordmark
does: each letter of the name interpolates along the real `wght` and `wdth` axes
by distance from the pointer.

**The portrait** is a 1-bit ordered (Bayer) dither computed on a canvas at load,
cross-fading to the photograph on hover or focus.

**A living design system** at `#/system`, linked from the footer. Colours, type
scale and spacing are read from the running stylesheet, and the contrast figures
are computed in the browser from what's actually rendered, so switching theme
recalculates them.

**Motion** comes from CSS scroll timelines rather than JavaScript: the reading
progress bar in the header and the reveal on every section. No
IntersectionObserver, nothing on the main thread. The reveal sits entirely
inside `@supports`, so a browser that can't animate it never gets the hidden
starting state either.

**Layout** is two columns on desktop, with each section heading in a sticky rail
on the left so it stays with its content. One column on narrow screens, with the
portrait above the text.

**Accessibility.** Skip link, visible focus rings, labelled icon buttons,
semantic landmarks, `prefers-reduced-motion` honoured throughout, and the
contrast check above.

**No external requests.** No font CDN, no icon library, no analytics. Icons are
inline SVG and the fonts are local, so the page renders the same offline and
leaks nothing about who visits.

## Contact form

The contact section is a `mailto:` link, since a static site has no server to
receive a post. [Formspree](https://formspree.io) and
[Web3Forms](https://web3forms.com) both give you an endpoint you can point a
plain `<form action="...">` at if you want a real one.
