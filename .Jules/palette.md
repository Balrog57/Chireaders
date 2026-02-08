## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-02-04 - Dynamic Accessibility Labels for Toggle Buttons
**Learning:** Icon-only toggle buttons (like favorites) need dynamic `accessibilityLabel` based on state ("Ajouter..." vs "Retirer...") to provide clear context to screen readers, rather than a static label.
**Action:** Use conditional logic for `accessibilityLabel` and `accessibilityState` on toggle components.
