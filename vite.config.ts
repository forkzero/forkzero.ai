import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // scripts/prerender.ts reads the manifest to add per-route modulepreload
    // links, then deletes it so it is not deployed.
    manifest: true,
  },
})
