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

## 2024-05-24 - Secondary Actions (onLongPress) Visibility
**Learning:** Secondary actions triggered by `onLongPress` on React Native interactable components (like `TouchableOpacity`) are completely invisible to screen readers (VoiceOver/TalkBack). Users relying on assistive technologies cannot discover these features (e.g., long pressing a chapter to mark it as read).
**Action:** Always provide an explicit `accessibilityHint` on elements with an `onLongPress` handler that describes both the primary tap action and the secondary long-press action.
