import {
  profile,
  links,
  about,
  skills,
  experience,
  projects,
  education,
  languages,
  site,
} from './resume'

/**
 * The same content, shaped to the JSON Resume schema (jsonresume.org).
 *
 * Built from the exported objects rather than kept as a second copy, so it
 * cannot fall out of step with the page. Handy for anything that wants the
 * resume as data — an import form, a parser, an agent — and it costs nothing
 * to ship because the values are already in the bundle.
 */
export function toJsonResume() {
  const profileNetwork = (label: string) =>
    ({ GitHub: 'GitHub', LinkedIn: 'LinkedIn', X: 'X' })[label] ?? label

  return {
    $schema:
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: profile.name,
      label: profile.title,
      email: profile.email,
      url: site.url,
      summary: [profile.pitch, ...about].join('\n\n'),
      location: {
        city: profile.city,
        region: profile.region,
        countryCode: profile.countryCode,
      },
      profiles: links
        .filter((link) => !link.href.startsWith('mailto:'))
        .map((link) => ({
          network: profileNetwork(link.label),
          url: link.href,
        })),
    },
    work: experience.map((job) => ({
      name: job.company,
      position: job.role,
      url: job.companyUrl,
      startDate: job.start,
      endDate: job.end,
      location: job.location,
      summary: job.summary,
      highlights: job.highlights,
      // Not part of the schema, but harmless and worth keeping.
      keywords: job.stack,
    })),
    education: education.map((entry) => ({
      institution: entry.institution,
      studyType: entry.qualification,
      startDate: entry.start,
      endDate: entry.end,
      courses: entry.detail ? [entry.detail] : undefined,
    })),
    projects: projects.map((project) => ({
      name: project.name,
      description: [project.description, project.problem, project.approach, project.outcome]
        .filter(Boolean)
        .join('\n\n'),
      highlights: project.metrics?.map((m) => `${m.label}: ${m.value}`),
      keywords: project.stack,
      url: project.demoUrl,
      startDate: project.year,
      roles: project.role ? [project.role] : undefined,
    })),
    skills: skills.map((group) => ({
      name: group.title,
      keywords: group.items,
    })),
    languages: languages.map((lang) => ({
      language: lang.name,
      fluency: lang.level,
    })),
    meta: {
      canonical: `${site.url}resume.json`,
      version: '1.0.0',
      lastModified: new Date().toISOString().slice(0, 10),
    },
  }
}

/** Hands the browser a resume.json download built from the live content. */
export function downloadJsonResume() {
  const blob = new Blob([`${JSON.stringify(toJsonResume(), null, 2)}\n`], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'resume.json'
  a.click()

  // Revoking immediately can race the download in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
