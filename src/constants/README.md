# constants

Constantes et donnees par defaut du SDK (codes, logo SVG, pays, palettes de couleurs).

## index.js

- **PAYMENT_CANCELLED_CODE** : chaine "CANCELLED", utilisee en version beta pour identifier l'annulation dans un .catch().
- **DEFAULT_41DEV_LOGO_SVG** : logo 41 Devs en SVG inline (currentColor pour s'adapter au theme).
- **MOBILE_MONEY_METHODS** : tableau des moyens consideres comme Mobile Money (MTN, Moov, Celtis).
- **isMobileMoney(method)** : fonction qui retourne true si method est dans MOBILE_MONEY_METHODS.
- **DEFAULT_COUNTRIES** : liste d'objets pays (code, name, flag, dial, minPhoneLength, maxPhoneLength).
- **DEFAULT_PALETTE_DARK** : objet des couleurs pour le theme sombre (overlayBg, modalBg, textPrimary, etc.).
- **DEFAULT_PALETTE_LIGHT** : objet des couleurs pour le theme clair.

Aucun parametre : ce sont des exports. Utilise par theme, components et core.
