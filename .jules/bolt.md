## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2025-05-27 - Optimize getAllHistory Lookup
**Learning:** O(N*M) lookups within loops (e.g. `favorites.find(f => f.url === seriesUrl)`) severely hurt performance as arrays grow. Array.prototype.find inside another loop should be avoided.
**Action:** Pre-calculate a Map for lookups outside the loop. This reduces complexity from O(N*M) to O(N+M).

## 2026-03-08 - Pre-computing Search Strings for Large Lists
**Learning:** For searching or filtering large lists (e.g., thousands of items), computing string manipulations (like removing accents using NFD normalization and converting to lowercase) inside `.filter()` on every keystroke blocks the JS thread and hurts search responsiveness significantly.
**Action:** Always pre-compute and store normalized search strings directly on data objects (e.g., `_normalizedTitle`) during the initial load, cache saving/restoration, or mapping phase to achieve O(1) attribute access during actual `.filter()` operations.

## 2026-05-10 - Consolidated List and Context Performance
**Learning:** Large React Native lists suffer when search filters run on every keystroke, `FlatList` renders without virtualization constraints, or render loops repeatedly call O(N) context helpers.
**Action:** Debounce local search, set explicit `FlatList` virtualization props, memoize local `Set`/`Map` lookup structures for list renders, expose shared context maps for O(1) access, and keep expensive context-derived datasets lazy so consumers compute them only when needed.
## 2026-05-30 - Optimize FlatList Rendering Performance
**Learning:** React Native's `FlatList` component, when used to render long lists of complex items (like in `HistoryScreen` or `FavoritesScreen`), will attempt to render all items at once and keep them in memory if explicit virtualization constraints are not provided. This blocks the main thread during initial load and consumes significant memory as lists grow.
**Action:** Always provide virtualization properties (`initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews={true}`) to `FlatList` components intended for large datasets to unmount off-screen items and stream renders in batches.
