## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-03-01 - Accordion State Accessibility
**Learning:** Collapsible accordion headers (like chapter lists) need explicit `accessibilityState={{ expanded: boolean }}` and `accessibilityHint` to correctly inform screen reader users of the content's visibility status and how to interact with it.
**Action:** Add `accessibilityState={{ expanded: isExpanded }}` to all accordion headers.
