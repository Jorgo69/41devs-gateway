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
  - `AFRIBAPAY_TO_VEEP_METHOD` — mapping code opérateur (`mtn`, `card`, ...) → enum `PaymentMethod` VEEP, utilisé pour construire le body de `POST /orders`.
  - `CARD_OPERATOR_CODES` — codes considérés comme carte bancaire (`['card']`).
  - `DEFAULT_VEEP_API_BASE_URL` — URL de l'API VEEP figée par défaut dans `createGateway` (l'intégrateur ne la fournit jamais).
  - `VEEP_KKIAPAY_PUBLIC_KEY` — clé publique KKiaPay de VEEP (pas celle de l'intégrateur) pour le widget carte. Sûre à exposer côté client.
  - `KKIAPAY_SCRIPT_URL` — URL du script du widget KKiaPay, chargé dynamiquement uniquement quand "Carte bancaire" est choisi.
  - `DEFAULT_EVENT_COVER_DATA_URI` — cover par défaut (WebP embarqué en base64, ~7 Ko) affichée quand l'événement n'a pas de `cover_url` ou que celle-ci échoue à charger.
- **N’attend rien** (pas de paramètres) : ce sont des exports directs.
- **Utilisé par** : theme, components, steps, core (openPayment, createGateway, kkiapayWidget).
