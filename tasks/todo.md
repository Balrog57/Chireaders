# Planification et Suivi

## Objectifs de la Session
- [x] Résumer les PRs ouvertes.
- [x] Identifier et fermer les PRs superflues (doublons).
- [x] Tester les PRs valides (checkout + `npm install` + `npm run lint`).
- [x] Fusionner les PRs testées avec succès.
- [x] Supprimer toutes les branches secondaires résiduelles.

## Implémentation
1. **Analyse des PRs et Doublons** : 
   - **Optimisation NovelDetailScreen** : Garder PR #57, fermer #56, #55, #46.
   - **Race condition background task** : Garder PR #53, fermer #52, #49.
   - **Accessibilité Palette** : Garder #54, #51, #48, #45.
   - **Sentinel / Validation** : Garder #59, #47.
   - **Features & Perfs** : Garder #58, #50.
2. **Phase de Test** : Pour chaque PR à garder, je vais `git fetch`, `git checkout <branche>`, exécuter `npm install` puis `npm run lint` pour s'assurer qu'il n'y a pas d'erreur de lint/compilation.
3. **Fusion** : Utilisation de l'outil GitHub MCP pour merger les PRs qui passent le test. `mcp_remote-github_merge_pull_request`.
4. **Nettoyage** : Fermeture des PRs obsolètes, suppression des branches distantes associées.

## Implémentation
- [x] Corriger l'écran blanc provoqué par une erreur réseau (émulateur sans internet).
- [x] Ajouter un système de cache temporaire en mémoire pour les chapitres visités dans `ReaderScreen`.
- [x] Vider le cache à la fermeture de l'écran de lecture.
- [x] Vider le cache lorsque l'application passe en arrière-plan ou se ferme (`AppState`).

## Révision
- [x] La commande `npm run lint` passe sans erreur sur la branche `main` après toutes les fusions.
- [x] Plus de PR ouvertes sur le repo.
- [x] Plus de branches secondaires.
