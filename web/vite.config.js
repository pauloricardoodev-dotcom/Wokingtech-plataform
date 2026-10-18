import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Três páginas: início (index.html), dicionário e gerador
    rollupOptions: {
      input: {
        inicio: 'index.html',
        dicionario: 'dicionario.html',
        gerador: 'gerador.html',
      },
    },
  },
})
