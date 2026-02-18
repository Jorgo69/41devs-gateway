# 41devs-gateway

Package npm : au clic, ouvre une **fenêtre vide** avec le **logo 41 Devs**, la signature « Propulsé par 41 Devs », le bouton **Annuler** et le **X** pour fermer. Aucun champ, aucun formulaire à l’intérieur.

---

## Installation

```bash
npm install github:Jorgo69/41devs-gateway#main
```

Ou après publication npm : `npm install 41devs-gateway`

---

## Utilisation

1. Crée la gateway une fois.
2. Au clic (bouton ou autre), appelle `gateway.openPayment({ amount, currency })`.
3. La fenêtre s’ouvre ; l’utilisateur peut fermer avec Annuler ou X.

**Exemple à copier-coller (HTML + JS) :**

```html
<button type="button" id="pay-btn">Payer</button>
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
    })
  })
</script>
```

Projet en ES modules (Vite, Webpack, ou `"type": "module"` dans `package.json`).
