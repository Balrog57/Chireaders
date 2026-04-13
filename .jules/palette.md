# Palette - Apprentissages Accessibilité

## Listes complexes (FlatList)
- **Problème** : Les cartes d'historique ou de favoris contiennent plusieurs informations (Titre, Chapitre, Date). Un lecteur d'écran peut se perdre ou lire les éléments de manière décousue.
- **Solution** : Regrouper l'information dans un seul `accessibilityLabel` sur le conteneur `TouchableOpacity` parent.
- **Exemple** :
  ```javascript
  accessibilityLabel={`${item.seriesTitle}, ${item.title}, lu ${formatDate(item.dateRead)}`}
  ```

## Navigation
- Toujours ajouter un `accessibilityLabel="Retour"` sur les boutons iconographiques de retour.
- Utiliser `accessibilityRole="button"` pour tous les éléments cliquables qui ne sont pas des liens natifs.

## États Dynamiques
- Utiliser `accessibilityState={{ checked: isActive }}` pour les interrupteurs ou favoris (notifications).

## 2024-05-24 - Empty State Retry Buttons Accessibility
**Learning:** Error or empty states containing generic action buttons like "Réessayer" lack context for screen readers when they fail to describe *what* is being retried.
**Action:** Always add `accessibilityRole="button"`, a descriptive `accessibilityLabel` (e.g., "Réessayer de charger les romans"), and an `accessibilityHint` to the interactive wrapper of empty state buttons so users can understand and trigger error recovery.
