## 2025-06-03 - [Race Condition in AsyncStorage Background Tasks]
**Vulnerability:** A "Check-Then-Act" race condition was found in `BackgroundNotificationTask.js`. The task read data from `AsyncStorage`, performed long-running network operations, and then overwrote the storage with the stale initial data plus updates. This caused user changes (e.g., deleting a favorite) made during the task execution to be lost.
**Learning:** Background tasks in React Native headless JS operate independently of the UI state and contexts. Direct `AsyncStorage` usage without re-validation is dangerous for data integrity when user interaction is possible concurrently.
**Prevention:** Always implement a "Fetch-Merge-Save" strategy for background tasks: collect updates first, then re-read the storage source of truth immediately before saving, merging the updates into the fresh state.

## 2024-03-09 - [Missing WebView Message Origin Validation]
**Vulnerability:** The WebView in `BrowserScreen.js` processed messages from injected JavaScript without validating the origin URL (`event.nativeEvent.url`), allowing potential XSS/injection from untrusted domains.
**Learning:** Trusting WebView messages blindly exposes the native application to attacks if the user navigates to external malicious sites.
**Prevention:** Always validate `event.nativeEvent.url` against an allowed list of domains (e.g., using `isValidChiReadsUrl`) inside the `onMessage` handler before processing the data.

## 2026-03-28 - [Unrestricted WebView Navigation]
**Vulnerability:** The WebView in `BrowserScreen.js` lacked an `onShouldStartLoadWithRequest` handler, allowing navigation to any protocol. This exposed the application to Intent Injections via malicious schemes like `intent://` or execution of arbitrary code via `javascript:`.
**Learning:** React Native WebViews act as fully capable browsers unless restricted. Without explicit protocol whitelisting, they inherit the risk of handling unsafe custom URL schemes that can interact deeply with the native device OS.
**Prevention:** Always implement `onShouldStartLoadWithRequest` in WebViews serving as general in-app browsers to explicitly allow safe protocols (like `http://` and `https://`) and block all unhandled or dangerous schemes.
