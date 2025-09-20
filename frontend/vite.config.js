import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build' || mode === 'production';

  // Force development mode for dev server
  if (command === 'serve') {
    process.env.NODE_ENV = 'development';
  }

  return {
    mode: isProduction ? 'production' : 'development',
    plugins: [react({
      // Ensure React is properly configured for development/production
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      fastRefresh: !isProduction,
      babel: {
        plugins: isProduction ? [
          ['transform-remove-console', { exclude: ['error', 'warn'] }]
        ] : []
      }
    })],
    base: '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@/features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@/api': fileURLToPath(new URL('./src/api', import.meta.url)),
        '@/hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
        '@/contexts': fileURLToPath(new URL('./src/contexts', import.meta.url)),
        '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@/lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
        '@/config': fileURLToPath(new URL('./src/config', import.meta.url)),
        '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
        '@/data': fileURLToPath(new URL('./src/data', import.meta.url)),
        '@/routes': fileURLToPath(new URL('./src/routes', import.meta.url)),
        '@/layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
        '@/services': fileURLToPath(new URL('./src/services', import.meta.url)),
      },
    },
    server: {
      port: 3001,
      open: true,
      host: true,
      cors: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          },
        },
      },
    },
    preview: {
      port: 4173,
      open: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    define: {
      __DEV__: !isProduction,
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.REACT_APP_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
  };
});
