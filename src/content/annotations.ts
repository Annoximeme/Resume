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
    title: 'The photograph is toned by the page it sits on',
    body:
      'Every pixel\u2019s luminance is looked up in a 256-step ramp built from the palette itself \u2014 the page\u2019s ink, both accent hues, its lightest surface \u2014 read out of the live stylesheet rather than written down here. Switch the theme or the accent and the portrait re-tones with everything else. The stops are ordered by measured luminance rather than by the job each colour does, because role order does not survive a theme switch: the ink is near-black on one theme and near-white on the other, and seating it at the shadow end inverted the photograph. Nothing is discarded \u2014 all 256 levels survive \u2014 so the face stays legible in a way a threshold cannot manage. The strip below is five stops sampled out of the same ramp the pixels went through. Hover for the untouched photo.',
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
    title: 'Two hues with separate jobs, and you can rotate them',
    body:
      'One hue is voice — headings, links, buttons. The other is data — timestamps, counts and skill tags. Both are written in oklch and stored as bare hue numbers, so the droplet in the header restyles the entire page by changing two of them. What it cannot do is break the contrast, because a script parses the token file and walks every accent through every pair in both themes before CI will let a build finish. Two of the six needed their lightness pulled down to pass: oklch lightness is perceptual, not photometric, and a teal at the same L carries far more luminance than an indigo.',
  },
  fonts: {
    title: 'Self-hosted variable fonts',
    body:
      'Three typefaces with three jobs — a display face for personality, a sans for reading, a mono for anything the machine is saying — each subset to Latin and served as a variable woff2, so one file covers every weight. Nothing is fetched from a font CDN. The page makes no external requests at all, which keeps it fast and means it leaks nothing about who is reading it.',
  },
  codeCard: {
    title: 'The snippet is not a picture of code',
    body:
      'Every value in it is read out of the same content file the rest of the page renders from, so it cannot claim anything the page does not — the stack line is the technologies the project list actually uses most, counted. There is no syntax highlighter either: the lines are built from typed tokens rather than written as a string and parsed back, which makes the colouring right by construction instead of right as far as a regex can tell. Copy gives you the text those same tokens produce.',
  },
  print: {
    title: 'This page is also a PDF',
    body:
      'A print stylesheet strips the navigation, drops the effects, restores the untoned photograph and writes link URLs out in full. The same stylesheet is rendered by headless Chrome in CI to produce the downloadable resume, so the file can never drift from the site.',
  },
}
