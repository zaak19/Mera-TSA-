# Mera TSA

Prototype front-end basé sur les maquettes et fonctionnalités définies.

## Fichiers
- index.html : structure principale et toutes les pages
- style.css : identité visuelle
- script.js : navigation, formulaires, verrouillage PIN et prototype fonctionnel
- assets/mera-logo.png : logo fourni
- assets/mera-splash.png : référence splash fournie
- manifest.json : base PWA

## Correctifs V3
- Splash d’entrée : attente réduite à 0,5 seconde.
- Page d’authentification : chaque utilisateur peut enregistrer une photo de profil et un nom, affichés au-dessus du formulaire.
- Verrouillage : après connexion et déverrouillage, le code PIN est redemandé toutes les 2 heures.

## Important
Ce projet est un prototype front-end. Les fonctions suivantes doivent être reliées à un backend sécurisé avant une mise en production :
- comptes et mots de passe
- code PIN
- stockage des documents
- validation manuelle
- paiements réels
- e-mails
- QR codes réels
- limitation mensuelle des modifications
- notifications 48 heures avant expiration

Ne jamais utiliser le localStorage comme stockage final pour des passeports, cartes d'identité ou autres documents sensibles.
