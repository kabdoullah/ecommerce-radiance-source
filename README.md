# Source d'Éclat — boutique en ligne

Boutique e-commerce avec commande par WhatsApp et espace d'administration.
Next.js 16 (App Router, TypeScript strict, Tailwind CSS 4) + Supabase (PostgreSQL, Auth, Storage),
déployée sur Netlify.

- **Boutique** : accueil, catalogue (recherche, catégories, tri, pagination), fiches produits,
  panier conservé dans le navigateur, commande enregistrée en base **puis** envoyée sur WhatsApp.
- **Administration** (`/admin`) : tableau de bord, commandes (statuts, paiement, notes), produits
  (photos, prix, promotions, stock, mise en avant), catégories, avis clients, paramètres.
- **Guide de gestion pour la boutique** : [docs/GUIDE-PROPRIETAIRE.md](docs/GUIDE-PROPRIETAIRE.md).

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Installation locale](#2-installation-locale)
3. [Configuration du projet Supabase](#3-configuration-du-projet-supabase)
4. [Application des migrations SQL](#4-application-des-migrations-sql)
5. [Configuration du stockage](#5-configuration-du-stockage)
6. [Création sécurisée du premier administrateur](#6-création-sécurisée-du-premier-administrateur)
7. [Variables d'environnement](#7-variables-denvironnement)
8. [Lancement local](#8-lancement-local)
9. [Tests et vérifications](#9-tests-et-vérifications)
10. [Déploiement Netlify](#10-déploiement-netlify)
11. [Domaine et HTTPS](#11-domaine-et-https)
12. [Mise à jour du site](#12-mise-à-jour-du-site)
13. [Sauvegarde et export des données](#13-sauvegarde-et-export-des-données)
14. [Diagnostic des problèmes fréquents](#14-diagnostic-des-problèmes-fréquents)
15. [Limites connues de l'offre gratuite](#15-limites-connues-de-loffre-gratuite)
16. [Architecture et choix techniques](#16-architecture-et-choix-techniques)

---

## 1. Prérequis

- Node.js 20.9 ou plus récent (22 LTS recommandé) et npm.
- Un compte [GitHub](https://github.com), un compte [Supabase](https://supabase.com) et un compte
  [Netlify](https://www.netlify.com) (offres gratuites).
- Pour travailler en local avec une vraie base : [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  (la CLI Supabase est installée avec le projet : `npx supabase`).

## 2. Installation locale

```bash
git clone <url-du-dépôt> source-d-eclat
cd source-d-eclat
npm install
cp .env.example .env.local
```

## 3. Configuration du projet Supabase

1. Sur [supabase.com/dashboard](https://supabase.com/dashboard), créez un projet (région la plus
   proche de vos clients). Conservez le **mot de passe de la base** dans un gestionnaire de mots de passe.
2. **Authentication → Sign In / Providers** :
   - laissez **Email** activé (c'est ce qui permet aux administrateurs de se connecter) ;
   - **désactivez « Allow new users to sign up »** : personne ne peut créer de compte depuis
     l'extérieur. Les administrateurs sont créés à la main (section 6).
3. **Authentication → URL Configuration** : renseignez l'URL du site (Netlify ou votre domaine).
4. **Project Settings → API Keys** : copiez l'URL du projet et la clé **publishable**
   (`sb_publishable_…`). Sur un ancien projet, la clé `anon` fonctionne de la même façon.
   **Ne copiez jamais la clé secrète (`sb_secret_…` / `service_role`) dans ce projet** :
   l'application n'en a pas besoin.

## 4. Application des migrations SQL

Toute la base (tables, contraintes, politiques RLS, fonctions, bucket de stockage) est décrite dans
`supabase/migrations/`. Rien n'est à créer à la main dans le tableau de bord.

```bash
npx supabase login                                      # ouvre le navigateur
npx supabase link --project-ref <référence-du-projet>   # visible dans l'URL du tableau de bord
npx supabase db push                                    # applique les migrations
```

`db push` n'exécute **pas** `supabase/seed.sql` : la production démarre sans donnée de démonstration.

| Migration | Contenu |
| --- | --- |
| `20261020000001_schema.sql` | Tables, types, contraintes, index, paramètres par défaut |
| `20261020000002_security_and_functions.sql` | RLS, `create_order`, `submit_review`, règles de statut, bucket `store-media` |
| `20261020000003_storefront_content.sql` | Contenus de la maquette : icône de catégorie, accroche et fiche détaillée des produits, bandeau, signature, paiement, engagements |
| `20261020000004_explicit_grants.sql` | Droits explicites des rôles de l'API (indépendants de l'option « Automatically expose new tables ») |

Pour faire évoluer le schéma : `npx supabase migration new <nom>`, écrire le SQL, tester en local
(`npx supabase db reset` puis `npm run test:db`), puis `npx supabase db push`.

## 5. Configuration du stockage

La migration crée le bucket **`store-media`** :

- lecture publique (les photos sont visibles sur la boutique) ;
- envoi, remplacement et suppression réservés aux administrateurs (politiques sur `storage.objects`) ;
- 5 Mo maximum par fichier ; JPG, PNG, WebP et AVIF uniquement.

Les photos sont redimensionnées (1600 px max) et converties en WebP **dans le navigateur** avant
l'envoi, ce qui économise le quota gratuit. Les fichiers remplacés ou abandonnés sont supprimés à
l'enregistrement du produit ou des paramètres.

## 6. Création sécurisée du premier administrateur

Être connecté ne suffit pas : il faut une ligne dans la table `admin_profiles`, que personne ne
peut modifier depuis le site (aucune politique d'écriture).

1. **Authentication → Users → Add user → Create new user** : e-mail et mot de passe solide
   (12 caractères ou plus), cochez *Auto Confirm User*.
2. **SQL Editor**, exécutez (en remplaçant l'e-mail et le nom affiché) :

   ```sql
   insert into public.admin_profiles (id, display_name)
   select id, 'Prénom Nom' from auth.users where email = 'proprietaire@exemple.com';
   ```

3. Connectez-vous sur `https://<votre-site>/admin`.

Retirer un accès : `delete from public.admin_profiles where id = (select id from auth.users where email = '…');`
puis supprimez l'utilisateur dans *Authentication → Users*.
**Mot de passe oublié** : cette version n'a pas d'écran de réinitialisation ; créez un nouvel
utilisateur (étapes 1–2) puis supprimez l'ancien.

## 7. Variables d'environnement

| Variable | Obligatoire | Où la trouver |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | oui | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | oui | Supabase → API Keys → *publishable* |
| `NEXT_PUBLIC_SITE_URL` | non | URL publique sans `/` final. Sur Netlify, la variable `URL` est utilisée par défaut. |

Ces valeurs sont publiques par conception : la sécurité repose sur les politiques RLS.
Elles vont dans `.env.local` en local (ignoré par git) et dans Netlify
(*Site configuration → Environment variables*). Aucune clé secrète n'est nécessaire.

## 8. Lancement local

```bash
npx supabase start          # PostgreSQL, Auth et Storage dans Docker
npx supabase db reset       # migrations + données de démonstration
npm run dev                 # http://localhost:3000
```

`npx supabase start` affiche l'URL (`http://127.0.0.1:54321`) et la clé *publishable* à placer
dans `.env.local`. Les données de démonstration (`supabase/seed.sql`) contiennent des produits
marqués « (démo) » et un administrateur **local uniquement** : `admin@example.com` / `admin-local-2026`.

## 9. Tests et vérifications

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript strict
npm test            # Vitest : montants, panier, validations, statuts, message WhatsApp
npm run test:db     # pgTAP : RLS, droits admin, création de commande, stock, statuts
npm run build       # build de production
```

`npm run test:db` nécessite la stack locale démarrée et réinitialisée (`npx supabase db reset`).
Il vérifie notamment qu'un visiteur ne lit aucune commande, qu'un utilisateur connecté ne peut pas
se donner les droits admin, que les totaux sont recalculés depuis les prix en base, que le stock
est réservé puis restitué à l'annulation, et que les montants d'une commande sont verrouillés.

## 10. Déploiement Netlify

1. Poussez le dépôt sur GitHub.
2. Netlify → **Add new project → Import an existing project** → choisissez le dépôt.
   Netlify détecte Next.js et ajoute son adaptateur automatiquement (rien à installer).
   `netlify.toml` fixe la commande de build et la version de Node.
3. Ajoutez les variables de la section 7 **avant** le premier déploiement : le build lit le
   catalogue dans Supabase pour pré-générer les pages publiques.
4. Déployez, puis mettez à jour l'URL du site dans Supabase (*Authentication → URL Configuration*).

Chaque `git push` sur la branche principale redéploie le site.

## 11. Domaine et HTTPS

Netlify → *Domain management → Add a domain*, puis suivez les instructions DNS de votre registraire.
Le certificat HTTPS est créé automatiquement. Ensuite :

- définissez `NEXT_PUBLIC_SITE_URL=https://votre-domaine` dans Netlify et redéployez
  (balises canoniques, sitemap) ;
- mettez à jour l'URL du site dans Supabase.

Un domaine n'est pas obligatoire : l'adresse `*.netlify.app` fonctionne.

## 12. Mise à jour du site

- **Contenu** (produits, prix, photos, textes, numéro WhatsApp) : depuis `/admin`, sans redéployer.
  Les pages publiques sont en cache et rafraîchies dès qu'une modification est enregistrée dans
  l'administration (et au plus tard toutes les heures).
- **Code** : branche → modifications → `npm run check && npm run build` → fusion → Netlify redéploie.
- **Base de données** : nouvelle migration (section 4), testée en local, puis `npx supabase db push`
  **avant** de déployer le code qui en dépend.
- **Dépendances** : `npm outdated`, mise à jour, puis toutes les vérifications de la section 9.

## 13. Sauvegarde et export des données

L'offre gratuite de Supabase **n'inclut pas de sauvegarde que vous pouvez restaurer vous-même**.
Faites un export régulier (par exemple chaque semaine et avant toute migration) et conservez-le
hors de Supabase :

```bash
mkdir -p backups
npx supabase db dump --linked -f backups/schema-$(date +%F).sql
npx supabase db dump --linked --data-only -f backups/donnees-$(date +%F).sql
```

- Ces fichiers contiennent les **données personnelles des clients** (noms, téléphones, adresses) :
  stockez-les de façon privée et supprimez les plus anciens. Le dossier `backups/` est ignoré par git.
- Photos : Supabase → *Storage → store-media* → téléchargement, ou
  `npx supabase storage cp -r ss:///store-media backups/media --experimental --linked`.
- Export pour un tableur : Supabase → *Table Editor → orders* → *Export → CSV*.
- Restauration sur un nouveau projet : `db push` (schéma), puis exécution du fichier de données
  dans le *SQL Editor* ou avec `psql`.

## 14. Diagnostic des problèmes fréquents

| Symptôme | Cause probable et solution |
| --- | --- |
| « Service momentanément indisponible » partout | Projet Supabase en pause (inactivité) ou variables Netlify absentes. Réactivez le projet ; vérifiez les variables puis redéployez. |
| Le build Netlify échoue en lisant le catalogue | Supabase injoignable pendant le build (projet en pause, URL ou clé erronée). |
| « Ce compte n'a pas accès à l'administration » | L'utilisateur existe mais n'a pas de ligne `admin_profiles` (section 6). |
| « Connexion impossible pour le moment » | Fournisseur *Email* désactivé dans Supabase, ou trop de tentatives. |
| Les photos ne s'affichent pas | Migration non appliquée (bucket absent) ou `NEXT_PUBLIC_SUPABASE_URL` erronée. |
| WhatsApp ne s'ouvre pas après la commande | Numéro WhatsApp vide dans *Paramètres*. La commande reste enregistrée et visible dans l'admin. |
| Commande refusée « stock insuffisant » | Le stock suivi est épuisé : ajustez-le dans la fiche produit. |

## 15. Limites connues de l'offre gratuite

Les quotas évoluent : vérifiez-les sur [supabase.com/pricing](https://supabase.com/pricing) et
[netlify.com/pricing](https://www.netlify.com/pricing/).

- **Supabase Free** : le projet est **mis en pause après une période d'inactivité** (de l'ordre
  d'une semaine sans requête) ; la boutique affiche une erreur jusqu'à la réactivation manuelle.
  Base et stockage plafonnés (de l'ordre de 500 Mo et 1 Go), bande passante limitée,
  **pas de sauvegarde restaurable par vous-même** — d'où la procédure de la section 13.
- **Netlify Free** : quota mensuel (requêtes servies par fonctions, bande passante, optimisation
  d'images, minutes de build). Le site est conçu pour l'économiser : pages publiques pré-générées et
  en cache, photos légères, aucune tâche planifiée.
- **Aucun paiement en ligne** : les commandes restent « non payées » jusqu'à ce que vous cliquiez
  sur « J'ai reçu le paiement ».
- **Disponibilité non garantie** : si l'activité dépend du site, passez à une offre payante
  (Supabase Pro notamment, pour les sauvegardes et l'absence de mise en pause) dès que le volume
  de commandes augmente.

## 16. Architecture et choix techniques

```text
src/
├── app/                    routes (App Router)
│   ├── (store)/            boutique : accueil, boutique, produits/[slug], panier, commande
│   ├── admin/connexion     connexion
│   ├── admin/(panel)/      administration protégée
│   └── sitemap.ts, robots.ts, icon.svg, not-found.tsx, global-error.tsx
├── components/             UI partagée (ui/, layout/, shared/, admin/, brand/)
├── features/               métier par domaine : requêtes, actions serveur, validation, composants
│   └── auth/ cart/ categories/ media/ orders/ products/ reviews/ store-settings/
├── lib/                    clients Supabase, formatage, médias, étiquettes de cache
├── config/site.ts          URL du site, code devise
├── proxy.ts                rafraîchit la session et protège /admin
└── types/database.ts       types générés (npx supabase gen types typescript --local)
supabase/
├── migrations/             schéma versionné
├── seed.sql                démonstration (local uniquement)
└── tests/                  tests pgTAP
```

- **Commande** : le serveur valide le formulaire (Zod), puis appelle la fonction SQL
  `create_order`, qui relit les prix, vérifie la disponibilité, verrouille et réserve le stock,
  calcule les montants et enregistre tout dans une seule transaction. WhatsApp n'est ouvert
  qu'après confirmation de l'enregistrement. Les prix envoyés par le navigateur ne sont jamais utilisés.
- **Historique** : chaque ligne de commande garde le nom et le prix au moment de l'achat ; un
  trigger interdit de modifier les montants et n'autorise que les transitions de statut prévues
  (en avant, ou annulation tant que la commande n'est pas terminée, avec restitution du stock).
- **Sécurité** : RLS sur toutes les tables ; administrateurs = `admin_profiles` ; `requireAdmin()`
  dans chaque page et action d'administration, en plus du proxy et des politiques de la base ;
  aucune clé secrète dans l'application ; limitation simple des abus (3 commandes / 10 min par
  numéro, 30 / min au total, champ piège anti-robots) ; en-têtes de sécurité HTTP.
- **Cache** : Cache Components de Next.js 16 (`"use cache"` + étiquettes `catalog`, `settings`,
  `reviews`) invalidées par les actions d'administration ; les données admin ne sont jamais mises
  en cache côté serveur.
- **Montants** : entiers en FCFA (`integer` / `bigint`), aucun nombre à virgule flottante.
- **Données structurées** : Product + Offer (devise `XOF` ; remplacer par `XAF` dans
  `src/config/site.ts` pour l'Afrique centrale). La note moyenne n'est publiée que s'il existe des
  avis approuvés.
- **Identité visuelle** : conforme à la maquette (brun cacao, caramel, rose poudré ; Playfair Display,
  Great Vibes, Montserrat). Couleurs et polices centralisées dans `src/app/globals.css` (`@theme`).
- **« Commander sur WhatsApp »** (cartes et fiches) : ajoute le produit au panier et ouvre la page de
  commande ; WhatsApp ne s'ouvre qu'après l'enregistrement de la commande.
- **Produit inexistant ou masqué** : page 404 avec `noindex` ; la fiche étant diffusée en streaming,
  le code HTTP reste 200 (comportement standard de Next.js avec le pré-rendu partiel).
