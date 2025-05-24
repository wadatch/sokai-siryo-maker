import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { initGoogleAnalytics } from './config/analytics'

// Google Search Console メタタグの動的追加
const addGoogleSearchConsoleMeta = () => {
  const searchConsoleCode = import.meta.env.VITE_GOOGLE_SEARCH_CONSOLE_CODE
  if (searchConsoleCode) {
    const meta = document.createElement('meta')
    meta.name = 'google-site-verification'
    meta.content = searchConsoleCode
    document.head.appendChild(meta)
    console.log('Google Search Console meta tag added:', searchConsoleCode)
  }
}

// Google Search Console メタタグを追加
addGoogleSearchConsoleMeta()

// Google Analyticsの初期化
initGoogleAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
