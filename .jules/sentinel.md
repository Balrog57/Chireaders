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

## 2024-05-15 - DOM XSS in WebView
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) potential in WebView injected scripts due to `innerHTML` usage.
**Learning:** Using `innerHTML` to set even static text creates dormant DOM-based XSS vulnerabilities that could be exploited if static assignments are later refactored into dynamic ones.
**Prevention:** Always use `textContent` over `innerHTML` to assign text strings in WebView injected JavaScript environments.
