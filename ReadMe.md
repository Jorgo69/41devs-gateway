# 41devs-gateway

SDK de paiement (passerelle) pour le projet **41 Devs**. Popup de paiement avec choix du moyen (MTN, Moov, Celtis, carte bancaire), saisie des infos (pays, téléphone, email, etc.) et validation côté front.

**Ce SDK est indépendant du framework** : il fonctionne avec **Vue.js**, **React**, **Svelte**, ou du **JavaScript vanilla** (HTML + JS). Même API partout : `createGateway()` ou `create41DevsGateway()` + `openPayment()`.

---

## Noms des fonctions et conflits

Les noms `createGateway` et `openPayment` sont volontairement courts. Si ton projet utilise déjà les mêmes noms (un autre SDK, ton propre code), tu peux :

- **Utiliser l’alias namespacé** (recommandé pour éviter les conflits) :
  ```js
  import { create41DevsGateway } from '41devs-gateway'
  const gateway = create41DevsGateway({ publicKey: 'pk_xxx' })
  gateway.openPayment({ amount: 1000, currency: 'XOF' })
  ```
- **Ou renommer à l’import** :
  ```js
  import { createGateway as create41DevsGateway } from '41devs-gateway'
  ```

---

## Installation

### Via GitHub (pour tester avant publication npm)

- **Version stable (main)** :
  ```bash
  npm install github:Jorgo69/41devs-gateway#main
  ```
- **Version en test (beta)** — pour les testeurs, évolue avec les mises à jour :
  ```bash
  npm install github:Jorgo69/41devs-gateway#beta
  ```

### Via npm (quand le package sera publié)

```bash
npm install 41devs-gateway
```

### Branches

| Branche | Usage |
|---------|--------|
| **main** | Version stable. |
| **beta** | Version pour les testeurs. Tu merges dedans quand c’est prêt à être testé ; quand c’est validé, tu merges beta → main. |

---

## Prérequis

- **Node.js 20** (voir `.nvmrc`). Lancer `nvm use` dans le dossier du projet.
- Projet avec support des **ES modules** (`"type": "module"` dans `package.json` ou bundler type Vite/Webpack).

---

## Utilisation rapide

En **JavaScript (ou TypeScript)** :

```js
import { createGateway } from '41devs-gateway'

// 1. Créer la gateway une fois (au chargement de l’app ou au montage du composant)
const gateway = createGateway({
  publicKey: 'pk_votre_cle_publique',
  environment: 'sandbox', // ou 'production'
})

// 2. Ouvrir la popup de paiement (par ex. au clic sur un bouton)
function onPayer() {
  gateway.openPayment({
    amount: 1000,
    currency: 'XOF',
    customerName: 'Client',
    // En production : amount + currency viennent du backend (session de paiement)
  })
}
```

Dans le **HTML**, attacher `onPayer` à un bouton :

```html
<button type="button" onclick="onPayer()">Payer</button>
```

La popup s’ouvre, l’utilisateur choisit un moyen de paiement (MTN, Moov, Celtis, carte), remplit le formulaire (pays, prénom, nom, email, téléphone ou carte), et soumet. Les données sont ensuite à envoyer à ton backend.

---

## Cas d’utilisation avec exemples de code

### 1. Où ajouter l’appel ? (bouton « Payer »)

L’idée est toujours la même : **créer la gateway une fois**, puis appeler **`gateway.openPayment(...)`** au moment où l’utilisateur déclenche le paiement (clic sur un bouton, validation d’un panier, etc.).

---

### 2. Exemple en **Vue.js** (Composition API)

```vue
<script setup>
import { createGateway } from '41devs-gateway'

const gateway = createGateway({
  publicKey: 'pk_xxx',
  environment: 'sandbox',
  colors: { light: { primary: '#2563eb' }, dark: { primary: '#3b82f6' } },
})

const payer = () => {
  gateway.openPayment({
    amount: 5000,
    currency: 'XOF',
    customerName: 'Client',
  })
}
</script>

<template>
  <button type="button" @click="payer">Payer 5000 XOF</button>
</template>
```

Avec **Options API** : créer `gateway` dans `data()` ou `created()`, et appeler `gateway.openPayment(...)` dans une méthode liée au clic.

---

### 3. Exemple en **React**

```jsx
import { useMemo } from 'react'
import { createGateway } from '41devs-gateway'

function Checkout() {
  const gateway = useMemo(
    () =>
      createGateway({
        publicKey: 'pk_xxx',
        environment: 'sandbox',
      }),
    []
  )

  const handlePay = () => {
    gateway.openPayment({
      amount: 5000,
      currency: 'XOF',
      customerName: 'Client',
    })
  }

  return <button type="button" onClick={handlePay}>Payer</button>
}
```

---

### 4. Exemple en **Svelte**

```svelte
<script>
  import { createGateway } from '41devs-gateway'

  const gateway = createGateway({
    publicKey: 'pk_xxx',
    environment: 'sandbox',
  })

  function payer() {
    gateway.openPayment({
      amount: 5000,
      currency: 'XOF',
      customerName: 'Client',
    })
  }
</script>

<button type="button" on:click={payer}>Payer</button>
```

---

### 5. Montant et devise venant du **backend** (recommandé en production)

Le front ne doit pas inventer le montant ni la devise ; ils viennent d’une **session de paiement** créée côté serveur.

