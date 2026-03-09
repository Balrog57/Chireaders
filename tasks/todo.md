# Planification et Suivi

## Objectifs de la Session
- [ ] Analyser les différentes PRs de Jules et identifier les versions les plus récentes/valides.
- [ ] Mettre en place les recommandations de Jules.
- [ ] Tester chaque modification via `npm run lint` ou tests unitaires.
- [ ] Faire le ménage dans le repo (fermeture des PRs obsolètes et suppression des branches).
- [ ] Mettre à jour la version de l'application.
- [ ] Attendre la validation pour le merge final sur Github.

## Implémentation planifiée
1. **Intégrer les améliorations** :
   - Optimisation `getAllHistory` (PR #87)
   - Accessibilité des boutons dans `NovelDetailScreen` (PR #86)
   - Sécurité WebView : Validation origin (PR #85, remplace 82, 80, 77, 74, 71, 69)
   - Optimisation de la recherche `LibraryScreen` (PR #84, remplace 81, 78, 73, 72)
   - Accessibilité cartes `HistoryScreen` (PR #83, remplace 79, 76, 75)
   - Accessibilité bouton retour `SettingsScreen` (PR #70, remplace 68)
2. **Phase de test** : 
   - Exécution de `npm install` et `npm run lint`.
3. **Ménage** :
   - Clôture des PRs en doublon et anciennes via l'API GitHub.
4. **Version** :
   - Bump de la version dans `package.json` et `app.json`.

## Révision
- [ ] Tests validés (lint vert)
- [ ] Repo nettoyé
- [ ] En attente de validation pour le push
