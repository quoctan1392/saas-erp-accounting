import { useState, useEffect, useRef, useCallback } from 'react';
import { withTimeout, createLoadingManager } from '../utils/apiHelpers';

export interface UseApiOptions<T> {
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Maximum loading duration before force-stopping (default: 15000) */
  maxLoadingDuration?: number;
  /** Fallback value if API fails */
  fallback?: T;
  /** Whether to automatically fetch on mount */
  fetchOnMount?: boolean;
  /** Dependencies that trigger re-fetch */
  deps?: unknown[];
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Callback when success */
  onSuccess?: (data: T) => void;
}

/**
 * Safe API hook that prevents hanging loading states
 * Automatically handles timeout, loading states, and cleanup
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useApi(
 *   () => apiService.getItems(),
 *   { fallback: [], fetchOnMount: true }
 * );
 * ```
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    timeout = 10000,
    maxLoadingDuration = 15000,
    fallback,
    fetchOnMount = false,
    deps = [],
    onError,
    onSuccess
  } = options;

  const [data, setData] = useState<T | undefined>(fallback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadingManagerRef = useRef(createLoadingManager(maxLoadingDuration));
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const manager = loadingManagerRef.current;
    
    manager.start(setLoading);
    setError(null);

    try {
      const result = await withTimeout(apiCall(), timeout);
      
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        if (onSuccess) onSuccess(result);
      }
    } catch (err) {
      const error = err as Error;
      
      if (isMountedRef.current) {
        setError(error);
        if (fallback !== undefined) {
          setData(fallback);
        }
        if (onError) onError(error);
      }
      
      console.warn('[useApi] API call failed:', error.message);
    } finally {
      if (isMountedRef.current) {
        manager.stop(setLoading);
      }
      abortControllerRef.current = null;
    }
  }, [apiCall, timeout, fallback, onError, onSuccess]);

  useEffect(() => {
    if (fetchOnMount) {
      execute();
    }
    const manager = loadingManagerRef.current;
    return () => {
      isMountedRef.current = false;
      manager.cleanup();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData
  };
}

/**
 * Hook for managing loading state with automatic timeout
 * Prevents loading state from hanging indefinitely
 * 
 * @example
 * ```tsx
 * const { loading, startLoading, stopLoading } = useSafeLoading();
 * 
 * const handleSubmit = async () => {
 *   startLoading();
 *   try {
 *     await apiCall();
 *   } finally {
 *     stopLoading();
 *   }
 * };
 * ```
 */
export function useSafeLoading(maxDurationMs: number = 15000) {
  const [loading, setLoading] = useState(false);
  const managerRef = useRef(createLoadingManager(maxDurationMs));

  useEffect(() => {
    const manager = managerRef.current;
    return () => {
      manager.cleanup();
    };
  }, []);

  const startLoading = useCallback(() => {
    managerRef.current.start(setLoading);
  }, []);

  const stopLoading = useCallback(() => {
    managerRef.current.stop(setLoading);
  }, []);

  return {
    loading,
    startLoading,
    stopLoading
  };
}
