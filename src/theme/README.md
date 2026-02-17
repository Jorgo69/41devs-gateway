# theme

Calcul du thème effectif et de la palette de couleurs (sans DOM, sauf `getEffectiveTheme` qui lit `prefers-color-scheme`).

## index.js

- **Rôle** : à partir de la config (theme demandé + couleurs custom), fournir la palette utilisée par tout le modal.
- **Exporte** :
  - `getEffectiveTheme(requestedTheme)`  
    - **Reçoit** : `'light' | 'dark' | 'auto'`.  
    - **Retourne** : `'light' | 'dark'`. En `'auto'`, utilise `window.matchMedia('(prefers-color-scheme: dark)')`.
  - `buildPalette(effectiveTheme, customColors)`  
    - **Reçoit** : thème effectif + optionnel `{ light?: { primary }, dark?: { primary } }`.  
    - **Retourne** : objet palette (overlayBg, modalBg, textPrimary, etc.) avec éventuelle couleur primaire personnalisée.
- **Utilisé par** : core (openPayment).
