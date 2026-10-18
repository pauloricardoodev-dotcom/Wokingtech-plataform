import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HomePage from './components/HomePage.jsx'
import './index.css'

// Ponto de entrada da página inicial (index.html).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
)
