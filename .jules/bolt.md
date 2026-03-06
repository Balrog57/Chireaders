## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2026-03-06 - Pre-compute Search Strings in React Native
**Learning:** In screens displaying thousands of items (like `LibraryScreen`), running expensive string manipulation functions (like NFD normalization and regex replacements) inside a `.filter()` loop on every keystroke blocks the JS thread, causing severe input lag.
**Action:** Always pre-compute and store normalized search strings on the data objects during initial load or cache generation. This turns an O(N * string ops) operation into O(N * array lookup), making search filtering fast and responsive.
