# core

Logique centrale : ouverture de la fenetre (openPayment) et API publique (createGateway).

## openPayment.js

- **openPayment(baseConfig, options)** : cree l'overlay et le modal, applique la palette, ajoute le logo, la signature "Propulse par 41 Devs", le bouton Annuler et la croix. options est optionnel (peut etre undefined). Ne retourne rien. Au clic Annuler ou croix, closeOverlay est appele.

Utilise par createGateway uniquement. Pas expose directement dans l'API du package.

## createGateway.js

- **createGateway(globalConfig)** : retourne un objet { openPayment }. openPayment(options) appelle openPayment(baseConfig, options). options optionnel.
- **create41DevsGateway** : alias de createGateway pour eviter les conflits de noms.

Utilise par src/index.js (re-export vers le package).
