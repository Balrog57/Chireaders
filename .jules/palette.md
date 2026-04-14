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

## 2024-04-14 - Accessibilité des états d'erreur
**Learning:** Les boutons de relance (comme "Réessayer") dans les états d'erreur ou vides manquent souvent de contexte pour les lecteurs d'écran, ce qui empêche les utilisateurs de comprendre comment récupérer d'une erreur.
**Action:** Ajouter explicitement `accessibilityRole="button"`, `accessibilityLabel` et `accessibilityHint` sur les conteneurs interactifs des boutons de relance.
