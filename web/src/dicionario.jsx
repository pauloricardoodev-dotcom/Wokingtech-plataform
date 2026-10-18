import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DictionaryPage from './components/DictionaryPage.jsx'
import './index.css'

// Ponto de entrada da página /dicionario.html (o gerador usa o main.jsx).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DictionaryPage />
  </StrictMode>,
)
