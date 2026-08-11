/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EDIT THIS FILE — it is the entire content of your site.
 *  Nothing else needs to change to make this yours. Every section below maps
 *  to a block on the page; empty out an array and that block disappears.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type Link = {
  label: string
  href: string
  /** Icon key — see src/components/Icon.tsx for the available set. */
  icon: 'github' | 'linkedin' | 'mail' | 'link' | 'file' | 'x'
}

export type Job = {
  role: string
  company: string
  companyUrl?: string
  /** Free text — "Jan 2024", "2022", "Present". Shown verbatim. */
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
  /** Marks the project as the lead item — rendered larger, first. */
  featured?: boolean
}

export type SkillGroup = {
  title: string
  items: string[]
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
  /** One line under your name. Keep it short — it is the first thing read. */
  title: 'Front-End Developer',
  /** The pitch. Two or three sentences, written as you would say it out loud. */
  pitch:
    'I build fast, accessible web interfaces that hold up outside the demo. ' +
    'Currently focused on React and TypeScript, and looking for a team where ' +
    'I can grow into full-stack work.',
  location: 'Belgium',
  /**
   * Portrait shown in the hero. Swap the image by replacing
   * `public/portrait.jpg` — no code change needed. Set `portrait` to null to
   * drop the photo and let the text run full width.
   */
  portrait: 'portrait.jpg' as string | null,
  portraitAlt: 'Gianni Goossens',
  /** Set to false when you are not looking — hides the badge in the header. */
  availableForWork: true,
  availabilityNote: 'Open to junior / mid front-end roles',
  email: 'goossensgianni@gmail.com',
}

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
  'I came to web development because I like problems that have a visible answer — ' +
    'you change something, you reload, you see whether you were right. That loop ' +
    'is what got me building and what keeps me reading documentation on weekends.',
  'Most of what I know is self-taught and project-driven: I pick something I ' +
    'actually want to exist, build it end to end, and learn whatever the build ' +
    'demands. That has meant layout and state management, but also the parts ' +
    'people skip — keyboard navigation, sensible loading states, and making the ' +
    'thing work on a phone with a bad connection.',
  "I'm looking for a first (or next) role on a team that reviews each other's " +
    'code and cares whether the end result is good. I would rather be the least ' +
    'experienced person in a strong room than the opposite.',
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
      'Design and build small business sites end to end — discovery, build, deploy, and the ongoing changes after launch.',
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
    start: 'Month Year',
    end: 'Month Year',
    location: 'City, Country',
    summary:
      'One sentence on what the role actually was — the scope you owned, not the job description.',
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
  {
    name: 'Project One',
    tagline: 'The one-line version of what it does.',
    description:
      'What problem it solves and the interesting part of how you solved it. ' +
      'Name the hard bit — the caching, the offline sync, the drag-and-drop — ' +
      'because that is what a reviewer is scanning for.',
    stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    demoUrl: 'https://example.com',
    repoUrl: 'https://github.com/Annoximeme/project-one',
    featured: true,
  },
  {
    name: 'Project Two',
    tagline: 'Short, concrete, no buzzwords.',
    description:
      'Two or three sentences. What it does, what you learned building it, and ' +
      'anything measurable — users, load time, size of the dataset it handles.',
    stack: ['React', 'Vite', 'CSS Modules'],
    repoUrl: 'https://github.com/Annoximeme/project-two',
  },
  {
    name: 'Project Three',
    tagline: 'Even a small tool is worth listing if it is finished.',
    description:
      'Finished and deployed beats ambitious and abandoned. A polished small ' +
      'project reads better than a half-built large one.',
    stack: ['TypeScript', 'Web APIs'],
    demoUrl: 'https://example.com',
  },
]

/* ── Education ───────────────────────────────────────────────────────────── */

export const education: Education[] = [
  {
    qualification: 'Your Degree or Course',
    institution: 'School / Bootcamp / Platform',
    start: 'Year',
    end: 'Year',
    detail: 'Optional line — specialisation, thesis, or notable coursework.',
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
