import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// NOTE: Do NOT put GEMINI_API_KEY here.
// It would get baked into the browser bundle and be publicly readable.
// The key lives only in server.ts, accessed via process.env.GEMINI_API_KEY at runtime.

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
