## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2025-05-27 - Render Loop Bucketing Performance
**Learning:** `NovelDetailScreen` used an O(N*Buckets) filtering operation inside the render loop (IIFE) to group chapters. With 2000+ chapters, this caused significant frame drops (~50ms computation) on every re-render (e.g., toggling read status).
**Action:** Always extract heavy data transformation logic (grouping, sorting, filtering) into `useMemo`. For bucketing/grouping, use a single-pass O(N) algorithm with a Map or Index lookup instead of repeated `filter` calls.
