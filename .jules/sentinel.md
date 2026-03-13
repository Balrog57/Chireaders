## 2024-03-09 - [Missing WebView Message Origin Validation]
**Vulnerability:** The WebView in `BrowserScreen.js` processed messages from injected JavaScript without validating the origin URL (`event.nativeEvent.url`), allowing potential XSS/injection from untrusted domains.
**Learning:** Trusting WebView messages blindly exposes the native application to attacks if the user navigates to external malicious sites.
**Prevention:** Always validate `event.nativeEvent.url` against an allowed list of domains (e.g., using `isValidChiReadsUrl`) inside the `onMessage` handler before processing the data.

## 2025-06-03 - [Race Condition in AsyncStorage Background Tasks]
**Vulnerability:** A "Check-Then-Act" race condition was found in `BackgroundNotificationTask.js`. The task read data from `AsyncStorage`, performed long-running network operations, and then overwrote the storage with the stale initial data plus updates. This caused user changes (e.g., deleting a favorite) made during the task execution to be lost.
**Learning:** Background tasks in React Native headless JS operate independently of the UI state and contexts. Direct `AsyncStorage` usage without re-validation is dangerous for data integrity when user interaction is possible concurrently.
**Prevention:** Always implement a "Fetch-Merge-Save" strategy for background tasks: collect updates first, then re-read the storage source of truth immediately before saving, merging the updates into the fresh state.

## 2025-06-03 - [Missing WebView Navigation Restriction]
**Vulnerability:** The WebView in `BrowserScreen.js` lacked an `onShouldStartLoadWithRequest` handler, allowing it to navigate to any arbitrary, potentially malicious domain within the app context if a user clicked an external link.
**Learning:** React Native WebViews act as full browsers by default. Without explicit navigation restrictions, they can be used to load untrusted content, potentially executing malicious scripts within the app's WebView context or facilitating phishing attacks.
**Prevention:** Always implement `onShouldStartLoadWithRequest` to restrict WebView navigation to a strictly defined allowlist of trusted domains (e.g., using `isValidChiReadsUrl`). Offload external links securely to the system browser using `Linking.openURL()`.