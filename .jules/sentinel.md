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

## 2024-05-10 - Defensive Storage Parsing
**Vulnerability:** AsyncStorage items were parsed using `JSON.parse()` without try-catch blocks or type validation, which could crash the app or corrupt state if the persistent data was modified, corrupted, or of an unexpected type.
**Learning:** Persisted client-side data should always be treated as untrusted input. Unhandled exceptions in parsing block subsequent initialization steps and can lead to a broken application state (DoS).
**Prevention:** Always wrap `JSON.parse` in try-catch blocks when reading from local storage, and explicitly validate the type (e.g., `Array.isArray()`) before assigning it to application state, providing safe defaults upon failure.
