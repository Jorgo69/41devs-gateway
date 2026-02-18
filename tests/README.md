# Tests

Suite de tests Vitest (environnement jsdom pour les tests du modal).

## Lancer les tests

```bash
npm test          # une fois
npm run test:watch  # mode watch
```

## Couverture

| Fichier | Rôle |
|--------|------|
| **constants.test.js** | PAYMENT_CANCELLED_CODE, isMobileMoney, DEFAULT_COUNTRIES, palettes |
| **theme.test.js** | getEffectiveTheme (light/dark/auto), buildPalette (avec/sans couleur primaire custom) |
| **validation.test.js** | validateEmail, validatePhoneForCountry, validateCardNumber, validateExpiry, validateCvv |
| **gateway.test.js** | createGateway retourne { openPayment }, openPayment ouvre l’overlay (pas de retour) ; clic Annuler ou X → fermeture de l’overlay |

Les tests d’annulation utilisent le DOM (jsdom) : ouverture du modal, clic sur Annuler ou sur la croix, assertion sur la Promise rejetée.
