## 2025-06-03 - [Race Condition in AsyncStorage Background Tasks]
**Vulnerability:** A "Check-Then-Act" race condition was found in `BackgroundNotificationTask.js`. The task read data from `AsyncStorage`, performed long-running network operations, and then overwrote the storage with the stale initial data plus updates. This caused user changes (e.g., deleting a favorite) made during the task execution to be lost.
**Learning:** Background tasks in React Native headless JS operate independently of the UI state and contexts. Direct `AsyncStorage` usage without re-validation is dangerous for data integrity when user interaction is possible concurrently.
**Prevention:** Always implement a "Fetch-Merge-Save" strategy for background tasks: collect updates first, then re-read the storage source of truth immediately before saving, merging the updates into the fresh state.

## 2024-03-09 - [Missing WebView Message Origin Validation]
**Vulnerability:** The WebView in `BrowserScreen.js` processed messages from injected JavaScript without validating the origin URL (`event.nativeEvent.url`), allowing potential XSS/injection from untrusted domains.
**Learning:** Trusting WebView messages blindly exposes the native application to attacks if the user navigates to external malicious sites.
**Prevention:** Always validate `event.nativeEvent.url` against an allowed list of domains (e.g., using `isValidChiReadsUrl`) inside the `onMessage` handler before processing the data.
## 2024-05-30 - Prevent URI Scheme Injection via Linking.openURL
**Vulnerability:** React Native's `Linking.openURL(url)` unconditionally passes intercepted WebView URLs to the system. Without validating the protocol/scheme (e.g., ensuring it's `http://` or `https://`), a malicious page within the WebView can redirect to `intent://`, `tel:`, or other dangerous URI schemes, triggering arbitrary system actions.
**Learning:** Intercepting navigation to protect a WebView (`onShouldStartLoadWithRequest`) can inadvertently introduce scheme injection if the untrusted URL is automatically forwarded to the OS via `Linking`.
**Prevention:** Always validate that the URI scheme strictly begins with `http://` or `https://` before offloading intercepted URLs to the system browser via `Linking.openURL()`.
