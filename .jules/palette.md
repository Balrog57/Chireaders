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

## 2025-04-04 - Actions Secondaires (onLongPress)
**Learning:** Les éléments interactifs avec des actions secondaires (ex: `onLongPress` pour marquer comme lu) doivent explicitement décrire ces actions dans `accessibilityHint` pour que les utilisateurs de lecteurs d'écran en aient conscience. De plus, leur état visuel/sémantique (ex: "lu") doit être inclus dynamiquement dans l'`accessibilityLabel`.
**Action:** Toujours s'assurer que les actions secondaires sont documentées via `accessibilityHint` et que l'état actuel est reflété dans `accessibilityLabel` ou `accessibilityState`.
