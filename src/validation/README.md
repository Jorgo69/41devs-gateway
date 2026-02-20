# validation

Fonctions de validation des champs formulaire. Logique pure, pas de DOM. Chaque fonction retourne un objet { valid: boolean, error?: string }.

## index.js

- **validateEmail(email)** : verifie non vide et format email. Retourne valid true ou false avec message d'erreur.
- **validatePhoneForCountry(country, phoneDigits)** : verifie que le pays est fourni et que le nombre de chiffres est entre minPhoneLength et maxPhoneLength du pays.
- **validateCardNumber(cardNumberRaw)** : verifie 12 a 19 chiffres.
- **validateExpiry(expiryRaw)** : verifie format MM/AA et mois entre 1 et 12.
- **validateCvv(cvvRaw)** : verifie 3 ou 4 chiffres.

Utilise par les etapes formulaire en version beta. Non utilise dans la version main (fenetre vide).
