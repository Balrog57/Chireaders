## 2025-06-03 - [Race Condition in AsyncStorage Background Tasks]
**Vulnerability:** A "Check-Then-Act" race condition was found in `BackgroundNotificationTask.js`. The task read data from `AsyncStorage`, performed long-running network operations, and then overwrote the storage with the stale initial data plus updates. This caused user changes (e.g., deleting a favorite) made during the task execution to be lost.
**Learning:** Background tasks in React Native headless JS operate independently of the UI state and contexts. Direct `AsyncStorage` usage without re-validation is dangerous for data integrity when user interaction is possible concurrently.
**Prevention:** Always implement a "Fetch-Merge-Save" strategy for background tasks: collect updates first, then re-read the storage source of truth immediately before saving, merging the updates into the fresh state.

## 2024-03-09 - [Missing WebView Message Origin Validation]
**Vulnerability:** The WebView in `BrowserScreen.js` processed messages from injected JavaScript without validating the origin URL (`event.nativeEvent.url`), allowing potential XSS/injection from untrusted domains.
**Learning:** Trusting WebView messages blindly exposes the native application to attacks if the user navigates to external malicious sites.
**Prevention:** Always validate `event.nativeEvent.url` against an allowed list of domains (e.g., using `isValidChiReadsUrl`) inside the `onMessage` handler before processing the data.

## 2026-03-25 - [Intent Injection in React Native WebView]
**Vulnerability:** The `<WebView>` in `BrowserScreen.js` did not implement the `onShouldStartLoadWithRequest` hook, allowing navigation to any URI scheme (e.g., `intent://`, `javascript:`, `file://`). This exposed the app to Intent Injection and other scheme-based attacks if a malicious link was clicked or auto-redirected within the WebView.
**Learning:** React Native WebViews act as full embedded browsers. Without explicitly filtering allowed navigation schemes, they will attempt to handle system-level URIs, potentially executing unwanted intents on Android or arbitrary code.
**Prevention:** Always implement `onShouldStartLoadWithRequest` on `<WebView>` components to act as a strict whitelist, specifically allowing only safe protocols like `http://`, `https://`, `about:blank`, and `data:`, and blocking all others.
