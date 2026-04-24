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

## 2024-05-20 - Insecure Deserialization in AsyncStorage and SAF
**Vulnerability:** Parsing raw JSON strings directly into application state (e.g., `JSON.parse(content)`) from local storage and user-selected backup folders without runtime schema validation.
**Learning:** In JavaScript, `typeof null` is `'object'`, and `JSON.parse` can return primitive types, arrays, or arbitrary objects. Directly assigning these to context state without checking the expected shape (e.g., `Array.isArray`) can lead to runtime crashes or insecure deserialization if the backup file or local storage is corrupted or maliciously altered.
**Prevention:** Always validate the structure and type of parsed JSON data before using it, especially when the data source is outside the immediate control of the executing code (like the file system). Use explicit checks like `parsed && typeof parsed === 'object' && !Array.isArray(parsed)` for objects and `Array.isArray(parsed)` for arrays.
