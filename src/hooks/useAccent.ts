import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_ACCENT, isAccent } from '../content/accents'

const STORAGE_KEY = 'accent'

/** Whatever the boot script in index.html already put on <html>. */
function currentAccent(): string {
  const attr = document.documentElement.dataset.accent
  return isAccent(attr ?? null) ? attr! : DEFAULT_ACCENT
}

/**
 * The accent hue pair, as a `data-accent` attribute on the root element.
 *
 * Only the attribute is set here — every colour it implies is resolved by
 * tokens.css, which is what keeps the swatch in the picker honest and what
 * lets scripts/check-contrast.mjs verify a palette that only exists in CSS.
 */
export function useAccent(): [string, (id: string) => void] {
  const [accent, setAccent] = useState<string>(currentAccent)

  useEffect(() => {
    // The default is the absence of the attribute, so that a visitor who never
    // touches this gets exactly the stylesheet's own palette.
    if (accent === DEFAULT_ACCENT) delete document.documentElement.dataset.accent
    else document.documentElement.dataset.accent = accent
  }, [accent])

  const choose = useCallback((id: string) => {
    if (!isAccent(id)) return
    setAccent(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // Private browsing. The choice still applies for this visit.
    }
  }, [])

  return [accent, choose]
}
