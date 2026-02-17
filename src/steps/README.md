# steps

Étapes du flux de paiement : choix du moyen (step1), puis formulaire correspondant (step2). Chaque step remplit le même modal et s’appuie sur le contexte partagé.

## step1.js

- **Rôle** : afficher l’écran de choix du moyen de paiement (MTN, Moov, Celtis, Carte bancaire), le montant et les boutons Annuler / choix.
- **Exporte** : `renderStep1(ctx)`.
- **Reçoit** : `ctx` avec au moins `modal`, `finalConfig`, `baseConfig`, `palette`, `countries`, `onCancel`, `onMethodSelect`. `onMethodSelect(label)` est appelé au clic sur un moyen ; `onCancel()` au clic Annuler ou fermeture.
- **Prépare** : vide le modal, ajoute logos, titre, montant, grille de moyens, footer. N’a pas de retour (effet de bord sur le DOM).

## step2.js

- **Rôle** : afficher le formulaire de l’étape 2 (Mobile Money : pays, prénom, nom, email, téléphone ; Carte : email, numéro, expiration, CVV), avec Retour, Annuler et Confirmer.
- **Exporte** : `renderStep2(ctx, methodLabel)`.
- **Reçoit** : `ctx` (même forme que step1, avec en plus `onSuccess`, `onBack`) et `methodLabel` (chaîne du moyen choisi). À la soumission valide, appelle `onSuccess(result)` avec le payload (sans données sensibles carte). `onBack()` retourne à l’étape 1.
- **Prépare** : vide le modal, ajoute bouton Retour, titre, formulaire, validation via le module validation, footer. N’a pas de retour.

**Contexte partagé (ctx)** : construit dans core/openPayment.js ; contient modal, finalConfig, baseConfig, palette, countries, onSuccess, onCancel, onBack, onMethodSelect.
