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

## 2024-05-24 - Insecure Deserialization in BackupService
**Vulnerability:** The BackupService read JSON strings from external storage (via SAF) and blindly parsed them using `JSON.parse()` without validating the shape of the resulting data. This allowed potential insecure deserialization where a malicious or corrupted backup file could introduce unexpected types (e.g. primitive values or arrays instead of objects) leading to application crashes or undefined behavior.
**Learning:** External data should never be trusted, even if it comes from the app's own backups, since the file system is out of the app's control. We must always perform runtime shape and type checking after parsing.
**Prevention:** Always validate the schema of parsed JSON to ensure it is the expected type (e.g. `parsed && typeof parsed === 'object'` for objects, or `Array.isArray(parsed)` for arrays) and contains expected keys before returning or using the data.
