# components

Briques d’interface réutilisables : boutons, champs, logos, signature. Création d’éléments DOM et ajout au conteneur fourni.

## Helpers.js

- **Rôle** : fournir des fonctions qui créent et attachent des éléments au DOM (modal, formulaire), en utilisant la palette de couleurs.
- **Reçoit** (selon la fonction) : un conteneur `HTMLElement`, la `palette`, des options (config logos, label, placeholder, etc.).
- **Exporte** :
  - `addCloseX(container, palette, onClose)` — ajoute le bouton fermer (×) en haut à droite, appelle `onClose` au clic.
  - `addSignature(container, palette)` — ajoute le texte « Propulsé par 41 Devs » en bas.
  - `addLogoRow(container, config, palette)` — ajoute une ligne de logos (config : logoUrl, merchantLogoUrl, useDefault41DevLogo). Utilise le logo 41 Devs par défaut si besoin.
  - `createInput(palette, labelText, options)` — retourne `{ wrapper, input }` pour un champ avec label (options : type, placeholder, autocomplete).
  - `createCountrySelect(palette, countries)` — retourne `{ wrapper, select, getSelectedCountry }` pour le sélecteur de pays.
- **Retourne** : soit rien (éléments ajoutés au conteneur), soit un objet avec les nœuds créés et des accesseurs (ex. `getSelectedCountry`).
- **Utilisé par** : steps (step1, step2).
