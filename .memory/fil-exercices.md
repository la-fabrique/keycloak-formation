# Fil des exercices — Formation Keycloak

## Exercice 1 — Démarrer Keycloak avec Docker
- Lancer Keycloak en local via Docker Compose
- Accéder à la console d'administration
- Se connecter avec le compte admin

## Exercice 2 — Créer et configurer un realm
- Créer un nouveau realm (ex : `formation`)
- Explorer les paramètres du realm (durée des tokens, thème)

## Exercice 3 — Gérer les utilisateurs
- Créer des utilisateurs dans le realm
- Définir des mots de passe
- Ajouter des attributs personnalisés

## Exercice 4 — Créer un client et tester l'authentification
- Enregistrer un client de type « public » (SPA) ou « confidential » (backend)
- Configurer les redirect URIs
- Tester le flux Authorization Code avec un navigateur

## Exercice 5 — Sécuriser une application web
- Intégrer l'authentification OIDC dans une application exemple
- Afficher les informations de l'utilisateur connecté
- Gérer la déconnexion

## Exercice 6 — Mettre en place le contrôle d'accès (RBAC)
- Créer des rôles (ex : `admin`, `utilisateur`)
- Attribuer des rôles aux utilisateurs
- Conditionner l'accès à certaines pages/fonctions selon le rôle

## Exercice 7 — Inspecter les tokens
- Décoder un access token (JWT)
- Observer les claims (rôles, groupes, attributs)
- Comprendre le refresh token et l'ID token

## Exercice 8 — Utiliser l'API Admin
- Obtenir un token d'accès pour l'API Admin
- Lister les utilisateurs du realm via l'API REST
- Créer un utilisateur par API

## Exercice 9 — Fédération LDAP (optionnel)
- Connecter Keycloak à un annuaire LDAP (OpenLDAP via Docker)
- Configurer les mappers d'attributs
- Synchroniser les utilisateurs
