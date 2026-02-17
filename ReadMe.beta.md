# 41devs-gateway (beta)

Version **beta** pour les testeurs. SDK de paiement 41 Devs : popup MTN, Moov, Celtis, carte bancaire. Compatible Vue, React, Svelte, JS vanilla.

---

## En bref : pour voir que ça marche

- Le SDK **n’affiche rien** dans la console tout seul.
- **C’est à vous** d’ajouter `console.log` dans un `.then(...)` (succès) et un `.catch(...)` (annulation ou erreur) après chaque `gateway.openPayment(...)`.
- Si vous ne mettez pas de `.then` / `.catch` avec un log, vous ne verrez aucun message après avoir validé ou annulé le paiement — **copiez-collez les exemples ci-dessous** pour avoir le bon code du premier coup.

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

## Retour de `openPayment` (Promise)

`gateway.openPayment(options)` retourne une **Promise** :

- **Résolue** quand l'utilisateur valide le formulaire (paiement simulé en beta).  
  Payload typique :  
  `{ success: true, method, amount, currency, paymentReference?, ...customerData }`  
  (Mobile : `countryCode`, `fullPhone`, `prenom`, `nom`, `email`, `telephone` ; Carte : `email` uniquement, pas de données sensibles.)

- **Rejetée** si l'utilisateur annule (bouton Annuler ou fermeture par la croix).  
  Erreur : `{ code: 'CANCELLED', message: '...' }`.  
  Pour distinguer l'annulation d'une autre erreur, comparez `err.code` à la constante exportée :

**Le SDK ne fait aucun log.** Pour voir le résultat en console, vous **devez** appeler `.then()` et `.catch()` et y mettre vos propres `console.log` (voir exemples ci-dessous).

---

## Exemples à copier-coller (avec logs en console)

Chaque exemple est complet : après un clic sur le bouton, si vous **validez** le formulaire → vous verrez `Paiement réussi` + l’objet en console ; si vous **annulez** (bouton Annuler ou croix) → vous verrez `Annulé par l'utilisateur`. Sans le `.then()` et `.catch()` ci-dessous, vous ne verriez rien.

---

### Vanilla JS + HTML

Un seul fichier HTML. Avec un projet Vite (ou autre bundler), placez ce code dans votre point d’entrée ; le script doit être en `type="module"` et le projet doit résoudre le module `41devs-gateway`.

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
    import { createGateway, PAYMENT_CANCELLED_CODE } from '41devs-gateway'

    const gateway = createGateway({
      publicKey: 'pk_xxx',
      environment: 'sandbox',
    })

    document.getElementById('pay-btn').addEventListener('click', () => {
      gateway
        .openPayment({
          amount: 1000,
          currency: 'XOF',
          customerName: 'Client',
        })
        .then((result) => {
          console.log('Paiement réussi', result)
        })
        .catch((err) => {
          if (err?.code === PAYMENT_CANCELLED_CODE) {
            console.log('Annulé par l\'utilisateur')
          } else {
            console.error('Erreur', err)
          }
        })
    })
  </script>
</body>
</html>
```

---

### Vue 3 (Composition API)

Copiez-collez ce composant. Au clic : si vous validez le formulaire → `Paiement réussi` en console ; si vous annulez → `Annulé par l'utilisateur`.

```vue
<template>
  <button type="button" @click="openPaymentModal">Payer maintenant</button>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { createGateway, PAYMENT_CANCELLED_CODE } from '41devs-gateway'

const gateway = ref(null)

onMounted(() => {
  gateway.value = createGateway({
    publicKey: 'pk_xxx',
    environment: 'sandbox',
  })
})

function openPaymentModal() {
  gateway.value
    ?.openPayment({
      amount: 1000,
      currency: 'XOF',
      customerName: 'Client',
    })
    ?.then((result) => {
      console.log('Paiement réussi', result)
    })
    ?.catch((err) => {
      if (err?.code === PAYMENT_CANCELLED_CODE) {
        console.log('Annulé par l\'utilisateur')
      } else {
        console.error('Erreur', err)
      }
    })
}
</script>
```

---

### React

Copiez-collez ce composant. Au clic : si vous validez le formulaire → `Paiement réussi` en console ; si vous annulez → `Annulé par l'utilisateur`.

```jsx
import { useRef, useEffect } from 'react'
import { createGateway, PAYMENT_CANCELLED_CODE } from '41devs-gateway'

export default function PayButton() {
  const gatewayRef = useRef(null)

  useEffect(() => {
    gatewayRef.current = createGateway({
      publicKey: 'pk_xxx',
      environment: 'sandbox',
    })
  }, [])

  const handleClick = () => {
    const promise = gatewayRef.current?.openPayment({
      amount: 1000,
      currency: 'XOF',
      customerName: 'Client',
    })
    if (promise) {
      promise
        .then((result) => {
          console.log('Paiement réussi', result)
        })
        .catch((err) => {
          if (err?.code === PAYMENT_CANCELLED_CODE) {
            console.log('Annulé par l\'utilisateur')
          } else {
            console.error('Erreur', err)
          }
        })
    }
  }

  return <button type="button" onClick={handleClick}>Payer maintenant</button>
}
```

---

## Vérifier que ça marche (checklist)

1. Copiez un des exemples ci-dessus (Vanilla, Vue ou React) dans votre projet.
2. Lancez l’app et ouvrez la **console** du navigateur (F12 → onglet Console).
3. Cliquez sur le bouton **Payer maintenant** → la fenêtre de paiement s’ouvre.
4. **Si vous validez** le formulaire (choisir un moyen, remplir, cliquer « Confirmer le paiement ») → en console vous devez voir : `Paiement réussi` puis l’objet avec `success`, `method`, `amount`, etc.
5. **Si vous annulez** (bouton Annuler ou croix ×) → en console vous devez voir : `Annulé par l'utilisateur`.

Si vous ne voyez rien en console, vérifiez que vous avez bien le `.then(...)` et le `.catch(...)` avec les `console.log` comme dans les exemples.

---

## Options utiles

- **createGateway** : `{ publicKey, environment, theme, logoUrl, merchantLogoUrl, colors: { light: { primary }, dark: { primary } } }`
- **openPayment** : `{ amount, currency, customerName, paymentReference }` — retourne une **Promise** (voir ci-dessus).
- **Export** : `createGateway`, `create41DevsGateway`, `PAYMENT_CANCELLED_CODE` (pour détecter l'annulation dans le `.catch()`).

En production, **amount** et **currency** doivent venir du backend (session de paiement). **secretKey** reste uniquement côté serveur.

---

Documentation complète (API détaillée, workflow branches) : branche **main** du dépôt.

---

## Développement

Pour contribuer ou vérifier le SDK en local : `npm test` (Vitest + jsdom). Voir `tests/README.md` pour la couverture.
