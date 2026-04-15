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

## 2025-04-15 - Accessibilité des états d'erreur
**Learning:** Les boutons de relance (retry/refresh) dans les états d'erreur (ex: "Réessayer") sans `accessibilityRole`, `accessibilityLabel` ou `accessibilityHint` sont invisibles ou confus pour les utilisateurs de lecteurs d'écran.
**Action:** Toujours s'assurer que ces boutons interactifs (comme TouchableOpacity) incluent explicitement ces propriétés pour permettre de comprendre et de déclencher la récupération.
