/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EDIT THIS FILE. It holds the entire content of your site.
 *  Nothing else needs to change to make this yours. Every section below maps
 *  to a block on the page; empty out an array and that block disappears.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Link = {
  label: string
  href: string
  /** Icon key. See src/components/Icon.tsx for the available set. */
  icon: 'github' | 'linkedin' | 'mail' | 'link' | 'file' | 'x'
}

export type Job = {
  role: string
  company: string
  companyUrl?: string
  /** Free text: "Jan 2024", "2022", "Present". Shown verbatim. */
  start: string
  end: string
  location?: string
  summary: string
  highlights: string[]
  stack: string[]
}

export type Project = {
  name: string
  tagline: string
  description: string
  stack: string[]
  /** Live demo. Omit to hide the button. */
  demoUrl?: string
  /** Source code. Omit to hide the button. */
  repoUrl?: string
  /** Marks the project as the lead item, rendered larger and first. */
  featured?: boolean
  /** Year or range, shown on the card. */
  year?: string
  /** Your part, if the project was not all yours. */
  role?: string
  /**
   * Screenshot filename in public/shots/. A card without one falls back to a
   * text-only layout, so this is safe to leave out until you have an image.
   * `npm run shots` captures them from each project's demoUrl.
   */
  image?: string
  imageAlt?: string
  /**
   * Case-study detail, shown when the card is opened. Three questions worth
   * answering: what was actually hard, what you did about it, and what came
   * out the other end. The last one is the section most people skip and the
   * one that reads as experience rather than enthusiasm.
   */
  problem?: string
  approach?: string
  outcome?: string
  /** Hard numbers, shown as a row in the detail view. */
  metrics?: { label: string; value: string }[]
}

export type SkillGroup = {
  title: string
  items: string[]
}

export type Language = {
  name: string
  /** How well, in your own words. Shown verbatim. */
  level: string
  /** 0-100, drives the bar. Be honest; an interview will find out. */
  strength: number
}

export type Education = {
  qualification: string
  institution: string
  start: string
  end: string
  detail?: string
}

/* ── Who you are ─────────────────────────────────────────────────────────── */

export const profile = {
  name: 'Gianni Goossens',
  /** One line under your name. Keep it short; it is the first thing read. */
  title: 'Full-Stack Developer',
  /** The pitch. Two or three sentences, written as you would say it out loud. */
  pitch:
    'I build web applications end to end — the interface, the API behind it, ' +
    'and the schema behind that. React and TypeScript on the front, Node and ' +
    'Postgres on the back, and a bias toward things that hold up outside the demo.',
  location: 'Antwerp region, Belgium',
  /**
   * Portrait shown in the hero. Swap the image by replacing
   * `public/portrait.jpg`. No code change needed. Set `portrait` to null to
   * drop the photo and let the text run full width.
   */
  portrait: 'portrait.jpg' as string | null,
  portraitAlt: 'Gianni Goossens',
  /** Set to false when you are not looking. Hides the badge in the header. */
  availableForWork: true,
  availabilityNote: 'Open to junior / mid full-stack roles',
  email: 'goossensgianni@gmail.com',
  /**
   * IANA zone, used to show visitors your local time so they know whether
   * they are about to email you at 3am. Full list: `Intl.supportedValuesOf`.
   */
  timezone: 'Europe/Brussels',
  /** Honest, not aspirational. Better to under-promise here. */
  responseTime: 'Usually within a day',
  /**
   * The specifics a recruiter screens on. Vagueness costs you: say the
   * arrangement, the location and when you can start.
   */
  lookingFor: [
    'Junior to mid full-stack, TypeScript across the stack',
    'Antwerp region, or remote within CET ± 2',
    'Full-time, available immediately',
  ],
  /** Structured for the JSON Resume export and the page's JSON-LD. */
  city: 'Antwerp',
  region: 'Flanders',
  countryCode: 'BE',
}

