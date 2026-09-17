// Entry for the fixture harness (`npm run dev`). Never part of the published package — `files` in
// package.json ships only dist/.
//
// One import carries the engine's whole stylesheet contract (src/styles.css → @graphlearning/flow/styles.css
// for a consumer). The harness pulls it from source so it exercises the same file the package ships.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles.css'
import './harness.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
