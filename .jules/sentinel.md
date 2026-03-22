## 2025-06-03 - [Race Condition in AsyncStorage Background Tasks]
**Vulnerability:** A "Check-Then-Act" race condition was found in `BackgroundNotificationTask.js`. The task read data from `AsyncStorage`, performed long-running network operations, and then overwrote the storage with the stale initial data plus updates. This caused user changes (e.g., deleting a favorite) made during the task execution to be lost.
**Learning:** Background tasks in React Native headless JS operate independently of the UI state and contexts. Direct `AsyncStorage` usage without re-validation is dangerous for data integrity when user interaction is possible concurrently.
**Prevention:** Always implement a "Fetch-Merge-Save" strategy for background tasks: collect updates first, then re-read the storage source of truth immediately before saving, merging the updates into the fresh state.

## 2024-03-09 - [Missing WebView Message Origin Validation]
**Vulnerability:** The WebView in `BrowserScreen.js` processed messages from injected JavaScript without validating the origin URL (`event.nativeEvent.url`), allowing potential XSS/injection from untrusted domains.
**Learning:** Trusting WebView messages blindly exposes the native application to attacks if the user navigates to external malicious sites.
**Prevention:** Always validate `event.nativeEvent.url` against an allowed list of domains (e.g., using `isValidChiReadsUrl`) inside the `onMessage` handler before processing the data.

## 2025-06-03 - [URI Scheme and Intent Injection in WebViews]
**Vulnerability:** The WebView component in `BrowserScreen.js` did not explicitly restrict navigation, which could lead to Intent Injection attacks via malicious URI schemes like `intent://`, `javascript:`, or opening insecure unvalidated external links inside the WebView.
**Learning:** React Native WebViews act as full browsers and will happily process arbitrary custom URI schemes or execute inline Javascript payloads if not explicitly prevented. This can expose sensitive app-level interfaces.
**Prevention:** Always implement `onShouldStartLoadWithRequest` on WebViews. Validate against an explicit whitelist of trusted schemes (`http/https` and internal schemes like `about:blank` or `data:`). Explicitly allow standard safe HTTP URLs to load inside the WebView, and explicitly block anything unknown.
