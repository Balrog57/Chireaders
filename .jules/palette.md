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

## 2024-04-09 - Empty States Contextuels
**Learning:** Les états vides (empty states) génériques dans les listes filtrables (comme la recherche) manquent de clarté. L'utilisateur ne sait pas s'il y a un problème de connexion, si la bibliothèque est réellement vide, ou si sa recherche n'a simplement rien donné.
**Action:** Utiliser un composant `ListEmptyComponent` contextuel qui analyse les états (ex: `searchQuery`) pour afficher une icône, un titre et un sous-texte spécifiques ("Aucun résultat" pour une recherche vs "Bibliothèque vide" au lancement).
