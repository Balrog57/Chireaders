## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.
## 2025-05-27 - Optimize History Generation
**Learning:** In `StorageContext.js`, the `getAllHistory` method had a performance bottleneck. It performed an O(N) lookup (`favorites.find`) inside a nested loop, resulting in O(N*M) time complexity, where N is total chapters read and M is total favorites.
**Action:** When calculating derived state across multiple large arrays (like history and favorites), always pre-build a `Map` or object for O(1) lookups. This reduces time complexity from O(N*M) to O(N+M) and is especially critical in React Native contexts where UI thread performance is paramount.
