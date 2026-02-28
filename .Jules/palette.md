## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-10-18 - Dynamic Accessibility Labels
**Learning:** Toggle buttons (like Theme or Sort Order) need dynamic `accessibilityLabel` props that reflect the *action* (e.g., "Activer le thème sombre") rather than the *current state*, or explicit `accessibilityState` and a static label.
**Action:** Use helper functions or ternary operators to switch labels based on state.

## 2026-02-28 - Disabled States for Screen Readers
**Learning:** When a button uses the `disabled` prop (like previous/next chapter buttons), it does not automatically announce its disabled state to screen readers in React Native. This leaves users confused why a button press does nothing.
**Action:** Always add `accessibilityState={{ disabled: boolean }}` and consider providing a dynamic `accessibilityHint` explaining why it's disabled (e.g. "Vous êtes au premier chapitre").
