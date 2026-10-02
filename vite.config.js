import {defineConfig} from 'vite';
export default defineConfig({
  root: 'portfolio',
  base: '/',
  server: {host: '127.0.0.1', port: 4181},
  build: {outDir: '../.build', emptyOutDir: true}
});