```js
// Côté front : après avoir reçu la réponse du backend (création de session)
const session = await fetch('/api/create-payment-session', {
  method: 'POST',
  body: JSON.stringify({ orderId: '123' }),
}).then((r) => r.json())

// session = { paymentReference: 'tx_abc', amount: 5000, currency: 'XOF' }

gateway.openPayment({
  paymentReference: session.paymentReference,
  amount: session.amount,
  currency: session.currency,
  customerName: session.customerName,
})
```

À la soumission du formulaire dans la popup, ton front enverra `paymentReference` (et les infos collectées) au backend pour finaliser le paiement.

---

### 6. Personnaliser logos et couleurs

```js
const gateway = createGateway({
  publicKey: 'pk_xxx',
  logoUrl: 'https://example.com/logo-41devs.svg',
  merchantLogoUrl: 'https://maboutique.com/logo.svg',
  colors: {
    light: { primary: '#0d9488' },
    dark: { primary: '#2dd4bf' },
  },
  theme: 'auto', // 'light' | 'dark' | 'auto'
})
```

Sans `logoUrl` ni `merchantLogoUrl`, le logo 41 Devs par défaut s’affiche (couleur = couleur primaire ci-dessus).

---

## API / Options

Le package exporte :
- **`createGateway`** — nom court (peut entrer en conflit avec le code du dev).
- **`create41DevsGateway`** — alias recommandé pour éviter les conflits.

Les deux renvoient le même objet `{ openPayment }`.

### `createGateway(config)` / `create41DevsGateway(config)`

| Option | Type | Description |
|--------|------|-------------|
| `publicKey` | `string` | Clé publique (obligatoire en prod). |
| `environment` | `'sandbox' \| 'production'` | Environnement. |
| `theme` | `'light' \| 'dark' \| 'auto'` | Thème de la popup (défaut : `'auto'`). |
| `logoUrl` | `string` | URL du logo 41 Devs (remplace le défaut). |
| `merchantLogoUrl` | `string` | URL du logo du marchand. |
| `colors` | `{ light?: { primary?: string }, dark?: { primary?: string } }` | Couleur principale (bouton, logo). |
| `useDefault41DevLogo` | `boolean` | Afficher le logo 41 Devs par défaut (défaut : `true`). |
| `countries` | `Array<{ code, name, flag, dial, minPhoneLength, maxPhoneLength }>` | Liste pays (optionnel, liste par défaut fournie). |

### `gateway.openPayment(options)`

| Option | Type | Description |
|--------|------|-------------|
| `amount` | `number` | Montant (à recevoir du backend en prod). |
| `currency` | `string` | Devise (ex. `'XOF'`, à recevoir du backend en prod). |
| `customerName` | `string` | Nom du client (affiché dans la popup). |
| `paymentReference` | `string` | Référence de la session de paiement (backend). |
| `methods` | `string[]` | Moyens de paiement (défaut : MTN, Moov, Celtis, Carte bancaire). |

Les options de `createGateway` peuvent être surchargées par `openPayment` (ex. `amount`, `currency`, `customerName`).

---

## Sécurité et bonnes pratiques

### Clés (minimum 2)

- **publicKey** : seule clé utilisée côté front (`createGateway({ publicKey: 'pk_...' })`).
- **secretKey** : **uniquement côté backend**, jamais exposée dans le front ni passée au SDK.

### Montant et devise

En production, **amount** et **currency** doivent toujours venir du **backend** (création de session de paiement), pas du front, pour éviter toute manipulation.

### Email et facture

Un champ **Email** est demandé dans la popup (mobile money et carte) pour l’envoi de la facture / reçu au client. Il est obligatoire et validé (format email).

### Signature

La mention **« Propulsé par 41 Devs »** s’affiche en bas de la popup (nom de la boîte). « 41devs-gateway » est le nom du produit.

---

## Prérequis Node.js (développement du package)

La version de Node est définie dans `.nvmrc` (ici : **20**).

- Lancer la bonne version : `nvm use`
- Si Node 20 n’est pas installé, `nvm use` déclenche l’installation automatiquement.

### Chargement automatique de la version (optionnel)

Pour que la version soit chargée automatiquement dans le dossier du projet, ajoute le script correspondant à la fin de **~/.bashrc** (Bash) ou **~/.zshrc** (Zsh).

**Bash** :

```bash
load-nvmrc() {
  local nvmrc_path
  nvmrc_path="$(nvm_find_nvmrc)"
  if [ -n "$nvmrc_path" ]; then
    local node_version
    node_version="$(cat "$nvmrc_path")"
    if [ "$(nvm version "$node_version")" = "N/A" ]; then
      nvm install "$node_version"
    fi
    if [ "$(nvm current)" != "$node_version" ]; then
      nvm use "$node_version" >/dev/null
    fi
  fi
}
PROMPT_COMMAND="load-nvmrc; $PROMPT_COMMAND"
```

**Zsh** : voir la doc [nvm](https://github.com/nvm-sh/nvm#deeper-shell-integration) (hook `chpwd`).

---

## Tester le package en local (`npm link`)

Dans le dossier du package **41devs-gateway** :

```bash
npm link
```

Dans un projet de test (Vue, React, Svelte ou vanilla) :

```bash
npm link 41devs-gateway
```

Puis importer : `import { createGateway } from '41devs-gateway'` (ou `create41DevsGateway`) et utiliser comme dans les exemples ci-dessus. Si tu avais déjà lié l’ancien nom `41dev-gateway`, supprime le lien puis relance avec `41devs-gateway`.

---

## Licence

ISC.
