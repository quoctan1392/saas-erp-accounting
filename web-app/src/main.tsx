import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { CircularProgress, Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// HMR error recovery - auto reconnect when dev server restarts
if (import.meta.hot) {
  // Handle HMR connection errors gracefully
  import.meta.hot.on('vite:error', (payload) => {
    console.warn('[HMR] Error:', payload.err?.message || payload);
  });
  
  import.meta.hot.on('vite:beforeFullReload', () => {
    console.log('[HMR] Full reload triggered');
  });
  
  // Auto-reconnect logic for when dev server restarts
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 50;
  const reconnectInterval = 2000;
  
  const checkServerHealth = async () => {
    try {
      const response = await fetch('/', { method: 'HEAD' });
      if (response.ok) {
        if (reconnectAttempts > 0) {
          console.log('[HMR] Server reconnected, reloading...');
          window.location.reload();
        }
        reconnectAttempts = 0;
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };
  
  import.meta.hot.on('vite:ws:disconnect', () => {
    console.warn('[HMR] WebSocket disconnected, attempting to reconnect...');
    
    const tryReconnect = setInterval(async () => {
      reconnectAttempts++;
      
      if (reconnectAttempts > maxReconnectAttempts) {
        clearInterval(tryReconnect);
        console.error('[HMR] Max reconnect attempts reached');
        return;
      }
      
      const isHealthy = await checkServerHealth();
      if (isHealthy) {
        clearInterval(tryReconnect);
      }
    }, reconnectInterval);
  });
  
  import.meta.hot.on('vite:ws:connect', () => {
    if (reconnectAttempts > 0) {
      console.log('[HMR] WebSocket reconnected');
      reconnectAttempts = 0;
    }
  });
}

// Global loading fallback
const LoadingFallback = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    <CircularProgress sx={{ color: 'white' }} />
  </Box>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
