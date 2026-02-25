## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-10-18 - Dynamic Accessibility Labels
**Learning:** Toggle buttons (like Theme or Sort Order) need dynamic `accessibilityLabel` props that reflect the *action* (e.g., "Activer le thème sombre") rather than the *current state*, or explicit `accessibilityState` and a static label.
**Action:** Use helper functions or ternary operators to switch labels based on state.

## 2026-10-23 - Radio Group Accessibility
**Learning:** Theme selectors and similar multi-option settings are more accessible when wrapped in a container with `accessibilityRole="radiogroup"` and each option marked as `accessibilityRole="radio"`. This informs screen reader users about the relationship and the selection behavior (one of many).
**Action:** Use radiogroup/radio roles for mutually exclusive option sets instead of generic buttons.
