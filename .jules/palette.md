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

## 2026-05-10 - États Vides et Actions Secondaires
- **Problème** : Un texte seul pour un état vide manque de contexte, et les actions `onLongPress` ne sont pas découvrables par les lecteurs d'écran.
- **Solution** : Utiliser des états vides structurés avec icône, titre et sous-texte contextualisé, et décrire les actions secondaires dans `accessibilityHint`.
- **Règle** : Les cartes complexes doivent porter un `accessibilityLabel` agrégé, les champs doivent utiliser des tokens de thème sémantiques comme `theme.textSecondary`, et les boutons de récupération doivent avoir rôle, label et hint explicites.

## 2024-05-16 - Accessibilité des éléments interactifs conditionnels
**Learning:** Les boutons d'action conditionnels qui n'apparaissent qu'après certaines actions utilisateur (comme le bouton "Reprendre" qui apparaît lorsqu'il y a une progression de lecture) sont souvent oubliés lors des audits d'accessibilité car ils ne sont pas visibles dans l'état initial (vide) de l'interface.
**Action:** Toujours s'assurer que les éléments interactifs rendus conditionnellement incluent `accessibilityRole`, `accessibilityLabel` et `accessibilityHint` pour garantir leur découvrabilité par les lecteurs d'écran dès leur apparition.
