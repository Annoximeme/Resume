import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { site } from './content/resume'
import './styles/global.css'

// Title and description live in the content file, so index.html never needs
// editing when the resume changes.
document.title = site.title
document
  .querySelector('meta[name="description"]')
  ?.setAttribute('content', site.description)

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found in index.html')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
