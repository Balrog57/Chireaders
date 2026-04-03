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

## 2024-05-24 - Intent Injection Bypass via URL Case Manipulation
**Vulnerability:** The WebView `onShouldStartLoadWithRequest` handler was vulnerable to bypasses of its security filters because the URL scheme check was case-sensitive. Attackers could bypass scheme blacklists/whitelists using mixed-case schemes (e.g., `jAvAscript:`, `InTeNt:`).
**Learning:** Checking for URL schemes string-matching must account for case-insensitivity because URL schemes are case-insensitive by spec, and WebViews may process mixed-case schemes.
**Prevention:** Always convert the URL (or its scheme part) to lowercase using `.toLowerCase()` before performing string matching, or use the standard `URL` object to parse and check the `.protocol` property which normalizes case automatically.
