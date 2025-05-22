import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Asegúrate de que el nombre del repositorio aquí coincida EXACTAMENTE
  // con el nombre de tu repositorio en GitHub.
  base: '/valora-producto-app/',
});