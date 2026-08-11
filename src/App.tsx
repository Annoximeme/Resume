import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Skills } from './components/Skills'
import { Experience } from './components/Experience'
import { Projects } from './components/Projects'
import { Education } from './components/Education'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { DesignSystem } from './components/DesignSystem'
import { TechFocusProvider } from './context/TechFocus'

/**
 * Hash-based routing, deliberately. The site is two pages; a router dependency
 * would be more code than the feature. Hash routes also survive GitHub Pages
 * without a rewrite rule, which real paths would need.
 */
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash
}

export function App() {
  const hash = useHashRoute()
  const isSystem = hash.startsWith('#/system')

  // Jumping between the two pages should start at the top, not wherever the
  // previous page happened to be scrolled to.
  useEffect(() => {
    if (isSystem) window.scrollTo(0, 0)
  }, [isSystem])

  return (
    <TechFocusProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header />

      {isSystem ? (
        <DesignSystem />
      ) : (
        <main id="main">
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Education />
          <Contact />
        </main>
      )}

      <Footer />
    </TechFocusProvider>
  )
}
