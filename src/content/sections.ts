import { about, now, skills, experience, projects, education } from './resume'

/**
 * Which sections actually have something to show.
 *
 * Emptying an array in resume.ts is a documented way to drop a section, but a
 * section that renders its heading and intro over nothing is worse than one
 * that is absent: the intro goes on describing content that is not there.
 * Everything that needs the list of sections — the nav, the palette, the page
 * itself — reads it from here, so they cannot disagree about what exists.
 */
export const SECTIONS = [
  { id: 'about', label: 'About', present: about.length > 0 || now.items.length > 0 },
  { id: 'skills', label: 'Skills', present: skills.length > 0 },
  { id: 'experience', label: 'Experience', present: experience.length > 0 },
  { id: 'projects', label: 'Projects', present: projects.length > 0 },
  { id: 'education', label: 'Education', present: education.length > 0 },
  // Contact is built from `profile`, which always exists.
  { id: 'contact', label: 'Contact', present: true },
] as const

export const VISIBLE_SECTIONS = SECTIONS.filter((s) => s.present)

/** Stable list of ids, for the scroll spy's effect dependency. */
export const VISIBLE_SECTION_IDS: string[] = VISIBLE_SECTIONS.map((s) => s.id)
