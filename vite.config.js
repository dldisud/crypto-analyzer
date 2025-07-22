import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // vite config
    base: './',
    define: {
      // This makes the environment variable available in the renderer process
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    },
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
  };
});