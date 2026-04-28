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

## 2024-04-28 - [Insecure Deserialization in BackupService]
**Vulnerability:** Data retrieved from user-selected folders via StorageAccessFramework was parsed using JSON.parse() without any runtime schema validation or a try/catch block in restoreFromBackup.
**Learning:** The application trusted file contents from external storage blindly, creating an insecure deserialization risk where malformed or malicious JSON could crash the app or introduce unexpected state objects (since typeof null === 'object').
**Prevention:** Always wrap JSON.parse() for external data in a try/catch and enforce strict shape checking immediately after parsing (e.g., verifying parsed && typeof parsed === 'object' for backups, and Array.isArray(parsed) for the cache) before returning the data to the application state.
