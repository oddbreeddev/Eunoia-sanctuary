import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Prevents "process is not defined" error in some third-party libs
      'process.env': {},
      // Inject the specific API key
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});