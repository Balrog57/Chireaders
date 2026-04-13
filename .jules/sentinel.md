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

## 2024-04-13 - Insecure Deserialization in BackupService
**Vulnerability:** External backup files read via `StorageAccessFramework` were passed directly to `JSON.parse` and returned to the application context without any try/catch block or schema validation. An attacker could craft a malicious or malformed backup file (e.g. replacing the expected object with an Array or invalid string) that would crash the app or potentially cause unexpected state injection when the Context blindy assigns the properties.
**Learning:** `JSON.parse` on externally-sourced data (files from standard device storage via SAF) is just as untrusted as network data. React context methods assumed the restored data perfectly matched the expected schema (`{ favorites, readChapters, settings }`).
**Prevention:** Wrap all `JSON.parse` operations on external files in `try/catch` blocks. Validate the type (e.g. `typeof data === 'object'` and `!Array.isArray(data)`) and ensure at least one expected core key exists before returning the object to the application logic.
