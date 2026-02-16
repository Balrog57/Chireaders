## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-02-02 - Custom Radio Group Accessibility
**Learning:** React Native lacks a built-in `RadioGroup` component. To make custom radio selections accessible, use `accessibilityRole="radio"` and `accessibilityState={{ selected: boolean }}` on the touchable elements.
**Action:** Apply this pattern to all custom selection groups (like theme pickers) to ensure screen readers announce the selection state correctly.
