## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2025-05-27 - Pre-computing Normalized Search Strings
**Learning:** For searching/filtering large lists in React Native (e.g., thousands of items in a LibraryScreen), performing expensive operations like `normalizeText` (which involves `normalize("NFD")` and regex replacements) inside a `.filter()` loop on every keystroke causes significant JS thread blocking (~700ms+ for 5000 items).
**Action:** Always pre-compute and store normalized search strings on the data objects during initial load/cache population. This shifts the O(N) cost to load time and allows the `.filter()` function to simply access the property, speeding up searches by an order of magnitude and preventing UI freezes during typing.
