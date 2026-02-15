## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2024-10-18 - Accordion Accessibility State
**Learning:** React Native's mapped views (accordions) often lack state announcements (expanded/collapsed), confusing screen reader users about content visibility.
**Action:** Always add `accessibilityState={{ expanded: boolean }}` and `accessibilityHint` to accordion headers.
