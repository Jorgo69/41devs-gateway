# overlay

Gestion du conteneur plein écran qui porte le modal de paiement (création / suppression).

## index.js

- **Rôle** : créer ou récupérer l’élément overlay, et le retirer du DOM à la fermeture.
- **Exporte** :
  - `getOrCreateOverlay()`  
    - **Reçoit** : rien.  
    - **Retourne** : `HTMLElement` (div plein écran, id `fdg-overlay`). Crée l’élément s’il n’existe pas, sinon le réutilise.
  - `closeOverlay()`  
    - **Reçoit** : rien.  
    - **Effet** : supprime l’overlay du DOM s’il existe.
- **Contexte** : exécution navigateur (`document`, `document.body`).
- **Utilisé par** : core (openPayment).
