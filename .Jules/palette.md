## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-02-05 - Disabled State Accessibility
**Learning:** Custom disabled states implemented with `opacity` or styles are invisible to screen readers unless `accessibilityState={{ disabled: true }}` is explicitly set, even if `disabled={true}` is passed to `TouchableOpacity` (React Native handles `disabled` prop well, but explicit state is safer for complex components).
**Action:** Always check `accessibilityState` when implementing disabled styles.
