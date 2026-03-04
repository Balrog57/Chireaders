## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-10-18 - Dynamic Accessibility Labels
**Learning:** Toggle buttons (like Theme or Sort Order) need dynamic `accessibilityLabel` props that reflect the *action* (e.g., "Activer le thème sombre") rather than the *current state*, or explicit `accessibilityState` and a static label.
**Action:** Use helper functions or ternary operators to switch labels based on state.

## 2026-03-04 - Screen-Specific Icon Buttons Accessibility
**Learning:** Even if a common component or screen has been updated (like `NovelDetailScreen` having accessible back buttons), other screens (like `SettingsScreen`) might have been missed or added later without the same accessibility standards for their icon-only navigation buttons.
**Action:** Always verify icon-only buttons individually per screen, specifically looking out for unlabelled `Ionicons` within a `TouchableOpacity` using a full repository search for elements lacking `accessibilityLabel`.