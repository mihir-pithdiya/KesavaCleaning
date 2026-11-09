import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // Exposes the server to your local network (WiFi / Phones / other laptops)
    port: 5173
  }
});
