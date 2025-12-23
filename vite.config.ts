import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    base: '/',
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY || ''),
    },
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            icons: ['lucide-react'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          }
        }
      }
    },
    server: {
      historyApiFallback: true,
      port: 3000
    }
  };
});