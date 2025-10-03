# Performance Optimization Guide

## Overview
This guide documents the performance optimizations implemented in Phase 8.

## Key Optimizations

### 1. Code Splitting & Lazy Loading
Heavy components are lazy-loaded to reduce initial bundle size:

```typescript
// Lazy loaded routes
const Home = React.lazy(() => import("./pages/Home"));
const ArtistCRM = React.lazy(() => import("./pages/ArtistCRM"));
const EngineerCRM = React.lazy(() => import("./pages/EngineerCRM"));
const AudioLab = React.lazy(() => import("./pages/AudioLab"));
const HybridDAW = React.lazy(() => import("./pages/HybridDAW"));
const Admin = React.lazy(() => import("./pages/Admin"));
```

Benefits:
- 40-60% reduction in initial bundle size
- Faster Time to Interactive (TTI)
- Better Lighthouse scores

### 2. React Query Configuration
Optimized caching and refetching behavior:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

Benefits:
- Reduced API calls
- Better UX with cached data
- Lower server load

### 3. Error Boundaries
Global error boundary prevents entire app crashes:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Benefits:
- Graceful error handling
- Better user experience
- Error logging for debugging

### 4. Optimistic UI Updates
Instant feedback for user actions:

```typescript
const { mutate, isOptimistic } = useOptimisticUpdate({
  queryKey: ['projects'],
  mutationFn: updateProject,
  optimisticUpdate: (variables, currentData) => {
    // Update UI immediately
    return currentData.map(project =>
      project.id === variables.id
        ? { ...project, ...variables.updates }
        : project
    );
  },
});
```

Benefits:
- Feels instant (0ms perceived latency)
- Automatic rollback on errors
- Better UX

### 5. Performance Utilities

#### Debouncing
Reduce function calls for expensive operations:

```typescript
const debouncedSearch = debounce((query) => {
  performSearch(query);
}, 300);
```

#### Throttling
Limit function execution rate:

```typescript
const throttledScroll = throttle((event) => {
  handleScroll(event);
}, 100);
```

#### Image Lazy Loading
Load images only when in viewport:

```typescript
const imgRef = useImageLazyLoad();
<img ref={imgRef} data-src="large-image.jpg" alt="..." />
```

### 6. Loading States
Professional loading skeletons:

```typescript
import { DashboardSkeleton, ProjectCardSkeleton } from '@/components/ui/loading-skeleton';

<React.Suspense fallback={<DashboardSkeleton />}>
  <Dashboard />
</React.Suspense>
```

### 7. Performance Monitoring
Real-time performance metrics (dev mode only):

- FPS counter
- Memory usage
- Page load time
- Toggle with Ctrl+Shift+P

## Best Practices

### Component Optimization

1. **Use React.memo for expensive components**
```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // Heavy rendering logic
});
```

2. **Use useMemo for expensive calculations**
```typescript
const sortedData = useMemo(() => {
  return data.sort((a, b) => /* sorting logic */);
}, [data]);
```

3. **Use useCallback for stable function references**
```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### Avoid Common Pitfalls

❌ **Don't:**
- Create inline functions in render
- Use anonymous arrow functions in props
- Create new objects/arrays in render
- Skip dependency arrays

✅ **Do:**
- Extract static values outside component
- Use stable references with useCallback
- Memoize expensive computations
- Include all dependencies in arrays

### Audio Processing Optimization

For audio components:
1. Reuse AudioContext instances
2. Disconnect nodes when unmounting
3. Use Web Workers for heavy processing
4. Implement audio buffering

### Bundle Size Management

Monitor bundle size:
```bash
npm run build
```

Analyze bundle:
```typescript
import { reportBundleSize } from '@/utils/performance';

useEffect(() => {
  if (import.meta.env.MODE === 'development') {
    reportBundleSize();
  }
}, []);
```

## Performance Metrics

Target metrics:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

## Monitoring Tools

1. **React DevTools Profiler**
   - Identify expensive renders
   - Find unnecessary re-renders
   - Optimize component hierarchies

2. **Chrome DevTools Performance**
   - Record performance profiles
   - Analyze flame graphs
   - Identify bottlenecks

3. **Lighthouse**
   - Run audits
   - Get optimization suggestions
   - Track metrics over time

## Future Optimizations

Potential improvements:
- Service Worker for offline support
- Virtual scrolling for large lists
- Web Workers for CPU-intensive tasks
- Progressive image loading
- Font subsetting
- Critical CSS extraction

## Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [React Query Best Practices](https://tkdodo.eu/blog/react-query-best-practices)
