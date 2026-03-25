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

## 2026-03-25 - Context Provider Memoization for Large Datasets
**Learning:** Context providers supplying large computed datasets (like history data in StorageContext) must memoize the resulting data using `useMemo` instead of wrapping the computation in a `useCallback` function. This prevents severe performance degradation caused by re-computing the data on every consumer render.
**Action:** Always use `useMemo` to export computed derived states from a context instead of a `useCallback` generating function.

## 2026-03-25 - Lazy Evaluation for Context Provider Derived State
**Learning:** Context providers supplying large computed datasets should not eagerly compute them with `useMemo` in the provider, as this changes lazy evaluation to eager evaluation and forces a heavy O(N+M) computation on every state update, causing global UI stuttering.
**Action:** Instead, keep the provider computation lazy (e.g., using `useCallback`) and memoize the result locally within the specific consumer component using `useMemo(() => getDataset(), [getDataset])`.
