# ChiReader - Contexte et Instructions Gemini

Ce document sert de référence pour comprendre le projet, son architecture et les règles de développement à suivre.

## 📋 Aperçu du Projet
ChiReader est une application Android (React Native/Expo) permettant de lire les romans du site **chireads.com**. L'application propose une interface optimisée pour tablettes et smartphones, avec un système de favoris, un suivi de lecture et des notifications.

### Stack Technique
- **Framework** : Expo (React Native)
- **Scraping** : `axios` + `react-native-cheerio`
- **Navigation** : `@react-navigation/native` (Stack & Tabs)
- **Persistance** : `@react-native-async-storage/async-storage`
- **Image** : `expo-image`
- **Tâches de fond** : `expo-background-fetch` + `expo-task-manager`

---

## 🏗️ Architecture du Code
Le projet suit une structure modulaire dans le dossier `src/` :

- **`src/screens/`** : Composants de pages (Accueil, Détails, Lecteur, Favoris, Bibliothèque, Paramètres, Histoire).
- **`src/services/`** : 
    - `ChiReadsScraper.js` : Logique centrale de parsing HTML.
    - `NotificationService.js` : Gestion des alertes locales.
    - `BackgroundNotificationTask.js` : Tâche périodique de vérification des nouveaux chapitres.
- **`src/context/`** : Gestion de l'état global.
    - `StorageContext.js` : Données (Favoris, Histoire, Progression).
    - `ThemeContext.js` : Gestion des thèmes (Clair, Sombre, Sépia).
- **`src/utils/`** : Utilitaires (Détection d'URL, Helpers fichiers).

---

## 🛠️ Commandes Utiles (Environnement Windows)
- `npm start` : Lancer le serveur de développement Expo.
- `npm start -- --clear` : Lancer avec nettoyage du cache.
- `npm run android` : Lancer sur un émulateur ou appareil Android.
- `npm run lint` : Vérifier la qualité du code.
- `npm run reset-project` : Script de secours pour réinitialiser l'environnement.

---

## 📜 Règles Métier Locales
1. **Scraping Sécurisé** : Toujours utiliser `getSafeUrl` dans `ChiReadsScraper.js` pour éviter les redirections malveillantes.
2. **Performance** : Utiliser `expo-image` pour le chargement des couvertures de livres.
3. **Persistance** : Toute donnée utilisateur doit transiter par le `StorageProvider` pour garantir la synchronisation.
4. **Notifications** : Les notifications doivent inclure une URL de redirection pour permettre à l'utilisateur d'ouvrir directement le roman concerné.

---

## 🛡️ Registre des Erreurs Documentées
#### ERREUR : CORS dans le navigateur
- **CAUSE** : Le site chireads.com bloque les requêtes cross-origin depuis un navigateur standard.
- **SOLUTION** : Ne pas utiliser le mode Web pour le développement complet. Tester exclusivement sur émulateur Android ou appareil physique via Expo Go.

#### ERREUR : Images non affichées
- **CAUSE** : Liens d'images relatifs ou expirés.
- **SOLUTION** : Utiliser un placeholder par défaut via `expo-image` et s'assurer que l'URL est traitée par `getSafeUrl`.

---

## 🎯 Objectifs de Développement (Priorités)
- Maintenir la compatibilité tablette (layout paysage).
- Migrer progressivement vers TypeScript (certains utilitaires le sont déjà).
- Optimiser le temps de scraping via du cache local temporaire.
