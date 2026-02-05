/**
 * 应用入口文件
 * @module main
 * @author Xander Lab Team
 * @created 2026-02-05
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@styles/index.css'
import '@locales'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
