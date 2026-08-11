/**
 * The accent palettes a visitor can switch between.
 *
 * `id` matches a `[data-accent='...']` block in src/styles/tokens.css, where
 * the actual hues live. Nothing here is a colour: the swatch in the picker is
 * painted by the stylesheet too, so it cannot show one accent and apply
 * another. scripts/check-contrast.mjs asserts this list and that file agree,
 * and runs every palette through every contrast pair before a build ships.
 */

export type Accent = {
  id: string
  label: string
  /** Shown under the swatches, so the choice reads as a decision. */
  note: string
}

export const DEFAULT_ACCENT = 'indigo'

export const accents: Accent[] = [
  { id: 'indigo', label: 'Indigo', note: 'The default. Cool, high chroma.' },
  { id: 'violet', label: 'Violet', note: 'Warmer, further round the wheel.' },
  { id: 'azure', label: 'Azure', note: 'Closer to the greys it sits on.' },
  { id: 'teal', label: 'Teal', note: 'The one that stops reading as blue.' },
  { id: 'ember', label: 'Ember', note: 'Warm, and the hardest to keep legible.' },
  { id: 'rose', label: 'Rose', note: 'Red without going to alarm red.' },
]

export const isAccent = (value: string | null): value is string =>
  value !== null && accents.some((a) => a.id === value)
