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

## 2026-05-10 - Conditional Action Buttons
**Learning:** Conditional action buttons (like "Reprendre" that only appear when reading progress exists) are often missed during accessibility audits because they aren't always visible by default.
**Action:** Always verify accessibility attributes (`accessibilityRole`, `accessibilityLabel`, `accessibilityHint`) on conditionally rendered interactive elements.
