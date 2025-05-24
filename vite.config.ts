import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          googleSearchConsoleCode: process.env.VITE_GOOGLE_SEARCH_CONSOLE_CODE || '',
          gaId: process.env.VITE_GA_MEASUREMENT_ID || '',
        },
      },
    }),
  ],
  base: '/sokai-siryo-maker/',
})
