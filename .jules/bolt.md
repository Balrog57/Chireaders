## 2025-05-27 - Playwright Mocking for Axios & CORS
**Learning:** When verifying React Native Web apps that use `axios` to fetch data from external APIs (like `ChiReadsScraper`), standard Playwright request interception might fail due to CORS preflight (OPTIONS) checks initiated by the browser. `axios` is strict about headers.
**Action:** When mocking API responses in Playwright for such apps:
1. Mock the `OPTIONS` method explicitly to return 204.
2. Launch the browser with `--disable-web-security` args.
3. Ensure mock responses include `Access-Control-Allow-Origin: *` and other CORS headers.

## 2025-05-27 - FlatList Render Function Optimization
**Learning:** In React Native, passing unmemoized render functions (like `renderItem` or `renderFooter`) to `FlatList` components inside a screen component that renders frequently (such as `LibraryScreen` having a search input, or context updates in `HistoryScreen`/`FavoritesScreen`) forces those functions to be recreated on every render. This may cause unnecessary view recreation, impacting list scroll and screen performance. Furthermore, passing them pure components without `extraData` dependency can lead to bugs if state changes.
**Action:** When working with `FlatList`:
1. Always wrap `renderItem`, `renderHeader`, and `renderFooter` functions with `useCallback`.
2. Move pure utility functions (like `formatDate`) outside of React component definitions.
3. Explicitly provide `extraData` props when relying on values such as `theme` or `settings.darkMode` to ensure components correctly update upon changing context, while otherwise remaining optimal.
