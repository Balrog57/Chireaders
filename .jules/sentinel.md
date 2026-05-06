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
## 2024-05-06 - Defensive Storage Parsing
**Vulnerability:** Persistent Denial of Service (DoS) via malformed local backup/storage data.
**Learning:** `JSON.parse` returning valid but unexpected types (e.g., an Object `{}` instead of an Array `[]`) bypasses `try...catch` syntax checks but crashes the app later when array methods (like `.map` or `.filter`) are called. This can be exploited by restoring a corrupted backup file, creating a crash loop on startup.
**Prevention:** When reading from persistent storage or external backups, always validate the exact type (e.g., `Array.isArray(data)`) after `JSON.parse` before storing it in application state.
