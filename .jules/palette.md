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

## 2024-05-17 - Cohérence Visuelle des États Vides (Empty States)
**Learning:** L'utilisation de simples composants `<Text>` pour les états vides (ex: "Aucun résultat") donne une impression d'inachèvement et ne guide pas l'utilisateur.
**Action:** Toujours implémenter un état vide complet et cohérent incluant une icône descriptive (ex: `Ionicons`), un titre en gras et un sous-texte explicatif, en particulier lors de la gestion de la recherche et du filtrage.
