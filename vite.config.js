import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      REACT_APP_API_URL: JSON.stringify(process.env.REACT_APP_API_URL),
      REACT_APP_RAZORPAY_KEY_ID: JSON.stringify(process.env.REACT_APP_RAZORPAY_KEY_ID),
    },
  },
  base: './', // Important for static builds
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Add this for client-side routing
  server: { 
    proxy: {
      '/api': {
        target: 'https://pocketmentor-backend.onrender.com',
        changeOrigin: true,
      },
    },
    historyApiFallback: true,
  }
});