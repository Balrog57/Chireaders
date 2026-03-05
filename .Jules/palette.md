## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-10-18 - Dynamic Accessibility Labels
**Learning:** Toggle buttons (like Theme or Sort Order) need dynamic `accessibilityLabel` props that reflect the *action* (e.g., "Activer le thème sombre") rather than the *current state*, or explicit `accessibilityState` and a static label.
**Action:** Use helper functions or ternary operators to switch labels based on state.
## 2026-03-05 - Accessibility contexts for complex list items
**Learning:** Complex touchable list items (like History cards) need explicit `accessibilityRole="button"` and a comprehensive `accessibilityLabel` that aggregates the content, otherwise screen readers just read the internal text sequentially without context.
**Action:** Always add explicit accessibility roles and summary labels to complex Touchables acting as navigation items.
