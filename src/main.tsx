import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { initGoogleAnalytics, initGoogleSearchConsole } from './config/analytics'

// Google Analyticsの初期化
initGoogleAnalytics()

// Google Search Consoleの初期化
initGoogleSearchConsole()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