/* ── Now ─────────────────────────────────────────────────────────────────── */
/* What you are actually doing at the moment. Two or three lines, and worth
   keeping current: a stale "now" is worse than none. */

export const now = {
  updated: '2026-08',
  items: [
    'Building this site, and whatever it needs next.',
    'Working through the parts of TypeScript I have been avoiding: generics and narrowing.',
    'Getting properly comfortable with Postgres query plans rather than guessing at indexes.',
    'Reading up on the WCAG 2.2 additions before the EAA deadline bites.',
  ],
}

/* ── Languages ───────────────────────────────────────────────────────────── */

export const languages: Language[] = [
  { name: 'Dutch', level: 'Fluent', strength: 100 },
  { name: 'English', level: 'Fluent', strength: 100 },
]

/* ── How to reach you ────────────────────────────────────────────────────── */

export const links: Link[] = [
  { label: 'GitHub', href: 'https://github.com/Annoximeme', icon: 'github' },
  // Replace with your real profile URL, or delete this line.
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle', icon: 'linkedin' },
  { label: 'Email', href: 'mailto:goossensgianni@gmail.com', icon: 'mail' },
]

/* ── About ───────────────────────────────────────────────────────────────── */

/** Each string is a paragraph. */
export const about: string[] = [
  'I came to web development because I like problems with a visible answer: ' +
    'you change something, you reload, you see whether you were right. That loop ' +
    'is what got me building and what keeps me reading documentation on weekends.',
  'Most of what I know is self-taught and project-driven: I pick something I ' +
    'actually want to exist and build the whole thing, because the interesting ' +
    'part is usually the seam. Working both sides means the API gets designed ' +
    'around what the screen actually needs, and the schema around what the API ' +
    'actually asks for, rather than each one being handed down and worked around.',
  'The parts people skip are the ones I care about on either side: keyboard ' +
    'navigation and sensible loading states on the front, and on the back the ' +
    'migrations, the indexes and the error paths that only show up under load.',
  "I'm looking for a role on a team that reviews each other's code and cares " +
    'whether the end result is good. I would rather be the least experienced ' +
    'person in a strong room than the opposite.',
]

/* ── Skills ──────────────────────────────────────────────────────────────── */

export const skills: SkillGroup[] = [
  {
    title: 'Languages',
    items: ['TypeScript', 'JavaScript (ES2022)', 'HTML5', 'CSS3', 'SQL'],
  },
  {
    title: 'Front-end',
    items: ['React', 'Vite', 'React Router', 'CSS Modules', 'Tailwind CSS', 'Responsive design', 'WCAG / a11y'],
  },
  {
    title: 'Back-end & data',
    items: ['Node.js', 'Express', 'REST APIs', 'PostgreSQL', 'Prisma'],
  },
  {
    title: 'Tooling',
    items: ['Git & GitHub', 'GitHub Actions', 'Vitest', 'Playwright', 'Figma', 'Docker'],
  },
]

/* ── Experience ──────────────────────────────────────────────────────────── */
/* Newest first. Freelance, internships, and side contracts all count. */

