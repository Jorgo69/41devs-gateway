# steps

Étapes du flux de paiement, dans l'ordre : `step0-tickets.js` (cover + billets, mode AUTO avec event) → `step1.js` (coordonnées + moyen de paiement) → `step3.js` (chargement) → `step4.js` (succès/échec). Chaque step remplit le même `modal` et s'appuie sur le contexte partagé `ctx` construit dans `core/openPayment.js`.

## step0-tickets.js

- **Rôle** : cover de l'événement, description, liste des billets avec sélecteurs de quantité, total, CTA "Choisir mes billets". Mode générique : utilise `finalConfig.event`/`finalConfig.tickets` au lieu d'un fetch.
- **Exporte** : `renderStepEvent(ctx)`, plus des helpers partagés (`_ctaStyle`, `_buildFooter`, `_computeTotal`, `_formatTicketType`, `_formatEventDate`) réutilisés par `step1.js`.

## step1.js

- **Rôle** : formulaire prénom/nom/email/téléphone (avec sélecteur pays intégré) + choix de l'opérateur de paiement. Mode AUTO : opérateurs chargés depuis `GET /developer/public/operators?country=XX` (inclut "Carte bancaire" si l'API le retourne). Mode générique : liste statique `finalConfig.methods`.
- **Exporte** : `renderStep1(ctx)`.
- **Soumission** : appelle `ctx.onFormSubmit(formData)`. La carte bancaire n'a pas de formulaire dédié — même formulaire que Mobile Money ; la saisie carte est déléguée au widget KKiaPay (`core/kkiapayWidget.js`), jamais collectée par le SDK.

## step3.js

- **Rôle** : écran de chargement pendant l'appel API / le widget de paiement.

## step4.js

- **Rôle** : écran final (succès avec récapitulatif, ou échec avec bouton réessayer).

**Contexte partagé (ctx)** : modal, finalConfig, baseConfig, palette, isAutoMode, selectedOperator, selectedCountry, selectedQuantities, onProceed, onBack, onCancel, onFormSubmit.
