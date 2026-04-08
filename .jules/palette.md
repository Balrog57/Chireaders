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

## 2026-04-08 - États Vides et Boutons de Réessai
**Learning:** Les boutons de réessai ("Réessayer") dans les états d'erreur ou vides manquent souvent d'attributs d'accessibilité, ce qui empêche les utilisateurs de lecteurs d'écran de comprendre comment récupérer après une erreur de réseau.
**Action:** Toujours s'assurer que les boutons de récupération/réessai ont un `accessibilityRole="button"`, un `accessibilityLabel` clair et un `accessibilityHint` qui explique l'action.
