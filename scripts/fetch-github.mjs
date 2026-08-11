/**
 * Pulls public activity from the GitHub API and writes it to
 * src/content/github.json, which the site imports at build time.
 *
 * Doing this at build rather than in the browser means no API token in the
 * client, no rate limit shared with visitors, and no request on page load.
 *
 * If the fetch fails the existing JSON is left alone and the script exits 0.
 * A GitHub outage should never be able to fail a deploy of a resume.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const USER = process.env.GITHUB_USER ?? 'Annoximeme'
const OUT = fileURLToPath(new URL('../src/content/github.json', import.meta.url))

const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': `${USER}-resume-site`,
  // Actions supplies a token; locally it runs unauthenticated at 60 req/hour,
  // which is plenty for two calls.
  ...(process.env.GITHUB_TOKEN
    ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
}

async function get(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) throw new Error(`GET ${path} responded ${res.status}`)
  return res.json()
}

/** Pure transform, kept separate from the network so it can be tested. */
export function buildData(user, repos) {
  const own = repos.filter((r) => !r.fork && !r.archived)

  // Count repos per language rather than bytes: one enormous vendored file
  // should not make a language look like the bulk of someone's work.
  const languages = {}
  for (const repo of own) {
    if (!repo.language) continue
    languages[repo.language] = (languages[repo.language] ?? 0) + 1
  }

  const ranked = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      count,
      share: Math.round((count / own.length) * 100),
    }))

  return {
    user: {
      login: user.login,
      url: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
    },
    languages: ranked,
    recent: own.slice(0, 5).map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
    })),
    fetchedAt: new Date().toISOString(),
  }
}

// Importing the module for its transform must not fire the network.
if (import.meta.url === `file://${process.argv[1]}`) {
  await main()
}

async function main() {
try {
  const [user, repos] = await Promise.all([
    get(`/users/${USER}`),
    get(`/users/${USER}/repos?per_page=100&sort=pushed`),
  ])

  const data = buildData(user, repos)
  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`)
  console.log(
    `github: ${data.recent.length} recent repos, ${data.languages.length} languages`,
  )
} catch (err) {
  let existing = false
  try {
    JSON.parse(readFileSync(OUT, 'utf8'))
    existing = true
  } catch {
    // No usable file to fall back on.
  }

  console.warn(`github: fetch failed (${err.message})`)
  if (existing) {
    console.warn('github: keeping the previously committed data')
  } else {
    // Write an empty shape so the import always resolves and the component
    // can decide to render nothing.
    writeFileSync(
      OUT,
      `${JSON.stringify({ user: null, languages: [], recent: [], fetchedAt: null }, null, 2)}\n`,
    )
    console.warn('github: wrote an empty placeholder')
  }
}
}
