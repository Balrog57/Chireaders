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

## 2024-04-06 - Insecure Deserialization in BackupService
**Vulnerability:** `JSON.parse` was used to load data from the file system (`BackupService.restoreFromBackup` and `loadLibraryCache`) without verifying the schema of the parsed data.
**Learning:** File system data, especially backup files, can be modified by the user or other applications. Deserializing this data without validation can lead to unexpected app states or crashes if the data structure is manipulated.
**Prevention:** Always implement runtime schema validation after `JSON.parse` for data originating outside the app's secure sandbox. Ensure the parsed data matches expected types (e.g., `Array.isArray()` for lists, checking for specific keys in objects) before returning it to the application logic.
