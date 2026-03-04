## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2025-05-27 - Precomputing normalized text for list filtering
**Learning:** In React Native applications rendering large lists (like `LibraryScreen`), performing expensive string manipulation inside a `.filter` method on every keystroke can cause noticeable input lag and block the JS thread. The app previously ran `.normalize("NFD").replace(/.../g, "").toLowerCase()` on every item's title during every search render.
**Action:** When fetching or caching data for lists that will be searched locally, pre-compute the normalized search string (e.g., `normalizedTitle`) once and store it on the object. The `filter` method can then simply run `.includes()` on the pre-computed string, speeding up the search significantly.
