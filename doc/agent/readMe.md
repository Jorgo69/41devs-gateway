# 41devs-gateway — Exemples d’utilisation (copier-coller)

Au clic : fenêtre vide avec logo 41 Devs, « Propulsé par 41 Devs », Annuler et X.

---

## Installation

```bash
npm install github:Jorgo69/41devs-gateway#main
```

---

## Vanilla JS + HTML

```html
<button type="button" id="pay-btn">Ouvrir</button>
<script type="module">
  import { createGateway } from '41devs-gateway'

  const gateway = createGateway({
    publicKey: 'pk_xxx',
    environment: 'sandbox',
  })

  document.getElementById('pay-btn').addEventListener('click', () => {
    gateway.openPayment({})
  })
</script>
```

---

## Vue 3 (Composition API)

```vue
<template>
  <button type="button" @click="ouvrir">Ouvrir</button>
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

function ouvrir() {
  gateway.value?.openPayment({})
}
</script>
```

---

## React

```jsx
import { useRef, useEffect } from 'react'
import { createGateway } from '41devs-gateway'

export default function OuvrirButton() {
  const gatewayRef = useRef(null)

  useEffect(() => {
    gatewayRef.current = createGateway({
      publicKey: 'pk_xxx',
      environment: 'sandbox',
    })
  }, [])

  return (
    <button type="button" onClick={() => gatewayRef.current?.openPayment({})}>
      Ouvrir
    </button>
  )
}
```

---

Projet en ES modules (Vite, Webpack ou `"type": "module"`).
