# components

Briques d'interface : bouton fermer (X), signature, ligne de logos, champs formulaire, select pays. Creation d'elements DOM et ajout au conteneur fourni.

## Helpers.js

- **addCloseX(container, palette, onClose)** : ajoute un bouton croix en haut a droite. Au clic appelle onClose. Parametres : element conteneur, objet palette, fonction sans argument.
- **addSignature(container, palette)** : ajoute le texte "Propulse par 41 Devs" en bas. Parametres : conteneur, palette.
- **addLogoRow(container, config, palette)** : ajoute une ligne avec logo(s). config : logoUrl, merchantLogoUrl, useDefault41DevLogo. Si rien n'est configure, affiche le logo 41 Devs par defaut.
- **createInput(palette, labelText, options)** : cree un champ avec label. options : type, placeholder, autocomplete. Retourne { wrapper, input }.
- **createCountrySelect(palette, countries)** : cree un select pays. Retourne { wrapper, select, getSelectedCountry }.

Utilise par core (openPayment) pour la version main ; et par steps en version beta.
