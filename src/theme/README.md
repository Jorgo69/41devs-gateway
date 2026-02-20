# theme

Calcul du theme effectif (clair ou sombre) et construction de la palette de couleurs.

## index.js

- **getEffectiveTheme(requestedTheme)** : retourne "light" ou "dark". Si requestedTheme vaut "auto", utilise la preference systeme (prefers-color-scheme). Parametre : chaine "light", "dark" ou "auto".
- **buildPalette(effectiveTheme, customColors)** : retourne un objet palette (toutes les cles de couleur pour le modal). Si customColors contient une couleur primaire pour le theme actuel, elle remplace primaryButtonBg. Parametres : "light" ou "dark", et optionnellement un objet avec light.primary et/ou dark.primary.

Utilise par core (openPayment).
