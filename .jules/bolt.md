## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2025-05-27 - Nested Filter in Render Loop
**Learning:** In `NovelDetailScreen.js`, the chapter grouping logic used a nested `filter` inside a loop over buckets. This resulted in O(N * Buckets) complexity, running on every render. For large lists (e.g., 2000 chapters), this causes noticeable frame drops during interactions like toggling favorites.
**Action:** Always extract complex data transformation logic into `useMemo`. When grouping data, prefer a single-pass O(N) iteration over repeated filtering.
