## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-10-18 - Dynamic Accessibility Labels
**Learning:** Toggle buttons (like Theme or Sort Order) need dynamic `accessibilityLabel` props that reflect the *action* (e.g., "Activer le thème sombre") rather than the *current state*, or explicit `accessibilityState` and a static label.
**Action:** Use helper functions or ternary operators to switch labels based on state.
