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
## 2024-05-24 - Empty States Guidelines
**Learning:** In list views (`FlatList` like Library, Favorites, History), plain unstyled text for empty states (e.g., "Aucun résultat.") causes user frustration and looks like an error state. Providing a visually styled component with an icon, title, and action-oriented subtitle significantly improves contextual guidance and the overall polished feel.
**Action:** Always implement a styled `ListEmptyComponent` using consistent styles (`emptyContainer`, `emptyText`, `emptySubtext`) with a descriptive icon and contextual subtext.
