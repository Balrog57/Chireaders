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

## 2026-04-11 - [Boutons de récupération d'erreur accessibles]
**Learning:** Les boutons d'états d'erreur (comme "Réessayer") manquent souvent d'attributs d'accessibilité explicites, ce qui empêche les lecteurs d'écran d'identifier et de déclencher facilement l'action.
**Action:** Ajouter toujours `accessibilityRole="button"`, `accessibilityLabel` et `accessibilityHint` sur les composants interactifs (comme TouchableOpacity) encapsulant les boutons de relance de réseau/chargement.
