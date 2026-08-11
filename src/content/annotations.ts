/**
 * Notes shown by the "how this page is built" overlay.
 *
 * Each key matches a `data-note="..."` attribute on an element somewhere in
 * the page. The overlay finds those elements, pins a numbered marker to each,
 * and shows the note when you open it. Elements that are not on screen (the
 * design system route, say) are skipped, so this file can describe more than
 * any single view contains.
 */

export type Annotation = {
  title: string
  body: string
}

export const annotations: Record<string, Annotation> = {
  wordmark: {
    title: 'The name reacts to your cursor',
    body:
      'Each letter interpolates along the typeface’s real wght and wdth axes by its distance from the pointer. Bricolage Grotesque is a variable font, so this is the outline itself changing shape, not a weight swap or a transform. It is disabled under prefers-reduced-motion and on touch devices, where there is no pointer to follow.',
  },
  portrait: {
    title: 'A 1-bit dither, computed in the browser',
    body:
      'The photo is drawn to a canvas at low resolution, then each pixel is thresholded against a 4x4 Bayer matrix to make it pure black or white. The sliders underneath are the actual inputs to that loop. Hovering cross-fades back to the photograph.',
  },
  progress: {
    title: 'Reading progress with no JavaScript',
    body:
      'The bar under the header is a CSS scroll-driven animation: animation-timeline: scroll(root block). The browser runs it off the main thread, so it cannot stutter while React is busy, and browsers without support simply show no bar.',
  },
  reveal: {
    title: 'Sections rise in from a scroll timeline',
    body:
      'Also pure CSS, using animation-timeline: view(). It moves each section rather than fading it, and that is deliberate: an earlier version animated opacity, which left everything below the fold at zero contrast until you scrolled to it. Lighthouse called it, correctly. The whole effect also lives inside an @supports block, so the starting state is only ever applied by a browser that can animate it back.',
  },
  skills: {
    title: 'Skills are cross-referenced with the projects',
    body:
      'The count on each tag is derived from the stack arrays in the content file, not typed in by hand. Hovering a skill highlights the projects using it and dims the rest; hovering a project’s stack chip does the reverse. Clicking pins the selection. A skill no project uses is deliberately not interactive, because there would be nothing to show.',
  },
  projectCard: {
    title: 'Cards morph into their detail view',
    body:
      'Opening a project runs the state change inside document.startViewTransition, with a shared view-transition-name on the card and the dialog, so the browser animates between the two layouts. The card releases the name as the dialog takes it, since two elements holding one name at once makes the browser skip the transition.',
  },
  dialogHost: {
    title: 'A real <dialog>, not a div',
    body:
      'Focus trapping, Escape to close, inertness of the page behind and the ::backdrop are all native. Reimplementing those by hand is how keyboard traps get shipped, so this drives the element imperatively instead.',
  },
  numeral: {
    title: 'One deliberate break in the grid',
    body:
      'The oversized outlined numeral is the only element allowed to escape the container gutter, and it drifts against the scroll on its own view timeline so the rail reads as sitting behind the content. Breaking a grid once reads as intentional; breaking it repeatedly reads as an accident.',
  },
  palette: {
    title: 'Two hues with separate jobs',
    body:
      'Indigo is voice — headings, links, buttons. Cyan is data — timestamps, counts and skill tags. Both are written in oklch, where lightness is perceptually uniform, so the light and dark ramps can be reasoned about instead of eyeballed. Every pair is checked against WCAG AA by a script that parses the token file and runs in CI, so a colour that hurts legibility fails the build rather than reaching a visitor.',
  },
  fonts: {
    title: 'Self-hosted variable fonts',
    body:
      'Three typefaces with three jobs — a display face for personality, a sans for reading, a mono for anything the machine is saying — each subset to Latin and served as a variable woff2, so one file covers every weight. Nothing is fetched from a font CDN. The page makes no external requests at all, which keeps it fast and means it leaks nothing about who is reading it.',
  },
  print: {
    title: 'This page is also a PDF',
    body:
      'A print stylesheet strips the navigation, drops the effects, restores the photograph over the dither and writes link URLs out in full. The same stylesheet is rendered by headless Chrome in CI to produce the downloadable resume, so the file can never drift from the site.',
  },
}
