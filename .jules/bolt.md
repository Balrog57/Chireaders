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

## 2026-03-08 - Use Set/Map over context helper functions for large list rendering
**Learning:** Using context helper functions that internally run `Array.some()` or `Array.find()` (e.g. `isChapterRead`) inside a `FlatList` `renderItem` or a `.map()` iteration over hundreds of items creates hidden O(N*M) bottlenecks. The context function is re-evaluated for every item on every render, severely degrading scrolling performance and interaction responsiveness.
**Action:** Avoid calling O(N) lookup functions within loops or render functions. Instead, pre-calculate a `Set` or `Map` outside the loop using `useMemo` and perform an O(1) `.has()` or `.get()` check during rendering.
