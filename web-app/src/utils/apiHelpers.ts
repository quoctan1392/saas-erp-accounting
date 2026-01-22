/**
 * API utility helpers with built-in timeout and error handling
 * Use these helpers to prevent hanging API calls across the entire app
 */

export interface ApiOptions {
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
}

/**
 * Wraps a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 10000ms)
 * @returns Promise that rejects if timeout is reached
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Wraps an async function with timeout and retry logic
 * @param fn - The async function to execute
 * @param options - Configuration options
 * @returns Promise with timeout and retry handling
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: ApiOptions = {}
): Promise<T> {
  const { timeout = 10000, retries = 1, onError } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await withTimeout(fn(), timeout);
      return result;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
        continue;
      }
      
      // Last attempt failed
      if (onError) {
        onError(lastError);
      }
      throw lastError;
    }
  }

  throw lastError!;
}

/**
 * Safe API caller that handles timeout and provides fallback
 * @param apiCall - The API function to call
 * @param fallback - Fallback value if API fails
 * @param options - Configuration options
 * @returns Promise that resolves to API result or fallback
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T,
  options: ApiOptions = {}
): Promise<T> {
  try {
    return await withRetry(apiCall, options);
  } catch (error) {
    console.warn('[safeApiCall] API call failed, using fallback:', error);
    return fallback;
  }
}

/**
 * Creates a loading state manager with automatic timeout
 * Use this to prevent loading states from hanging indefinitely
 */
export function createLoadingManager(maxDurationMs: number = 15000) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return {
    start: (setLoading: (loading: boolean) => void) => {
      setLoading(true);
      
      // Force loading to false after max duration
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.warn('[LoadingManager] Max loading duration reached, forcing loading=false');
        setLoading(false);
        timeoutId = null;
      }, maxDurationMs);
    },
    
    stop: (setLoading: (loading: boolean) => void) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      setLoading(false);
    },
    
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  };
}

/**
 * Debounces API calls to prevent excessive requests
 * @param fn - The function to debounce
 * @param delayMs - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}
