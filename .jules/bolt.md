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

## 2025-05-27 - Optimize List Rendering
**Learning:** For large lists (e.g., thousands of items), not wrapping the `renderItem` function of `FlatList` in `useCallback` causes the function to be re-created on every render cycle, leading to unnecessary and expensive re-renders of the list items.
**Action:** Always wrap the `renderItem` function and its internal event handlers in `useCallback` to maintain referential equality across render cycles, preventing unnecessary list re-renders.
