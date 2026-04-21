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

## 2024-04-21 - Accessible Error Recovery Actions
**Learning:** Error or empty states containing retry/refresh buttons (like 'Réessayer') without explicit accessibility attributes fail to clearly communicate their recovery purpose to screen reader users, who may be unable to identify how to restore lost connectivity or data.
**Action:** Always explicitly add `accessibilityRole="button"`, `accessibilityLabel`, and `accessibilityHint` on the interactive wrappers (like `TouchableOpacity`) in error/empty states so users can fully understand and trigger error recovery.
