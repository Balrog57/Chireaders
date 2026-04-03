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

## 2024-04-03 - Indicateurs d'état et d'action longue
**Learning:** Les icônes indiquant un état (comme "lu") et les actions complexes (comme un appui long) ne sont pas devinables par les lecteurs d'écran si elles ne sont pas explicitement décrites.
**Action:** Utiliser `accessibilityLabel` pour inclure l'état visuel (ex: "Chapitre 1, Lu") et `accessibilityHint` pour expliquer les actions secondaires (ex: "Appuyez pour lire, maintenez pour marquer comme lu").
