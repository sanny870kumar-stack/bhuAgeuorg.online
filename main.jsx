import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BHUPortal from './BHUPortal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BHUPortal />
  </StrictMode>,
)
