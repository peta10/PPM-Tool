import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    include: ['lucide-react']
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          
          // Chart libraries (heavy)
          'charts': ['chart.js', 'react-chartjs-2'],
          
          // PDF generation (very heavy)
          'pdf-utils': ['jspdf', 'html2canvas'],
          
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          
          // UI utilities
          'ui-utils': ['lucide-react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          
          // Router
          'router': ['react-router-dom']
        }
      }
    }
  }
});