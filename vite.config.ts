import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match how the site is served.
// GitHub Pages project site -> https://<user>.github.io/Resume/ -> base '/Resume/'
// Custom domain or user site  -> base '/'  (set BASE_PATH=/ in the build)
const base = process.env.BASE_PATH ?? '/Resume/'

export default defineConfig({
  base,
  plugins: [react()],
})
