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
## 2026-05-11 - DOM XSS in WebView Injected JavaScript
**Vulnerability:** Use of innerHTML for static text assignment in WebView injected JavaScript.
**Learning:** Even when assigning static strings, using innerHTML in injected scripts creates a fragile pattern that could become an active DOM-based XSS vulnerability if later refactored to use dynamic variables.
**Prevention:** Always use textContent over innerHTML in WebView injected scripts to enforce safe text assignment.
