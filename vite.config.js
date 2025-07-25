import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // required to expose server to the outside (Windows browser)
    port: 5173,
    strictPort: true,
    open: false
  }
});
