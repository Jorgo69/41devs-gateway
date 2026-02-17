# Structure du code source

Organisation du SDK par dossiers. Chaque dossier contient un README qui décrit le rôle des fichiers, ce qu’ils reçoivent et ce qu’ils renvoient.

| Dossier | Rôle |
|--------|------|
| **constants/** | Codes, logo, pays par défaut, palettes, `isMobileMoney` |
| **theme/** | Thème effectif (light/dark/auto), construction de la palette |
| **overlay/** | Création / suppression du conteneur plein écran |
| **validation/** | Validation email, téléphone, carte (numéro, expiration, CVV) |
| **components/** | Briques UI : fermer, signature, logos, champs, sélecteur pays (Helpers.js) |
| **steps/** | step1 = choix du moyen ; step2 = formulaire Mobile Money ou Carte |
| **core/** | openPayment (orchestration + Promise), createGateway (API publique) |

Point d’entrée du package : **racine `index.js`** (ré-exporte `src/index.js`).
