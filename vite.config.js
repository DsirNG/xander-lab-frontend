import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@config': path.resolve(__dirname, './src/config'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@api': path.resolve(__dirname, './src/api'),
      '@locales': path.resolve(__dirname, './src/locales'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@router': path.resolve(__dirname, './src/router'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@babel/standalone')) return 'vendor-compiler';
            if (id.includes('react-syntax-highlighter')) return 'vendor-highlight';
            if (id.includes('react-markdown') || id.includes('remark-gfm')) return 'vendor-markdown';
            if (id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('react-i18next') || id.includes('i18next')) return 'vendor-react';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('axios')) return 'vendor-http';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://xander-lab.dsircity.top',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
