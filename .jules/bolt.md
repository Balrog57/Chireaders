## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.
