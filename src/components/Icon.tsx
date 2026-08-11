import type { SVGProps } from 'react'

export type IconName =
  | 'github'
  | 'linkedin'
  | 'mail'
  | 'link'
  | 'file'
  | 'x'
  | 'sun'
  | 'moon'
  | 'arrow-up-right'
  | 'menu'
  | 'close'
  | 'print'
  | 'droplet'

/**
 * Inline single-path icons. Bundled rather than fetched so the page has no
 * external requests and renders identically offline.
 */
const paths: Record<IconName, string> = {
  github:
    'M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.570 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z',
  linkedin:
    'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05c.53-.95 1.83-1.95 3.77-1.95C21.6 8.7 23 10.9 23 14.3V21h-4v-5.9c0-1.4-.03-3.2-2-3.2-2 0-2.3 1.53-2.3 3.1V21h-4V9Z',
  mail: 'M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Zm2.2.5 6.8 5.1L18.8 6H5.2ZM19 7.9l-6.4 4.8a1 1 0 0 1-1.2 0L5 7.9V18.5c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V7.9Z',
  link: 'M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a3 3 0 1 1 4.2 4.2l-1.6 1.6a1 1 0 0 1-1.4-1.4l1.6-1.6a1 1 0 1 0-1.4-1.4L12 13.4a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3.5 3.5a3 3 0 1 1-4.2-4.2l1.6-1.6a1 1 0 0 1 1.4 1.4l-1.6 1.6a1 1 0 1 0 1.4 1.4L12 10.6a1 1 0 0 1 1.4 0Z',
  file: 'M6 2h7.6L20 8.4V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.9V9h5.1L13 3.9ZM8 13h8v-2H8v2Zm0 4h8v-2H8v2Z',
  x: 'M18.9 2H22l-7 8.1L23.3 22h-6.4l-5-6.6L6 22H2.8l7.5-8.6L2 2h6.6l4.5 6 5.8-6Zm-1.1 18h1.8L7.3 3.8H5.4L17.8 20Z',
  sun: 'M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-1-13h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.2 5.6l1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1Zm12.1 12.1 1.4-1.4 2.1 2.1-1.4 1.4-2.1-2.1Zm2.1-13.5 1.4 1.4-2.1 2.1-1.4-1.4 2.1-2.1ZM5.6 19.8l-1.4-1.4 2.1-2.1 1.4 1.4-2.1 2.1Z',
  moon: 'M12.3 2a1 1 0 0 1 .3 1.5A7 7 0 0 0 20.5 14a1 1 0 0 1 1.3 1.3A9 9 0 1 1 11 2.2a1 1 0 0 1 1.3-.2ZM10 4.6a7 7 0 1 0 9 9A9 9 0 0 1 10 4.6Z',
  'arrow-up-right': 'M8 6h10v10h-2V9.4L7.4 18 6 16.6 14.6 8H8V6Z',
  menu: 'M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z',
  close:
    'M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z',
  print:
    'M7 3h10v4H7V3ZM5 8h14a2 2 0 0 1 2 2v6h-4v5H7v-5H3v-6a2 2 0 0 1 2-2Zm4 8v3h6v-3H9Zm8-4.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  // A droplet, for the accent picker: the one control that changes hue.
  droplet:
    'M12 2.2c.35 0 .68.18.86.48l4.1 6.7a8.2 8.2 0 0 1 1.29 4.35A6.25 6.25 0 0 1 12 20a6.25 6.25 0 0 1-6.25-6.27c0-1.53.45-3.03 1.29-4.35l4.1-6.7c.18-.3.51-.48.86-.48Zm0 3-3.25 5.3a6.2 6.2 0 0 0-1 3.23A4.25 4.25 0 0 0 12 18a4.25 4.25 0 0 0 4.25-4.27 6.2 6.2 0 0 0-1-3.23L12 5.2Z'
}

type Props = SVGProps<SVGSVGElement> & {
  name: IconName
  /** Rendered at 1em by default so icons scale with their surrounding text. */
  size?: number | string
}

export function Icon({ name, size = '1em', ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  )
}
