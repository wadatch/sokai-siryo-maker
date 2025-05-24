import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { initGoogleAnalytics } from './config/analytics'

// Google Analyticsの初期化
initGoogleAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
