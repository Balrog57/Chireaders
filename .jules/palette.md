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

## 2024-04-01 - Empty States Consistency
**Learning:** Showing plain text "Aucun résultat." in lists creates a jarring and unhelpful user experience compared to sections that use full-page empty states (like the Home or Favorites screens). Consistency in handling "zero data" states is critical for UX.
**Action:** Always implement a consistent empty state combining a contextual icon (e.g., `Ionicons`), a bold clear title, and descriptive subtext for list views with empty results to maintain UI cohesion.
