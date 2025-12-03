// vite.config.js
/**
 * Vite configuration
 *
 * Default minimal config for React (plugin-react).
 * If you deploy to Netlify/AWS, set VITE_API_URL in environment and/or use a Vite proxy for dev.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
