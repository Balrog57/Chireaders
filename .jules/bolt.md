## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2026-03-07 - Pre-computing Normalized Strings for FlatList Filters
**Learning:** Performing expensive string manipulations like `.normalize("NFD")` and regex replacements inside a `.filter()` iteration blocks the JS thread, especially when running on thousands of items (like a library catalog) for every keystroke.
**Action:** When filtering or searching large lists, pre-compute and store the normalized search strings on the data objects during the initial data fetch or cache loading phase. This reduces the time complexity of the search from O(N * M) string operations to an O(N) simple string `.includes()` check.
