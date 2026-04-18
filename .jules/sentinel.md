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

## 2026-02-27 - [Insecure Deserialization in Storage]
**Vulnerability:** Parsing JSON from external files (like SAF backups or caches) without `try/catch` and schema validation leads to insecure deserialization.
**Learning:** `JSON.parse()` can throw unhandled exceptions or return unexpected types (like `null` or arrays instead of objects), which can crash the app or cause logic errors when properties are accessed.
**Prevention:** Always wrap `JSON.parse` in a `try/catch` block and perform runtime shape checking (e.g., verifying `parsed && typeof parsed === 'object'` and checking for required keys, or `Array.isArray()`) before returning the data.
