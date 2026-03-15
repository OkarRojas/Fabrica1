import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/Fabrica1/' : '/',  // Dev: /   Prod: /Fabrica1/
}))
