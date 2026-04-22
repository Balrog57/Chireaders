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

## 2026-04-22 - Accessibilité des boutons de rechargement/erreur
**Learning:** Les états d'erreur ou vides contenant des boutons de rechargement (ex. "Réessayer") doivent comporter des attributs d'accessibilité (role, label, hint) pour que les utilisateurs de lecteurs d'écran puissent comprendre et déclencher la récupération d'erreur.
**Action:** Toujours ajouter `accessibilityRole="button"`, `accessibilityLabel` et `accessibilityHint` sur les `TouchableOpacity` agissant comme boutons de rechargement.
