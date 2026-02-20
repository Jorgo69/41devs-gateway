# Structure du code source (src)

Chaque dossier contient un README qui decrit le role des fichiers, ce qu'ils recoivent et ce qu'ils renvoient.

- **constants** : codes, logo, pays par defaut, palettes clair/sombre, isMobileMoney.
- **theme** : getEffectiveTheme, buildPalette (theme auto/light/dark et couleurs).
- **overlay** : getOrCreateOverlay, closeOverlay (conteneur plein ecran).
- **validation** : validateEmail, validatePhoneForCountry, validateCardNumber, validateExpiry, validateCvv (version beta).
- **components** : addCloseX, addSignature, addLogoRow, createInput, createCountrySelect (Helpers.js).
- **core** : openPayment (affichage du modal), createGateway (API publique).

Le point d'entree du package est le fichier index.js a la racine du projet, qui re-exporte src/index.js.
