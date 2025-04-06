// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' // Make sure import name is correct

export default defineConfig({
  plugins: [
    react(),
    // Pass config path explicitly
    tailwindcss()
  ],
})