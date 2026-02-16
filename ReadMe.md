# 41devs-gateway (beta)

Version **beta** pour les testeurs. SDK de paiement 41 Devs : popup MTN, Moov, Celtis, carte bancaire. Compatible Vue, React, Svelte, JS vanilla.

---

## Installation

```bash
npm install github:Jorgo69/41devs-gateway#beta
```

---

## Prérequis

Node.js 20, projet en ES modules (`"type": "module"` ou Vite/Webpack).

---

## Utilisation

```js
import { createGateway } from '41devs-gateway'

const gateway = createGateway({
  publicKey: 'pk_xxx',
  environment: 'sandbox',
})

// Au clic sur un bouton par exemple
gateway.openPayment({
  amount: 1000,
  currency: 'XOF',
  customerName: 'Client',
})
```

**Options utiles** : `createGateway({ publicKey, environment, theme, logoUrl, merchantLogoUrl, colors: { light: { primary }, dark: { primary } } })` — `openPayment({ amount, currency, customerName, paymentReference })`.

En production, **amount** et **currency** doivent venir du backend. **secretKey** reste uniquement côté serveur.

---

Documentation complète (exemples Vue/React/Svelte, API détaillée, workflow branches) : branche **main** du dépôt.
