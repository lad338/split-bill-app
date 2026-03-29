/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/split-bill-app/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
