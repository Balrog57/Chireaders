## 2025-06-03 - [Race Condition in AsyncStorage Background Tasks]
**Vulnerability:** A "Check-Then-Act" race condition was found in `BackgroundNotificationTask.js`. The task read data from `AsyncStorage`, performed long-running network operations, and then overwrote the storage with the stale initial data plus updates. This caused user changes (e.g., deleting a favorite) made during the task execution to be lost.
**Learning:** Background tasks in React Native headless JS operate independently of the UI state and contexts. Direct `AsyncStorage` usage without re-validation is dangerous for data integrity when user interaction is possible concurrently.
**Prevention:** Always implement a "Fetch-Merge-Save" strategy for background tasks: collect updates first, then re-read the storage source of truth immediately before saving, merging the updates into the fresh state.

## 2025-06-03 - [WebView Message Handler Injection Vulnerability]
**Vulnerability:** A missing origin validation in `BrowserScreen.js` `handleMessage` allowed any webpage loaded in the WebView (e.g., via a malicious redirect) to post arbitrary JSON messages to the React Native app. If message handlers evolve to trigger sensitive operations, this becomes a critical vector for XSS-style privilege escalation.
**Learning:** WebView `onMessage` handlers implicitly trust the content inside the WebView unless explicitly verified. Just like `postMessage` in web development, the receiver must validate the sender's origin.
**Prevention:** Always validate `event.nativeEvent.url` against a strict whitelist (e.g., `isValidChiReadsUrl`) at the very beginning of the message handler before parsing or processing the payload.
