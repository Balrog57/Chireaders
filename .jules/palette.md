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
## 2024-05-12 - Native Text Input Enhancements
**Learning:** React Native provides native iOS capabilities on TextInput like `clearButtonMode` for easy clearing, and `keyboardAppearance` to natively match the app's theme without custom components.
**Action:** Always use `clearButtonMode` on iOS text inputs like search bars to improve UX natively, and ensure `keyboardAppearance` reflects the current theme mode.
