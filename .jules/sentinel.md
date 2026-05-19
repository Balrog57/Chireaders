# Sentinel - Apprentissages Sécurité WebView

## Restriction de Navigation
- **Problème** : Une WebView peut naviguer vers n'importe quelle URL, y compris des domaines malveillants ou des schémas d'URI dangereux.
- **Solution** : Utiliser la prop `onShouldStartLoadWithRequest` pour intercepter et valider chaque tentative de navigation.
- **Règle** : N'autoriser que les domaines de confiance (ex: `chireads.com`) et les schémas sûrs (`http`, `https`, `about`, `data`).

## Protection contre l'Injection d'Intents (Android)
- **Problème** : Les schémas comme `intent://` peuvent être utilisés pour lancer des applications tierces avec des permissions élevées via la WebView.
- **Solution** : Bloquer explicitement les schémas `intent:`, `file:`, et `javascript:`.
- **Alternative** : Pour les liens légitimes (ex: `mailto:`, `tel:`), utiliser `Linking.openURL()` pour déléguer au système.

## Validation des Origines PostMessage
- **Problème** : N'importe quelle page chargée dans la WebView peut envoyer des messages via `window.ReactNativeWebView.postMessage`.
- **Solution** : Vérifier l'URL d'origine du message dans le handler `onMessage`.
  ```javascript
  const sourceUrl = event.nativeEvent.url;
  if (!isValidChiReadsUrl(sourceUrl)) return;
  ```

## 2026-05-10 - Parsing Défensif et Schémas d'URL
- **Problème** : Les données de stockage local, sauvegardes SAF et caches JSON sont modifiables ou corruptibles, et les schémas d'URL WebView sont insensibles à la casse.
- **Solution** : Encadrer chaque `JSON.parse` exposé par un `try/catch`, valider explicitement la forme attendue avant d'assigner l'état, et normaliser les schémas d'URL avec `toLowerCase()` avant toute comparaison.
- **Règle** : Les sauvegardes restaurées doivent contenir au moins une clé connue avec le bon type (`favorites`, `readChapters`, `settings`), les caches de bibliothèque doivent rester des tableaux, et les protocoles non autorisés doivent être bloqués.

## 2024-05-24 - Prévention XSS (DOM-based) dans la WebView
**Vulnerability:** L'utilisation de `innerHTML` pour insérer du texte statique (' ✓') dans la WebView expose à un risque de DOM-based XSS en cas de future modification dynamique.
**Learning:** Même pour des chaînes simples et statiques, `innerHTML` crée une mauvaise habitude et une dette technique de sécurité qui peut être exploitée si le code est refactorisé pour utiliser des entrées dynamiques.
**Prevention:** Toujours privilégier `textContent` (ou `innerText`) pour l'insertion de texte pur afin de s'assurer que le contenu ne sera jamais interprété comme du HTML.
