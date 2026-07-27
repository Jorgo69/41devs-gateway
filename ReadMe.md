# @ibra69/41devs-gateway

SDK JavaScript de paiement Mobile Money pour l'Afrique de l'Ouest.  
Modal plug-and-play — MTN, Orange, Moov, Wave, Carte bancaire.  
Compatible Vanilla JS, React, Vue, Svelte — sans dépendances.

🌐 **Documentation & démo** : [41devs-gateway.surge.sh](https://41devs-gateway.surge.sh)

---

## Installation

```bash
npm install @ibra69/41devs-gateway
```

> Node.js 20+, projet en ES modules (`"type": "module"` ou Vite/Webpack/Rollup).

---

## Deux modes d'intégration

### Mode AUTO — VEEP gère tout

Le SDK appelle directement l'API VEEP + AfribaPay. Zéro backend à écrire.

```js
import { createGateway } from '@ibra69/41devs-gateway'

// Seule votre publicKey VEEP est nécessaire — l'URL de l'API et la carte
// bancaire (KKiaPay) sont déjà configurées dans le SDK.
const gateway = createGateway({
  publicKey: 'vp_live_VOTRE_CLE_PUBLIQUE',
})

// Au clic sur un bouton
const result = await gateway.openPayment({
  eventId: 'uuid-de-l-evenement',
  ticketId: 'uuid-du-ticket',
  quantity: 1,
  amount: 25000,
  currency: 'XOF',
})

console.log('Commande confirmée :', result.orderNumber)
```

---

### Mode GÉNÉRIQUE — votre propre backend

Vous contrôlez les appels API. Le SDK gère uniquement la modal et le polling.

```js
import { createGateway } from '@ibra69/41devs-gateway'

const gateway = createGateway({
  onSubmit: async (formData) => {
    // formData : { fullPhone, email, prenom, nom, countryCode, ... }
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    return res.json() // Doit retourner { orderId, status }
  },

  onPoll: async (orderId) => {
    const res = await fetch(`/api/orders/${orderId}/status`)
    return res.json() // { status: 'CONFIRMED' | 'PENDING' | 'FAILED' }
  },

  onComplete: (result) => console.log('Paiement validé :', result),
  onError: (err) => console.error('Erreur :', err.message),
})

await gateway.openPayment({
  amount: 25000,
  currency: 'XOF',
  // Optionnel : restreindre les opérateurs affichés
  methods: ['MTN', 'Orange', 'Moov'],
})
```

---

## Via CDN (sans bundler)

```html
<script type="module">
  import { createGateway }
    from 'https://cdn.jsdelivr.net/npm/@ibra69/41devs-gateway@latest/index.js'

  const gateway = createGateway({ /* ... */ })

  document.getElementById('btn-pay').addEventListener('click', () => {
    gateway.openPayment({ amount: 5000, currency: 'XOF' })
  })
</script>
```

---

## Opérateurs supportés

En mode AUTO, les opérateurs mobile money (MTN, Orange, Moov, Wave...) sont chargés
dynamiquement selon le pays de l'acheteur. **La carte bancaire (Visa, Mastercard, Verve)
est toujours proposée en plus**, quel que soit le pays — paiement géré par le widget
KKiaPay (saisie carte, 3D Secure), le SDK ne voit jamais le numéro de carte/CVV.

Le nom, l'email et le téléphone déjà saisis dans le formulaire pré-remplissent
automatiquement le widget carte — l'acheteur n'a pas à les retaper.

---

## Options `createGateway`

| Option | Type | Description |
|--------|------|-------------|
| `publicKey` | `string` | Clé publique VEEP (mode AUTO) |
| `onSubmit` | `async (formData) => { orderId }` | Callback de soumission (mode GÉNÉRIQUE) |
| `onPoll` | `async (orderId) => { status }` | Callback de polling (mode GÉNÉRIQUE) |
| `onComplete` | `(result) => void` | Succès |
| `onError` | `(err) => void` | Erreur |
| `onCancel` | `() => void` | Annulation par l'utilisateur |
| `theme` | `'light' \| 'dark' \| 'auto'` | Thème (défaut : `'auto'`) |
| `logoUrl` | `string` | Logo affiché dans la modal |
| `colors` | `object` | Couleurs personnalisées |

## Options `openPayment`

| Option | Type | Description |
|--------|------|-------------|
| `amount` | `number` | Montant en centimes/unités |
| `currency` | `string` | Devise (`'XOF'`, `'XAF'`, etc.) |
| `methods` | `string[]` | Opérateurs à afficher (optionnel) |
| `eventId` | `string` | ID événement VEEP (mode AUTO) |
| `ticketId` | `string` | ID ticket VEEP (mode AUTO) |
| `quantity` | `number` | Quantité (mode AUTO, défaut : 1) |

> En mode AUTO, si l'événement n'a pas d'image de couverture (ou que l'URL échoue à
> charger), une image VEEP par défaut s'affiche automatiquement — jamais de zone vide.

---

## Gestion des erreurs

```js
import { createGateway, PAYMENT_CANCELLED_CODE } from '@ibra69/41devs-gateway'

try {
  const result = await gateway.openPayment({ amount: 5000, currency: 'XOF' })
  console.log('Succès :', result)
} catch (err) {
  if (err?.code === PAYMENT_CANCELLED_CODE) {
    console.log('Utilisateur a annulé')
  } else {
    console.error('Erreur paiement :', err.message)
  }
}
```

---

## Développement

```bash
git clone https://github.com/Jorgo69/41devs-gateway.git
cd 41devs-gateway
npm test        # Vitest — 30+ tests
```

---

**41DEVS** — [GitHub](https://github.com/Jorgo69/41devs-gateway) · [npm](https://www.npmjs.com/package/@ibra69/41devs-gateway)
