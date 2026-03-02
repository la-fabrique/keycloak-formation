# Configuration Realm Keycloak — Référence

Documentation exhaustive des paramètres de configuration d'un realm dans l'interface d'administration Keycloak. Les valeurs concrètes ne figurent pas ici ; seuls le rôle et l'effet de chaque paramètre sont décrits.

## General


| Paramètre         | Explications détaillées                                                                                                                                                                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Realm name        | Identifiant technique unique du realm dans l'instance Keycloak. Utilisé dans toutes les URLs (ex. `/realms/{realm-name}/`). Ne peut pas être modifié facilement une fois le realm en production sans casser les intégrations.                                                                                        |
| Display name      | Nom lisible affiché dans la console d'administration et, selon la configuration du thème, sur les pages Keycloak (login, consentement). N'a pas d'impact technique sur les URLs ou protocoles.                                                                                                                       |
| HTML Display name | Variante du nom d'affichage acceptant du balisage HTML. Permet de personnaliser la mise en forme (gras, couleur, logo intégré en `<img>`) sur les pages Keycloak qui le supportent. À utiliser avec précaution pour éviter les injections.                                                                           |
| Frontend URL      | URL publique du realm, utilisée par Keycloak pour construire les liens envoyés aux utilisateurs (ex. e-mails de vérification, redirections). Utile lorsque Keycloak est derrière un reverse proxy et que l'URL interne diffère de l'URL publique. Si vide, Keycloak déduit l'URL depuis la requête entrante.         |
| Require SSL       | Détermine quelles connexions doivent utiliser HTTPS. **`External requests`** (recommandé en production) : HTTPS requis pour les IP publiques, HTTP toléré en réseau privé. **`All requests`** : HTTPS obligatoire pour toutes les connexions. **`None`** : HTTP autorisé partout (à réserver au développement local uniquement). |
| ACR to LoA Mapping | Associe des valeurs ACR (*Authentication Context Class Reference*, ex. `urn:mace:incommon:iap:silver`) à des niveaux d'authentification (LoA, niveaux entiers). Permet à un client de demander un niveau de sécurité minimal via le paramètre `acr_values` ou `claims` OIDC, et à Keycloak de vérifier que le niveau atteint est suffisant. Aucun mapping par défaut ; à définir selon la politique de sécurité du realm. |
| User-managed access  | Active le protocole UMA 2.0 (*User-Managed Access*). Permet aux utilisateurs de gérer eux-mêmes les permissions sur leurs ressources (accorder ou révoquer l'accès à d'autres utilisateurs ou clients). À activer uniquement si l'application s'appuie sur ce mécanisme de délégation ; désactivé par défaut.                                 |
| Organizations        | Active la fonctionnalité multi-organisations dans le realm. Permet de regrouper des utilisateurs et des identités au sein d'entités organisationnelles, chacune pouvant avoir ses propres fournisseurs d'identité et membres. Utile pour les scénarios multi-tenant. Désactivé par défaut.                                                    |
| Admin Permissions    | Active les permissions d'administration granulaires (*fine-grained admin permissions*). Permet de déléguer des droits d'administration précis à des utilisateurs ou des clients (ex. gérer uniquement les utilisateurs d'un groupe, sans accès global). Désactivé par défaut.                                                                 |
| Unmanaged Attributes | Contrôle la gestion des attributs utilisateur non déclarés dans le profil du realm. `Disabled` : seuls les attributs définis dans le profil sont acceptés. `Enabled` (ou variantes selon la version) : les attributs supplémentaires sont stockés sans validation de schéma. À restreindre en production pour maîtriser les données stockées. |
| Signature algorithm SAML IdP metadata | Algorithme cryptographique utilisé pour signer les métadonnées SAML exposées par Keycloak en tant qu'IdP (ex. `RSA_SHA256`, `RSA_SHA512`). Ce paramètre affecte uniquement la signature du document de métadonnées SAML, pas celle des assertions SAML elles-mêmes (configurée au niveau du client). À choisir selon les exigences du fournisseur de services SAML. |
| Endpoints | Liens vers les documents de découverte des protocoles supportés par le realm. **OpenID Endpoint Configuration** : document JSON (`/.well-known/openid-configuration`) listant toutes les URLs OIDC/OAuth2 du realm (authorization, token, userinfo, JWKS, logout, etc.). **SAML 2.0 Identity Provider Metadata** : document XML décrivant l'IdP SAML du realm (certificate, SSO URL, SLO URL). Ces documents sont destinés aux clients et outils qui ont besoin de s'auto-configurer. |

## Login settings

### Login screen customization

| Paramètre | Explications détaillées |
| :--- | :--- |
| User registration | Si activé, un lien « Créer un compte » est affiché sur la page de connexion, permettant aux nouveaux utilisateurs de s'inscrire eux-mêmes. Si désactivé, seuls les administrateurs peuvent créer des comptes. Désactivé par défaut. |
| Forgot password | Si activé, un lien « Mot de passe oublié ? » est affiché sur la page de connexion. Keycloak envoie alors un e-mail de réinitialisation à l'utilisateur. Nécessite qu'un serveur SMTP soit configuré dans les paramètres e-mail du realm. Désactivé par défaut. |
| Remember me | Si activé, une case « Rester connecté » est proposée sur la page de connexion. Lorsque l'utilisateur la coche, sa session Keycloak persiste au-delà de la fermeture du navigateur (durée configurable via les paramètres de session du realm). Désactivé par défaut. |

### Email settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Email as username | Si activé, l'adresse e-mail sert d'identifiant de connexion à la place d'un nom d'utilisateur distinct. Simplifie l'expérience utilisateur mais impose que chaque e-mail soit unique dans le realm. Désactivé par défaut. |
| Login with email | Si activé, les utilisateurs peuvent se connecter en saisissant leur adresse e-mail (en plus ou à la place du nom d'utilisateur, selon la configuration). Activé par défaut. |
| Duplicate emails | Si activé, plusieurs comptes peuvent partager la même adresse e-mail dans le realm. Désactivé par défaut car cela peut créer des ambiguïtés lors de la récupération de compte ou du login par e-mail. |
| Verify email | Si activé, Keycloak demande à chaque nouvel utilisateur de confirmer son adresse e-mail avant de pouvoir accéder aux applications. Un e-mail de vérification est envoyé lors de l'inscription ou de la première connexion. Nécessite qu'un SMTP soit configuré. Désactivé par défaut. |

### User info settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Edit username | Si activé, les utilisateurs peuvent modifier leur propre nom d'utilisateur depuis la console de compte (*account console*). Si désactivé, seul un administrateur peut le changer. À désactiver si le nom d'utilisateur est utilisé comme identifiant stable dans d'autres systèmes. Désactivé par défaut. |

## Email

### Template

| Paramètre | Explications détaillées |
| :--- | :--- |
| From | Adresse e-mail expéditrice utilisée dans le champ `From` des e-mails envoyés par Keycloak (vérification, réinitialisation de mot de passe, etc.). Obligatoire pour l'envoi d'e-mails. Doit être une adresse valide acceptée par le serveur SMTP configuré. |
| From display name | Nom affiché comme expéditeur dans les clients e-mail (ex. `Keycloak – Mon Realm`). Si vide, seule l'adresse e-mail brute est affichée. |
| Reply to | Adresse e-mail de réponse (`Reply-To`). Lorsque l'utilisateur répond à un e-mail de Keycloak, la réponse est adressée à cette adresse plutôt qu'à l'adresse `From`. Utile pour diriger les réponses vers une boîte de support distincte. |
| Reply to display name | Nom affiché associé à l'adresse `Reply-To`. Fonctionne comme `From display name` mais pour le destinataire de réponse. |
| Envelope from | Adresse technique utilisée comme expéditeur SMTP (`MAIL FROM` au niveau du protocole, aussi appelée *bounce address*). Différente du `From` visible : sert à recevoir les notifications d'échec de livraison (bounces). Si vide, l'adresse `From` est utilisée. |

### Connection & Authentication

| Paramètre | Explications détaillées |
| :--- | :--- |
| Host | Nom d'hôte ou adresse IP du serveur SMTP. Obligatoire pour l'envoi d'e-mails. |
| Port | Port TCP du serveur SMTP. Valeurs courantes : `25` (SMTP non chiffré), `465` (SMTPS/SSL), `587` (STARTTLS). |
| Enable SSL | Active une connexion SMTP chiffrée dès le début (SMTPS, port 465). À utiliser avec les serveurs qui n'acceptent pas de connexion non chiffrée. Incompatible avec `Enable StartTLS`. |
| Enable StartTLS | Active STARTTLS : la connexion démarre en clair puis est mise à niveau en TLS via la commande SMTP `STARTTLS`. Méthode standard pour le port 587. Incompatible avec `Enable SSL`. |
| Authentication | Si activé, Keycloak s'authentifie auprès du serveur SMTP avec un nom d'utilisateur et un mot de passe. Requis par la plupart des serveurs SMTP modernes. Désactivé par défaut. |
| Allow UTF-8 | Si activé, autorise les caractères UTF-8 dans les en-têtes et le corps des e-mails (RFC 6532). À activer si les adresses e-mail ou les noms d'affichage contiennent des caractères non-ASCII. Désactivé par défaut. |
| Connection timeout | Durée maximale (en millisecondes) pour établir la connexion TCP avec le serveur SMTP. Au-delà, la tentative échoue. Permet d'éviter des blocages indéfinis en cas de serveur inaccessible. |
| Socket read timeout | Durée maximale (en millisecondes) d'attente d'une réponse du serveur SMTP après envoi d'une commande. Protège contre les serveurs lents ou bloqués pendant la transaction. |
| Socket write timeout | Durée maximale (en millisecondes) pour écrire des données vers le serveur SMTP. Protège contre les connexions lentes ou dégradées lors de l'envoi du corps du message. |
| Enable Debug SMTP | Si activé, les échanges SMTP détaillés (commandes et réponses) sont écrits dans les logs du serveur Keycloak. Utile pour diagnostiquer les problèmes de livraison. À désactiver en production (logs verbeux, données potentiellement sensibles). |
