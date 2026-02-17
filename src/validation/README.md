# validation

Règles de validation des formulaires (email, téléphone, carte). Logique pure, pas de DOM.

## index.js

- **Rôle** : valider les champs saisis et retourner un résultat exploitable par les steps (affichage d’erreur).
- **Exporte** (toutes les fonctions retournent `{ valid: boolean, error?: string }`) :
  - `validateEmail(email)` — champs requis + format email.
  - `validatePhoneForCountry(country, phoneDigits)` — pays requis + longueur du numéro (chiffres seuls) selon le pays.
  - `validateCardNumber(cardNumberRaw)` — 12 à 19 chiffres.
  - `validateExpiry(expiryRaw)` — format MM/AA, mois 1–12.
  - `validateCvv(cvvRaw)` — 3 ou 4 chiffres.
- **Reçoit** : les valeurs brutes (chaînes ou objet pays).
- **Retourne** : `{ valid: true }` ou `{ valid: false, error: 'Message utilisateur' }`.
- **Utilisé par** : steps (step2).
