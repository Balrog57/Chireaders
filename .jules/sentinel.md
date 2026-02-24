## 2024-05-23 - [Integrity] Fix Race Condition in Background Task
**Vulnerability:** User favorites could be lost if modified during a background scrape.
**Learning:** Background tasks reading data at start and writing at end overwrite intervening user changes.
**Prevention:** Use Fetch-Merge-Save pattern: collect updates, re-fetch fresh state, merge updates, then save.
