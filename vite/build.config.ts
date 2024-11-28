import type { BuildOptions } from 'vite';

export const buildConfig: BuildOptions = {
  chunkSizeWarningLimit: 2000,
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  },
  rollupOptions: {
    output: {
      manualChunks(id) {
        // Group Lucide icons together
        if (id.includes('lucide-react')) {
          return 'icons';
        }
        // Group main dependencies
        if (id.includes('react')) {
          return 'vendor';
        }
        if (id.includes('recharts')) {
          return 'charts';
        }
        if (id.includes('firebase')) {
          return 'firebase';
        }
        if (id.includes('javascript-lp-solver')) {
          return 'solver';
        }
      }
    }
  }
};