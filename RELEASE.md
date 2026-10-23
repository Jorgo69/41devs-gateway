# Process de release — 41devs-gateway

Ce fichier documente le processus complet, dans l'ordre, pour publier une nouvelle version.
Pas publié sur npm (`package.json` → `files` ne liste que `index.js`/`src`, ce fichier reste local).

## Branches

- **`beta`** = branche de développement actif. C'est le contenu de `beta` qui est réellement
  publié sur npm — toujours développer et tester ici en premier.
- **`main`** = doit toujours être un **miroir exact** de `beta`. Ne jamais faire de commits
  indépendants sur `main` — c'est exactement ce qui a causé une divergence difficile à
  réconcilier en juillet 2026 (3 commits obsolètes sur main pendant que beta avançait).

### ⚠️ Piège à ne plus refaire : merger `beta` → `main`

**Ne jamais faire** `git merge origin/beta -X theirs` si `main` a des commits que `beta` n'a
pas. `-X theirs` ne résout que les hunks qui *se chevauchent* — si l'ancien code de `main` et
le nouveau de `beta` touchent des zones différentes du même fichier sans conflit détecté par
Git, **les deux survivent, mélangés** (ça a cassé `openPayment.js` avec du code mort
inatteignable). Vécu le 27/07/2026.

**Faire à la place** (remplacement propre, `main` = copie exacte de `beta`) :
```bash
git checkout main
git fetch origin
git reset --hard origin/beta
npm test                              # vérifier avant de pousser
git push origin main --force-with-lease
```
`--force-with-lease` (pas `--force` brut) : échoue proprement si quelqu'un d'autre a poussé
sur `origin/main` entre-temps, au lieu d'écraser silencieusement.

## Bump de version

```bash
# Éditer "version" dans package.json, puis :
npm install --package-lock-only        # resynchronise package-lock.json sans toucher aux deps
npm test
git add package.json package-lock.json
git commit -m "chore(release): bump version to X.Y.Z"
git push origin beta
```

## Piège fichiers : `README.md` vs `ReadMe.md`

Le repo utilise `ReadMe.md` (casse mixte), pas `README.md`. Sur un système de fichiers
insensible à la casse (macOS/APFS par défaut), les deux noms pointent vers **le même fichier
physique**. Ne jamais créer/supprimer l'un en pensant que c'est un doublon indépendant de
l'autre — vérifier d'abord avec `git ls-files | grep -i readme` (seul `ReadMe.md` doit être
suivi par git).

## Ordre complet d'une release

1. Développer + tester sur `beta` (`npm test`).
2. Commit + push sur `beta`.
3. Bump de version (voir ci-dessus) sur `beta`.
4. Merger `beta` → `main` (méthode `reset --hard`, voir ci-dessus) + push.
5. **Backend** (`api/`) : déployer les changements associés côté serveur si le SDK en dépend
   (ex : nouvelle route API) — **avant** de publier npm, sinon la fonctionnalité échoue
   proprement côté client jusqu'au déploiement (pas de crash, juste une erreur API).
6. `npm publish` (voir ci-dessous).
7. Déployer le docs-site (voir ci-dessous).

## npm publish — authentification

npm utilise l'**authentification par navigateur** (pas de code à 6 chiffres à saisir) :

```bash
npm whoami              # vérifie que tu es déjà connecté
npm publish
```

`npm publish` affiche une URL (`https://www.npmjs.com/auth/cli/xxx`) et propose d'appuyer sur
Entrée pour l'ouvrir dans le navigateur. Une fois approuvé côté navigateur (session déjà
connectée), la publication se termine automatiquement. **Doit être lancé dans un vrai
terminal interactif par l'utilisateur** — un agent ne peut pas compléter cette étape à la
place de l'utilisateur (pas d'accès à sa session navigateur).

Avant de publier, vérifier le contenu réel du paquet :
```bash
npm publish --dry-run
```

## Déployer le docs-site (surge.sh)

```bash
cd docs-site
npm run deploy    # = npm run build && npx surge dist/ --domain 41devs-gateway.surge.sh
```

Domaine fixe → **écrase/met à jour le site existant**, ne crée jamais une nouvelle URL.
Nécessite d'être connecté à surge (`npx surge whoami`).

Vérifier après déploiement (le CDN peut cacher un instant, mais le contenu doit être à jour) :
```bash
curl -sL https://41devs-gateway.surge.sh/assets/index-*.js | grep "un-texte-du-dernier-changement"
```
