# ChiReaders 📱

Application Android simple pour lire des romans (novels) depuis le site **chireads.com**.

Cette application utilise **React Native** (Expo) et **Cheerio** pour récupérer et parser le contenu du site en temps réel.

## ✨ Fonctionnalités

- **Catalogue** : Accès aux romans "En Vedette" et "Populaires" depuis la page d'accueil.
- **Lecture** : Affichage clair des chapitres.
- **Mode Lecture** :
    - Mode Jour / Nuit 🌙
    - Ajustement de la taille de la police A+ / A-
    - Fluidité de navigation entre les chapitres.
- **Favoris** ❤️ : Sauvegarde de vos romans préférés localement.
- **Historique** 🕒 : Reprenez votre lecture exactement là où vous l'avez laissée (dernier chapitre lu, position dans la page).

## 🛠 Installation et Lancement

### Prérequis
- Node.js installé.
- Un téléphone Android avec l'application **Expo Go** installée (disponible sur le Play Store).
- OU Android Studio pour utiliser l'émulateur.

### Installation des dépendances
```bash
npm install
```

### Lancement du serveur de développement
```bash
npx expo start --clear
```

### Tester l'application
1. Une fois la commande lancée, un QR Code s'affiche dans le terminal.
2. Scannez-le avec l'application **Expo Go** sur Android.
3. OU appuyez sur la touche `a` pour lancer sur un émulateur Android connecté.

## 🐛 Problèmes connus & Solutions

### Erreur `Unable to resolve module node:stream` ou `node:net`
Cheerio (le parser HTML) utilise des modules Node.js standards qui ne sont pas présents dans React Native.
Nous avons corrigé cela en :
1. Installant des polyfills : `stream-browserify`, `events`, `buffer`, etc.
2. Configurant `metro.config.js` pour rediriger les imports `node:` vers ces polyfills.
3. Injectant `global.Buffer` et `global.process` dans `App.js`.

### Contenu non chargé (Page blanche)
Si vous testez sur un **navigateur web**, cela ne fonctionnera pas à cause des sécurités **CORS** du site chireads.com qui bloquent les requêtes directes.
-> **Testez impérativement sur Android (Physique ou Émulateur).**

## 📦 Génération de l'APK (Android)

Pour générer un fichier `.apk` installable :
1. Créez un compte sur [expo.dev](https://expo.dev).
2. Installez EAS CLI : `npm install -g eas-cli`.
3. Connectez-vous : `eas login`.
4. Configurez le projet : `eas build:configure`.
5. Lancez le build : `eas build -p android --profile preview`.

---
*Développé avec ❤️ pour les lecteurs de ChiReads.*
