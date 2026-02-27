# Configuration client Keycloak — Référence

Documentation exhaustive des paramètres de configuration d'un client dans l'interface d'administration Keycloak. Les valeurs concrètes (Client ID, URLs, etc.) ne figurent pas ici ; seuls le rôle et l'effet de chaque paramètre sont décrits.

## General settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Client ID | Identifiant unique du client dans Keycloak. Utilisé dans les requêtes OIDC/OAuth2 et dans les URLs de redirection. Doit être stable une fois le client en production. |
| Name | Nom affiché pour ce client dans l'admin et, selon la config, sur les écrans Keycloak (ex. page de connexion, écran de consentement). |
| Always display in UI | Si activé, le client est toujours proposé dans la console de compte (account console). Si désactivé, il n'apparaît que lorsque l'utilisateur a une session active avec ce client. |

## Access settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Root URL | URL de base de l'application cliente. Sert de préfixe par défaut pour les redirect URIs et peut être utilisée pour construire des URLs dans Keycloak. |
| Home URL | L'adresse de « repli » : URL par défaut que Keycloak utilise lorsqu'il doit rediriger l'utilisateur vers votre application ou créer un lien vers celle-ci sans avoir d'instruction plus précise. |
| Valid redirect URIs | Liste des URI vers lesquelles Keycloak peut rediriger après une authentification réussie. Toute URI non listée est refusée pour limiter le vol de codes ou de tokens (phishing, open redirect). |
| Valid post logout redirect URIs | Liste des URI autorisées pour la redirection après déconnexion. L'utilisateur ne peut être renvoyé qu'vers une de ces URI après logout. |
| Web origins | Origines CORS autorisées pour les requêtes du navigateur vers Keycloak (ex. requêtes depuis une SPA). Doit inclure l'origine réelle de l'application (schéma + host + port). Il est possible d'utiliser "+" pour autoriser toutes origines |
| Admin URL | URL utilisée par Keycloak pour envoyer des requêtes back-channel vers le client (ex. logout, revocation). Optionnel ; utile pour les applications qui gèrent le front-channel ou back-channel logout. |

## Capability config

| Paramètre | Explications détaillées |
| :--- | :--- |
| Client authentication | Si activé, le client est *confidentiel* : il doit prouver son identité avec un secret (ou mTLS). Si désactivé, le client est *public* (typique des SPA et applis mobiles qui ne peuvent pas garder de secret). |
| Authorization | Active la gestion des autorisations côté ressource (Resource Server) : évaluation de permissions via les endpoints Keycloak (UMA, policy enforcer). À activer uniquement si l'application s'appuie sur ces mécanismes. |
| Authentication flow - Standard flow | *Authorization Code* (OAuth2/OIDC). L'utilisateur est redirigé vers Keycloak pour se connecter ; Keycloak renvoie un code à l'application, qui l'échange contre des tokens. Flux recommandé pour les applications web (SPA, backend) ; à combiner avec PKCE pour les clients publics. |
| Authentication flow - Direct Access grant | *Resource Owner Password Credentials*. L'application envoie identifiant et mot de passe directement à Keycloak pour obtenir des tokens. À réserver aux clients de confiance (ex. applications natives officielles) ; à éviter pour les applis web, les credentials transitant par le client. |
| Authentication flow - Implicit flow | Les tokens (id_token, access_token) sont renvoyés directement dans le fragment d'URL après redirection. Déprécié : tokens exposés dans l'historique et le referrer. Remplacer par Standard flow avec PKCE. |
| Authentication flow - Service account | *Client Credentials* (OAuth2). Le client s'authentifie avec son secret (ou mTLS) et obtient un token au nom du client, sans utilisateur final. Pour les échanges machine-à-machine (M2M), APIs backend et intégrations. Nécessite un client confidentiel. |
| Authentication flow - Standard Token Exchange | RFC 8693. Échange d'un token (ex. access_token ou token externe) contre un autre (autre audience, format, ou type). Utile pour la délégation, les gateways et les chaînes de microservices. |
| Authentication flow - OAuth 2.0 Device Authorization Grant | Flux pour appareils sans navigateur ou à entrée limitée (TV, CLI, IoT). L'utilisateur obtient un code sur l'appareil, s'authentifie sur un autre device (ordinateur, téléphone), puis l'appareil récupère les tokens par polling. |
| Authentication flow - OIDC CIBA Grant | *Client Initiated Backchannel Authentication*. L'utilisateur initie la connexion depuis un device (ex. site web) et s'authentifie sur un autre (ex. app mobile) via une notification ; pas de redirection du navigateur principal. Pour scénarios découplés (approbations, banking). |
| PKCE Method | Méthode PKCE utilisée pour le flux Authorization Code (ex. S256). Recommandé (souvent obligatoire) pour les clients publics pour éviter l'usage d'un code d'autorisation intercepté. |

## Login settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Consent required | Si activé, Keycloak affiche un écran de consentement demandant à l'utilisateur d'accepter l'accès aux données (scope, client). Souvent désactivé pour les applications internes ou de confiance. |
| Display client on screen | Contrôle l'affichage du nom du client sur les écrans Keycloak (login, consentement, etc.). Utile pour la transparence vis-à-vis de l'utilisateur. |

## Logout settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Front channel logout | Active le logout via le navigateur : Keycloak peut demander au client de terminer la session en ouvrant des requêtes (ex. iframe) vers les URLs enregistrées. Permet de déconnecter l'utilisateur de l'application quand il se déconnecte de Keycloak. |
| Front-channel logout session required | Si activé, le front-channel logout n'est envoyé au client que si une session Keycloak existe encore. Permet d'éviter des appels inutiles quand l'utilisateur est déjà déconnecté. |
| Logout confirmation | Si activé, Keycloak affiche une page de confirmation (« Êtes-vous sûr de vouloir vous déconnecter ? ») avant de terminer la session. Si désactivé, la déconnexion est immédiate. |
