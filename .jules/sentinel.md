## 2025-06-03 - [Race Condition in AsyncStorage Background Tasks]
**Vulnerability:** A "Check-Then-Act" race condition was found in `BackgroundNotificationTask.js`. The task read data from `AsyncStorage`, performed long-running network operations, and then overwrote the storage with the stale initial data plus updates. This caused user changes (e.g., deleting a favorite) made during the task execution to be lost.
**Learning:** Background tasks in React Native headless JS operate independently of the UI state and contexts. Direct `AsyncStorage` usage without re-validation is dangerous for data integrity when user interaction is possible concurrently.
**Prevention:** Always implement a "Fetch-Merge-Save" strategy for background tasks: collect updates first, then re-read the storage source of truth immediately before saving, merging the updates into the fresh state.

## 2024-03-09 - [Missing WebView Message Origin Validation]
**Vulnerability:** The WebView in `BrowserScreen.js` processed messages from injected JavaScript without validating the origin URL (`event.nativeEvent.url`), allowing potential XSS/injection from untrusted domains.
**Learning:** Trusting WebView messages blindly exposes the native application to attacks if the user navigates to external malicious sites.
**Prevention:** Always validate `event.nativeEvent.url` against an allowed list of domains (e.g., using `isValidChiReadsUrl`) inside the `onMessage` handler before processing the data.

## 2025-06-03 - [WebView Intent Injection via URI Schemes]
**Vulnerability:** The `WebView` in `BrowserScreen.js` loaded all navigation requests blindly without filtering URI schemes. This exposed the application to Intent Injection attacks, where malicious websites could use `intent://`, `javascript:`, or `file://` URIs to exploit the native environment or execute unauthorized code.
**Learning:** React Native `WebView`s acting as in-app browsers must strictly restrict navigation protocols to safe web standards to prevent escaping the sandbox or interacting with the OS inappropriately.
**Prevention:** Implement `onShouldStartLoadWithRequest` on all `WebView` instances to explicitly allowlist safe protocols (`http://`, `https://`, `about:blank`, `data:`) and block all other schemes (returning `false`).