export const experience: Job[] = [
  {
    role: 'Freelance Web Developer',
    company: 'Self-employed',
    start: '2024',
    end: 'Present',
    location: 'Remote',
    summary:
      'Design and build small business sites end to end: discovery, build, deploy, and the ongoing changes after launch.',
    highlights: [
      'Delivered N client sites on schedule, each scoring 95+ on Lighthouse performance and accessibility.',
      'Cut a client’s page weight by X% by replacing a page builder with hand-written components.',
      'Set up CI so clients could approve changes on a preview URL before anything reached production.',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Netlify'],
  },
  {
    role: 'Job Title',
    company: 'Company Name',
    companyUrl: 'https://example.com',
    // Any format with a year in it works: "2022", "Sep 2022", "Present".
    // A month makes the bar in the strip above start in the right place.
    start: 'Sep 2022',
    end: 'Dec 2023',
    location: 'City, Country',
    summary:
      'One sentence on what the role actually was: the scope you owned, not the job description.',
    highlights: [
      'Start each line with a verb and end it with a number where you can.',
      'What changed because you were there? That is the bullet worth writing.',
      'Keep it to three or four lines; the interview is where detail belongs.',
    ],
    stack: ['Tech', 'Used', 'Here'],
  },
]

/* ── Projects ────────────────────────────────────────────────────────────── */
/* For a first dev job these matter more than the experience section. */

export const projects: Project[] = [
  /*
   * One real entry, and nothing else. The template projects that used to sit
   * below it are gone: a card reading "Project One" costs more credibility
   * than an empty slot saves, and the skills cross-reference was counting
   * them, so every tag on the page was quoting a number made of placeholders.
   *
   * To add one, copy this shape. `problem` / `approach` / `outcome` and the
   * `metrics` row are optional and drive the detail view; the third of those
   * is the one most people skip and the one that reads as experience rather
   * than enthusiasm. Give it an `image` filename and a real `demoUrl`, then
   * run `npm run shots` to capture the screenshot.
   */
  {
    name: 'This site',
    tagline: 'A resume that has to meet the standard it claims.',
    year: '2026',
    role: 'Design and build',
    image: 'this-site.jpg',
    imageAlt: 'The homepage of this site, dark theme',
    description:
      'A single-page portfolio built with React, TypeScript and Vite, and ' +
      'deployed to GitHub Pages by a workflow that refuses to publish work ' +
      'that fails its own checks.',
    problem:
      'Claiming to care about performance and accessibility is free, and every ' +
      'portfolio does it. I wanted the claims on this page to be things a ' +
      'reviewer could verify without taking my word for anything.',
    approach:
      'Anything assertable is enforced. A script parses the colour tokens, ' +
      'converts each oklch value to linear sRGB and checks all 30 pairs that ' +
      'matter against WCAG AA; it runs in CI, so a colour that hurts ' +
      'legibility fails the build instead of reaching a visitor. CI then ' +
      'audits the deployed build with Lighthouse and writes the scores to a ' +
      'file the page reads, so the numbers shown are measured rather than ' +
      'typed in. The downloadable PDF is rendered from the same print ' +
      'stylesheet as the page, so it cannot drift.',
    outcome:
      'The reveal animations were the useful failure. They faded each section ' +
      'in on scroll, which meant everything below the fold sat at zero ' +
      'contrast until you scrolled to it: an accessibility failure and a bad ' +
      'way to treat a resume. Lighthouse caught it, and the fix was to animate ' +
      'position instead of opacity. The audit paid for itself the first time ' +
      'it ran.',
    metrics: [
      { label: 'Lighthouse', value: '100 ×4' },
      { label: 'External requests', value: '0' },
      { label: 'Colour pairs checked', value: '30' },
    ],
    stack: ['React', 'TypeScript', 'Vite', 'CSS Modules', 'GitHub Actions'],
    demoUrl: 'https://annoximeme.github.io/Resume/',
    repoUrl: 'https://github.com/Annoximeme/Resume',
    featured: true,
  },
]

/* ── Education ───────────────────────────────────────────────────────────── */

export const education: Education[] = [
  {
    qualification: 'Your Degree or Course',
    institution: 'School / Bootcamp / Platform',
    start: 'Year',
    end: 'Year',
    detail: 'Optional line: specialisation, thesis, or notable coursework.',
  },
  {
    qualification: 'Self-directed study',
    institution: 'Ongoing',
    start: '2023',
    end: 'Present',
    detail: 'List the courses or certifications that actually taught you something.',
  },
]

/* ── Site metadata ───────────────────────────────────────────────────────── */

export const site = {
  /** Browser tab + search results. */
  title: `${profile.name} — ${profile.title}`,
  description: profile.pitch,
  /** Full public URL once deployed. Used for canonical + social preview tags. */
  url: 'https://annoximeme.github.io/Resume/',
  /** Shown in the footer. */
  footerNote: 'Built with React, TypeScript and Vite. Source on GitHub.',
}
