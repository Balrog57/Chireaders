# Bolt's Journal

## 2025-02-18 - Efficient NPM Install
**Learning:** `npm install --ignore-scripts --no-audit --prefer-offline` is significantly faster (31s) and avoids timeouts compared to standard `npm install` in this environment.
**Action:** Use this command flag combination when installing dependencies is necessary for linting or testing.
