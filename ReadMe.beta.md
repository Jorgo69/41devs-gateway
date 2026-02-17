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

## Comment déclencher la fenêtre de paiement

La fenêtre s’ouvre **uniquement** quand vous appelez `gateway.openPayment(...)`. Le SDK ne s’ouvre pas tout seul.

1. **Créer l’instance** une fois (au chargement de la page ou du composant) avec `createGateway({ ... })`.
2. **Ouvrir la fenêtre** au moment voulu en appelant `gateway.openPayment({ amount, currency, ... })` — le plus souvent dans un **gestionnaire d’événement** (clic sur un bouton, hover, après une étape, etc.).

Vous choisissez quand déclencher : clic, double-clic, hover, soumission de formulaire, etc. Les exemples ci-dessous utilisent un **clic sur un bouton** ; vous pouvez adapter à n’importe quel événement.

---

## Exemples prêts à copier-coller

### Vanilla JS + HTML

Fichier unique (avec un bundler type Vite qui résout `41devs-gateway`) ou script module pointant vers votre build.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Paiement 41devs-gateway</title>
</head>
<body>
  <button type="button" id="pay-btn">Payer maintenant</button>

  <script type="module">
    import { createGateway } from '41devs-gateway'

    const gateway = createGateway({
      publicKey: 'pk_xxx',
      environment: 'sandbox',
    })

    document.getElementById('pay-btn').addEventListener('click', () => {
      gateway.openPayment({
        amount: 1000,
        currency: 'XOF',
        customerName: 'Client',
      })
    })
  </script>
</body>
</html>
```

---

### Vue 3 (Composition API)

Créer la gateway une fois (ex. `onMounted`), puis appeler `openPayment` au clic.

```vue
<template>
  <button type="button" @click="openPaymentModal">Payer maintenant</button>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { createGateway } from '41devs-gateway'

const gateway = ref(null)

onMounted(() => {
  gateway.value = createGateway({
    publicKey: 'pk_xxx',
    environment: 'sandbox',
  })
})

function openPaymentModal() {
  gateway.value?.openPayment({
    amount: 1000,
    currency: 'XOF',
    customerName: 'Client',
  })
}
</script>
```

---

### React

Créer la gateway une fois (ex. `useRef` + `useEffect`), puis appeler `openPayment` au clic.

```jsx
import { useRef, useEffect } from 'react'
import { createGateway } from '41devs-gateway'

export default function PayButton() {
  const gatewayRef = useRef(null)

  useEffect(() => {
    gatewayRef.current = createGateway({
      publicKey: 'pk_xxx',
      environment: 'sandbox',
    })
  }, [])

  const handleClick = () => {
    gatewayRef.current?.openPayment({
      amount: 1000,
      currency: 'XOF',
      customerName: 'Client',
    })
  }

  return <button type="button" onClick={handleClick}>Payer maintenant</button>
}
```

---

## Options utiles

- **createGateway** : `{ publicKey, environment, theme, logoUrl, merchantLogoUrl, colors: { light: { primary }, dark: { primary } } }`
- **openPayment** : `{ amount, currency, customerName, paymentReference }`

En production, **amount** et **currency** doivent venir du backend (session de paiement). **secretKey** reste uniquement côté serveur.

---

Documentation complète (API détaillée, workflow branches) : branche **main** du dépôt.
