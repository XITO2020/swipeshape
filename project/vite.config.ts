import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    cors: true,
    proxy: {
      '/rest/v1': {
        target: 'https://frxwknvoilgnmjnmtuzi.supabase.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/rest\/v1/, '/rest/v1'),
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHdrbnZvaWxnbm1qbm10dXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTA3ODAsImV4cCI6MjA1NjY2Njc4MH0.u5NvhJsMn7z3VmCIZ9wmyrsoB9N_8Fx6HRuy0XZmVoQ',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeHdrbnZvaWxnbm1qbm10dXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwOTA3ODAsImV4cCI6MjA1NjY2Njc4MH0.u5NvhJsMn7z3VmCIZ9wmyrsoB9N_8Fx6HRuy0XZmVoQ'
        }
      }
    }
  }
});
