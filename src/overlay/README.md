# overlay

Gestion du conteneur plein ecran (overlay) qui porte le modal. Creation et suppression dans le DOM.

## index.js

- **getOrCreateOverlay()** : retourne l'element overlay existant ou en cree un (div fixe, plein ecran, centre, z-index 9999) et l'ajoute au body. Pas de parametre.
- **closeOverlay()** : supprime l'element overlay du DOM s'il existe. Pas de parametre.

Contexte navigateur (document, body). Utilise par core (openPayment).
