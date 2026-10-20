# Guide de gestion de la boutique

Ce guide explique les tâches courantes. Aucune connaissance technique n'est nécessaire.
Toutes les modifications sont visibles sur la boutique dès que vous cliquez sur « Enregistrer ».

## Se connecter

1. Ouvrez `https://<adresse-de-votre-site>/admin`.
2. Saisissez l'e-mail et le mot de passe de votre compte administrateur.
3. Pour quitter, cliquez sur **Se déconnecter** en haut à droite (indispensable sur un appareil partagé).

Le menu à gauche (ou en haut sur téléphone) donne accès à : Tableau de bord, Commandes, Produits,
Catégories, Avis clients, Paramètres.

## Ajouter un produit

1. **Produits → Nouveau produit**.
2. Renseignez le **nom**, la **description** et le **prix en FCFA** (par exemple `15000` ou `15 000`).
   L'**adresse de la page** se remplit toute seule à partir du nom.
3. Choisissez une **catégorie** si vous en utilisez.
4. **Disponibilité** : cochez « Suivre le stock » si vous voulez que la quantité baisse à chaque
   commande, puis indiquez la quantité. Sinon, le produit reste toujours disponible.
5. Cliquez sur **Créer le produit**.
6. Sur la page qui s'ouvre, cliquez sur **Ajouter des photos** et choisissez une ou plusieurs photos.
   La première est la photo principale ; les flèches changent l'ordre. Ajoutez une courte
   description à chaque photo (utile aux personnes malvoyantes et au référencement).
7. Cochez **Publié sur la boutique** puis **Enregistrer les modifications** pour mettre le produit
   en ligne. Cochez **Mis en avant sur la page d'accueil** pour qu'il apparaisse dans « Nos essentiels ».

## Modifier un prix ou faire une promotion

1. **Produits** → cliquez sur le produit.
2. Changez le **Prix**. Pour une promotion, mettez l'ancien prix dans **Ancien prix** : il sera
   affiché barré, avec la mention « Promotion ».
3. **Enregistrer les modifications**.

Les commandes déjà passées gardent le prix d'origine : seules les nouvelles commandes utilisent le
nouveau prix.

## Retirer un produit

- **Masquer** (recommandé) : décochez **Publié sur la boutique** et enregistrez. Le produit
  disparaît de la boutique mais reste dans l'historique.
- **Supprimer** : en bas de la fiche, **Supprimer ce produit**. C'est refusé si le produit a déjà
  été commandé : masquez-le dans ce cas.

## Gérer une commande

Chaque commande passée sur le site arrive dans **Commandes** avec le statut **En attente**, même
si le client n'a pas terminé la conversation WhatsApp.

1. Ouvrez la commande : vous voyez les articles, les prix au moment de l'achat, le total et les
   coordonnées. Le bouton **Écrire au client sur WhatsApp** ouvre la conversation.
2. Faites avancer le statut au fil du traitement :
   - **Confirmée** : le client a confirmé la commande et la livraison ;
   - **En préparation** ;
   - **En livraison** ;
   - **Terminée** : livrée ou retirée.
   Vous pouvez sauter une étape ; il n'est pas possible de revenir en arrière.
3. **Annuler la commande** (avant qu'elle soit terminée) : la commande reste dans l'historique et
   le stock est remis en vente.
4. **Paiement** : cliquez sur **J'ai reçu le paiement** uniquement quand l'argent est réellement
   reçu. Le tableau de bord distingue ainsi les paiements vérifiés des simples commandes.
5. **Note interne** : notez les informations utiles (date de livraison, moyen de paiement…).
   Le client ne la voit pas.

Les commandes ne sont jamais supprimées : utilisez la recherche (numéro, nom ou téléphone) et le
filtre par statut pour vous y retrouver.

## Modifier le numéro WhatsApp

1. **Paramètres** → section **Commandes WhatsApp**.
2. Saisissez le numéro **avec l'indicatif du pays**, par exemple `+225 07 00 00 00 00`.
3. **Enregistrer les paramètres** (bouton en bas de page).
4. Vérifiez sur la boutique : le bouton « Écrire sur WhatsApp » doit ouvrir votre conversation.

Dans **Paramètres**, vous pouvez aussi modifier : le nom et le logo de la boutique, les
coordonnées, les frais et informations de livraison, la phrase d'introduction du message de
commande, les textes et images de la page d'accueil, les réseaux sociaux et le pied de page.

## Catégories

**Catégories** : créez une catégorie avec le formulaire de droite. Cliquez sur une catégorie pour
la renommer, changer son ordre d'affichage ou la masquer. Une catégorie qui contient des produits
ne peut pas être supprimée : déplacez d'abord ses produits ou masquez-la.

## Avis clients

Les clients peuvent laisser un avis sur chaque fiche produit. Il n'apparaît sur la boutique
qu'après votre accord : **Avis clients → À relire** → **Publier**, **Masquer** ou **Supprimer**.

## Bonnes pratiques

- Utilisez un mot de passe long et unique, et ne le partagez pas.
- Préférez des photos nettes, bien éclairées, au format portrait.
- Faites exporter régulièrement les données (README, section « Sauvegarde ») : l'offre gratuite
  ne fait pas de sauvegarde automatique.
- Si la boutique affiche « Service momentanément indisponible » après plusieurs jours sans
  visite, le projet Supabase est probablement en pause : il faut le réactiver depuis le tableau de
  bord Supabase.
