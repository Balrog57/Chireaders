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

## 2023-10-25 - États d'erreur et Boutons de Réessai
**Learning:** Les boutons de rafraîchissement ou de réessai dans les états vides/d'erreur (ex. 'Réessayer') sont critiques pour la récupération d'erreur, mais manquent souvent de contexte pour les lecteurs d'écran lorsqu'ils utilisent un `TouchableOpacity` simple.
**Action:** Toujours ajouter `accessibilityRole="button"`, un `accessibilityLabel`, et un `accessibilityHint` descriptif sur ces éléments pour que les utilisateurs de lecteurs d'écran puissent comprendre et déclencher l'action de récupération.
