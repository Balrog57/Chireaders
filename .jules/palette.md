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
## 2025-02-14 - Empty State Consistency
**Learning:** In list views (like Library, Favorites, History), unstyled "no results" text feels broken and fails to guide the user. Using consistent visual empty states with an icon, title, and action-oriented subtitle reduces user frustration when searches return empty.
**Action:** Always implement a styled `ListEmptyComponent` for `FlatList` with `emptyContainer`, `emptyText`, and `emptySubtext` styles, including an icon and helpful contextual text.
