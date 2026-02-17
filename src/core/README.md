# core

Logique centrale du SDK : ouverture du flux de paiement (Promise, overlay, steps) et API publique (createGateway).

## openPayment.js

- **Rôle** : orchestrer l’ouverture de la fenêtre de paiement. Crée la Promise, la config fusionnée, la palette, l’overlay et le modal, construit le contexte (ctx) et affiche l’étape 1.
- **Exporte** : `openPayment(baseConfig, options)`.
- **Reçoit** : `baseConfig` (config globale de la gateway), `options` (paramètres de la session : amount, currency, customerName, etc.).
- **Retourne** : une **Promise** résolue avec le payload de succès (`{ success, method, amount, currency, ... }`) ou rejetée avec `{ code: PAYMENT_CANCELLED_CODE, message }` en cas d’annulation.
- **Utilisé par** : createGateway.js (uniquement). Non exposé dans l’API publique.

## createGateway.js

- **Rôle** : point d’entrée public. Initialise la gateway avec la config globale et expose `openPayment(options)` qui délègue à openPayment(baseConfig, options).
- **Exporte** : `createGateway(globalConfig)`, `create41DevsGateway` (alias).
- **Reçoit** : `globalConfig` (publicKey, environment, theme, logoUrl, etc.).
- **Retourne** : `{ openPayment(options) }` — chaque appel à `openPayment` retourne la Promise décrite ci-dessus.
- **Utilisé par** : src/index.js (ré-export vers le package).
