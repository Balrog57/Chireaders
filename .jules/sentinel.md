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

## 2024-05-20 - Insecure Deserialization via StorageAccessFramework
**Vulnerability:** Raw string data loaded from external storage via `StorageAccessFramework` was passed directly to `JSON.parse()` without shape validation, and in some cases, without `try/catch`.
**Learning:** The application implicitly trusted external backup files, ignoring that they could be modified outside the app by a user or another app, leading to runtime crashes or state corruption via object injection.
**Prevention:** Always wrap `JSON.parse()` for external data in a `try/catch` and strictly validate the structure (e.g., `typeof parsed === 'object'`, `Array.isArray()`, and checking for required keys) before returning the deserialized data.
