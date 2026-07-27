# Structure du code source

Organisation du SDK par dossiers. Chaque dossier contient un README qui décrit le rôle des fichiers, ce qu’ils reçoivent et ce qu’ils renvoient.

| Dossier | Rôle |
|--------|------|
| **constants/** | Codes, logo, pays par défaut, palettes, `isMobileMoney` |
| **theme/** | Thème effectif (light/dark/auto), construction de la palette |
| **overlay/** | Création / suppression du conteneur plein écran |
| **validation/** | Validation email, téléphone (Helpers.js et la validation carte ne sont plus utilisés — saisie carte déléguée à KKiaPay) |
| **components/** | Skeleton.js (blocs de chargement shimmer) ; Helpers.js (inutilisé actuellement) |
| **steps/** | step0-tickets (cover+billets) ; step1 (formulaire + choix moyen) ; step3 (chargement) ; step4 (résultat) |
| **core/** | openPayment (orchestration + Promise), createGateway (API publique), kkiapayWidget (paiement carte) |

Point d’entrée du package : **racine `index.js`** (ré-exporte `src/index.js`).
