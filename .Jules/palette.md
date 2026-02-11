## 2026-02-02 - Missing Accessibility on Icon-Only Buttons
**Learning:** The application extensively uses icon-only buttons (Ionicons) for critical navigation (Back, Settings, Theme) without any accessibility labels, making the app unusable for screen reader users.
**Action:** Always verify `accessibilityLabel` and `accessibilityRole` on `TouchableOpacity` components wrapping icons.

## 2026-02-02 - Hardcoded French Localization
**Learning:** The codebase uses hardcoded French strings for accessibility labels (e.g., "Retour", "Chapitre suivant") directly in components, despite English variable names and file structure.
**Action:** Always check existing components for language patterns (French vs English) before adding new labels to maintain consistency.
