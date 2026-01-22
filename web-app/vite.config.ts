import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load environment variables prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  // Use 127.0.0.1 for stability (avoids DNS resolution issues with localhost)
  const host = env.VITE_HOST || '127.0.0.1'
  const port = Number(env.VITE_PORT) || 5173
  // Allow explicit open URL (recommended to use http://127.0.0.1:5173 to avoid localhost DNS issues)
  const openUrl = env.VITE_OPEN_URL || (env.VITE_OPEN === 'true' ? `http://127.0.0.1:${port}` : false)

  return {
    plugins: [react()],
    server: {
      host,
      port,
      // when false Vite will try the next available port; when true it will fail if port is taken
      strictPort: false,
      // either false or a URL string to open in the browser
      open: openUrl || false,
      cors: true,
      // HMR configuration for stability
      hmr: {
        // Use same host as server
        host: '127.0.0.1',
        port,
        // Timeout for HMR connection (ms)
        timeout: 30000,
        // Overlay for errors - helps debug
        overlay: true,
        // Client port must match server port
        clientPort: port,
      },
      // Watch configuration
      watch: {
        // Use polling for more reliable file watching (useful in some environments)
        usePolling: false,
        // Ignore large folders to reduce CPU usage
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      },
    },
    // Optimize deps for faster startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],
      // Force optimization to prevent runtime issues
      force: false,
    },
    // Build optimizations
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
          },
        },
      },
    },
    // Clear console on HMR update (optional, cleaner dev experience)
    clearScreen: false,
  }
})
