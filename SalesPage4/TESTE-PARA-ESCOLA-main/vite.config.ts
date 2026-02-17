import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // IMPORTANTE: O Vite substituirá 'process.env.API_KEY' pelo valor real durante o build.
    // Certifique-se de que a variável na Vercel se chama API_KEY.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_API_KEY || '')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@google/genai'],
        },
      },
    },
  },
});