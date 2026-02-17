# constants

Constantes et données par défaut du SDK (codes, logo, pays, palettes).

## index.js

- **Rôle** : centralise tout ce qui est invariant (pas de DOM, pas d’appel réseau).
- **Exporte** :
  - `PAYMENT_CANCELLED_CODE` — chaîne `'CANCELLED'` pour détecter l’annulation dans le `.catch()`.
  - `DEFAULT_41DEV_LOGO_SVG` — SVG inline du logo 41 Devs (currentColor).
  - `MOBILE_MONEY_METHODS` — liste des moyens considérés comme Mobile Money (MTN, Moov, Celtis).
  - `isMobileMoney(method)` — retourne `true` si le moyen est Mobile Money.
  - `DEFAULT_COUNTRIES` — liste de pays (code, nom, indicatif, longueur min/max téléphone).
  - `DEFAULT_PALETTE_DARK` / `DEFAULT_PALETTE_LIGHT` — couleurs par défaut pour thème sombre/clair.
- **N’attend rien** (pas de paramètres) : ce sont des exports directs.
- **Utilisé par** : theme, components, steps, core (openPayment).
