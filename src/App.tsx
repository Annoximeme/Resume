import { useCallback, useEffect, useState } from 'react'
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
import { CommandPalette } from './components/CommandPalette'
import { AnnotationLayer } from './components/AnnotationLayer'
import { Shortcuts } from './components/Shortcuts'
import { TechFocusProvider } from './context/TechFocus'
import { useTheme } from './hooks/useTheme'
import { useAccent } from './hooks/useAccent'
import { usePointerSpotlight } from './hooks/usePointerSpotlight'
import { useCardGlow } from './hooks/useCardGlow'

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
  // Owned here so the header and the palette can never disagree about it.
  const [theme, toggleTheme] = useTheme()
  const [accent, chooseAccent] = useAccent()
  const [annotating, setAnnotating] = useState(false)

  usePointerSpotlight()
  useCardGlow()

  const toggleAnnotations = useCallback(() => setAnnotating((v) => !v), [])

  // Jumping between the two pages should start at the top.
  useEffect(() => {
    if (isSystem) window.scrollTo(0, 0)
  }, [isSystem])

  // The notes point at things that only exist on the resume page.
  useEffect(() => {
    if (isSystem) setAnnotating(false)
  }, [isSystem])

  return (
    <TechFocusProvider>
      <div className="ambient" aria-hidden="true" />
      <div className="spotlight" aria-hidden="true" />

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        accent={accent}
        onChooseAccent={chooseAccent}
      />

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

      <Footer onShowAnnotations={toggleAnnotations} annotating={annotating} />

      <CommandPalette
        theme={theme}
        onToggleTheme={toggleTheme}
        accent={accent}
        onChooseAccent={chooseAccent}
        annotating={annotating}
        onToggleAnnotations={toggleAnnotations}
      />

      <Shortcuts onToggleTheme={toggleTheme} onToggleAnnotations={toggleAnnotations} />

      <AnnotationLayer active={annotating && !isSystem} onClose={() => setAnnotating(false)} />
    </TechFocusProvider>
  )
}
