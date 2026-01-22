# API & Loading State Best Practices

## Vấn đề đã được fix

### Root Causes đã xác định:
1. **Vite dev server không chạy** - Process bị kill nhưng không restart
2. **API calls không có timeout** - Requests có thể treo vô thời hạn
3. **Loading states không có failsafe** - UI treo khi API không response
4. **Console.log blocking** - PageLoader có console.log gây chậm
5. **Không có retry limit** - Interceptor có thể retry vô hạn

### Solutions đã implement:

#### 1. Axios Timeout (api.ts)
```typescript
this.coreApi = axios.create({
  baseURL: `${API_CONFIG.CORE_SERVICE_URL}`,
  timeout: 10000, // 10s timeout - prevents hanging
});
```

#### 2. API Utilities (`utils/apiHelpers.ts`)
```typescript
// Wrap promise with timeout
await withTimeout(apiCall(), 10000);

// API call with retry logic
await withRetry(() => apiCall(), { timeout: 10000, retries: 1 });

// Safe API call with fallback
const data = await safeApiCall(() => apiCall(), fallbackValue);

// Loading manager with auto-timeout
const manager = createLoadingManager(15000);
manager.start(setLoading);
// ... do work ...
manager.stop(setLoading);
```

#### 3. React Hooks (`hooks/useApi.ts`)

**useApi Hook** - For fetching data:
```typescript
const { data, loading, error, refetch } = useApi(
  () => apiService.getItems(),
  {
    fallback: [],
    fetchOnMount: true,
    timeout: 10000,
    maxLoadingDuration: 15000,
    onError: (err) => console.error(err),
  }
);
```

**useSafeLoading Hook** - For manual loading control:
```typescript
const { loading, startLoading, stopLoading } = useSafeLoading(12000);

const handleSubmit = async () => {
  startLoading();
  try {
    await withTimeout(apiService.submit(data), 10000);
  } finally {
    stopLoading(); // Always stops, even if error
  }
};
```

## Migration Guide

### Before (OLD - DON'T DO THIS):
```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await apiService.getData(); // NO TIMEOUT!
    setData(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false); // Might never reach if API hangs
  }
};
```

### After (NEW - DO THIS):
```typescript
import { useSafeLoading } from '@/hooks/useApi';
import { withTimeout } from '@/utils/apiHelpers';

const { loading, startLoading, stopLoading } = useSafeLoading();

const loadData = async () => {
  startLoading(); // Auto-stops after 15s if you forget
  try {
    const data = await withTimeout(apiService.getData(), 10000);
    setData(data);
  } catch (err) {
    console.error(err);
  } finally {
    stopLoading(); // Always cleans up
  }
};
```

### Or even better - use useApi hook:
```typescript
const { data, loading, error } = useApi(
  () => apiService.getData(),
  { fallback: [], fetchOnMount: true }
);

// That's it! No manual loading management needed
```

## Rules to Follow

### ✅ DO:
1. **Always use timeout** for API calls
2. **Use `useSafeLoading`** instead of manual `useState` for loading
3. **Use `useApi` hook** for data fetching when possible
4. **Set fallback values** for critical data
5. **Clean up** in useEffect return
6. **Limit retries** to max 1-2 attempts

### ❌ DON'T:
1. **Don't use raw `fetch`** without timeout
2. **Don't use `axios` directly** - use apiService wrapper
3. **Don't manually manage loading** without timeout protection
4. **Don't use `console.log` in render methods**
5. **Don't create infinite retry loops**
6. **Don't trust API will always respond**

## Examples for Common Patterns

### Pattern 1: Load data on screen open
```typescript
const MyScreen = ({ open }) => {
  const { data, loading } = useApi(
    () => apiService.getItems(),
    { 
      fallback: [], 
      fetchOnMount: open, 
      deps: [open] 
    }
  );
  
  return loading ? <Loading /> : <List items={data} />;
};
```

### Pattern 2: Form submission
```typescript
const MyForm = () => {
  const { loading, startLoading, stopLoading } = useSafeLoading();
  
  const handleSubmit = async (values) => {
    startLoading();
    try {
      await withTimeout(apiService.submit(values), 10000);
      showSuccess();
    } catch (err) {
      showError(err.message);
    } finally {
      stopLoading();
    }
  };
  
  return <Button onClick={handleSubmit} disabled={loading} />;
};
```

### Pattern 3: Multiple API calls
```typescript
const loadAll = async () => {
  startLoading();
  try {
    // Parallel calls with timeout
    const [items, categories] = await Promise.all([
      withTimeout(apiService.getItems(), 8000),
      withTimeout(apiService.getCategories(), 8000),
    ]);
    
    setItems(items);
    setCategories(categories);
  } catch (err) {
    // Handle with fallback
    setItems(mockItems);
    setCategories([]);
  } finally {
    stopLoading();
  }
};
```

## Backend Recommendations

### Check core-service logs:
```bash
docker logs --tail 200 erp-core-service | grep -E 'ERROR|warn|slow'
```

### Common backend issues:
1. **Slow queries** - Add indexes, optimize joins
2. **Missing view entities** - Export in entities.ts
3. **N+1 queries** - Use eager loading
4. **Missing timeout** - Set query timeout in TypeORM

### Database optimization:
```typescript
// Add query timeout
@Query(() => [Item])
async getItems() {
  return this.itemRepo.find({
    timeout: 5000, // 5s query timeout
    cache: true,
  });
}
```

## Monitoring

### Watch for these warnings:
- `[LoadingManager] Max loading duration reached` - API timeout
- `[safeApiCall] API call failed` - Network/auth issue  
- `Request timeout after Xms` - API không response
- `Max retry attempts reached` - Auth token issue

### Health checks:
```bash
# Frontend
curl -I http://127.0.0.1:5173

# Backend
curl http://localhost:3003/api/health
docker ps | grep erp
```

## Performance Tips

1. **Lazy load routes** - Already done in App.tsx
2. **Debounce search** - Use `debounce()` from apiHelpers
3. **Cache responses** - Enable axios cache for static data
4. **Optimize re-renders** - Use React.memo for heavy components
5. **Virtual scrolling** - For long lists (>100 items)

## Support

Nếu gặp vấn đề:
1. Check Vite đang chạy: `lsof -i :5173`
2. Check backend logs: `docker logs erp-core-service --tail 50`
3. Check browser console for errors
4. Check Network tab in DevTools
5. Restart services: `pnpm run dev` trong web-app folder
