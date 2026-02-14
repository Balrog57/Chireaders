## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-02-02 - Multi-State Button Accessibility Hints
**Learning:** Theme toggle buttons cycle through states (Light -> Dark -> Sepia). Simple labels like 'Theme' are insufficient.
**Action:** Use `accessibilityHint` to explain the behavior (e.g., 'Cycles through Light, Dark, Sepia modes').
