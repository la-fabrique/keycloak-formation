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

## Themes

| Paramètre | Explications détaillées |
| :--- | :--- |
| Dark mode | Si activé, la console d'administration Keycloak bascule en thème sombre. Ce paramètre n'affecte que l'interface d'administration, pas les pages Keycloak exposées aux utilisateurs (login, compte). Activé par défaut. |
| Login theme | Thème appliqué aux pages du flux d'authentification : connexion, inscription, réinitialisation de mot de passe, MFA, etc. Si non défini, le thème par défaut de Keycloak est utilisé. Peut être surchargé au niveau d'un client individuel. |
| Account theme | Thème appliqué à la console de compte utilisateur (`/realms/{realm}/account`). Permet aux utilisateurs de gérer leur profil, leurs appareils, leurs sessions et leurs credentials. |
| Admin theme | Thème appliqué à la console d'administration Keycloak. Permet de personnaliser l'apparence de l'interface admin pour tout le realm. |
| Email theme | Thème utilisé pour les templates des e-mails envoyés par Keycloak (vérification d'adresse, réinitialisation de mot de passe, etc.). Permet de personnaliser la mise en forme HTML et les textes des e-mails. |

## Keys

La gestion des clés cryptographiques du realm est répartie en deux vues : la liste des clés actives et la liste des providers qui les génèrent.

### Keys list — clés actives

Affiche toutes les clés cryptographiques actuellement actives dans le realm. Chaque entrée correspond à une clé utilisable pour signer ou chiffrer des tokens.

| Colonne | Explications détaillées |
| :--- | :--- |
| Algorithm | Algorithme cryptographique associé à la clé (ex. `RS256`, `RSA-OAEP`, `AES`, `HS512`). Détermine l'usage de la clé : signature de tokens JWT, chiffrement de contenu, etc. |
| Type | Format de la clé : `RSA` (paire de clés asymétrique), `OCT` (clé symétrique octet). |
| Kid | *Key ID* — identifiant unique de la clé, inclus dans l'en-tête `kid` des tokens JWT. Permet aux clients de sélectionner la bonne clé publique lors de la vérification d'un token. |
| Use | Usage de la clé : `SIG` (signature) ou `ENC` (chiffrement). |
| Provider | Nom du provider qui a généré la clé (ex. `rsa-generated`, `aes-generated`, `hmac-generated-hs512`). |
| Valid to | Date d'expiration de la clé. Un tiret (`-`) indique que la clé n'a pas de date d'expiration (clés symétriques générées automatiquement). |
| Public keys | Pour les clés asymétriques (RSA), bouton permettant d'afficher la clé publique au format PEM ou le certificat X.509. Les clés symétriques (OCT) n'ont pas de clé publique exposée. |

Les clés actives par défaut dans un realm fraîchement créé sont :

| Algorithm | Type | Use | Provider |
| :--- | :--- | :--- | :--- |
| RS256 | RSA | SIG | rsa-generated |
| RSA-OAEP | RSA | ENC | rsa-enc-generated |
| AES | OCT | ENC | aes-generated |
| HS512 | OCT | SIG | hmac-generated-hs512 |

### Providers

Liste des providers de clés configurés dans le realm. Un provider est responsable de la génération et du cycle de vie d'une ou plusieurs clés.

| Colonne | Explications détaillées |
| :--- | :--- |
| Name | Nom donné au provider lors de sa création. |
| Provider | Type de provider (ex. `rsa-generated`, `aes-generated`, `hmac-generated`, `java-keystore`). Détermine l'algorithme et le mode de génération de la clé. |
| Provider description | Description textuelle du type de provider. |

#### Édition d'un provider

Chaque provider peut être configuré via les paramètres suivants :

| Paramètre | Explications détaillées |
| :--- | :--- |
| Provider ID | Identifiant technique du type de provider (ex. `aes-generated`). Non modifiable. |
| Name | Nom libre attribué à cette instance de provider, affiché dans la liste des providers. |
| Priority | Ordre de priorité entier. En cas de plusieurs providers produisant des clés pour le même algorithme, celui avec la priorité la plus élevée fournit la clé active utilisée pour les nouvelles signatures ou chiffrements. |
| Enabled | Si désactivé, les clés générées par ce provider ne sont plus proposées. Les tokens déjà signés avec ces clés restent vérifiables tant que le provider n'est pas supprimé. |
| Active | Si désactivé, les clés du provider ne sont plus utilisées pour signer ou chiffrer de nouveaux tokens, mais restent disponibles pour vérifier les tokens existants. Permet une rotation progressive. |
| AES Key size | Taille en octets de la clé AES générée (`16` = 128 bits, `32` = 256 bits). Paramètre spécifique au provider `aes-generated`. |

## Events

### Event listeners

| Paramètre | Explications détaillées |
| :--- | :--- |
| Event listeners | Liste des listeners qui reçoivent les événements du realm (utilisateur et admin). Chaque listener peut traiter les événements à sa manière : journalisation, envoi vers un système externe, etc. Le listener `jboss-logging` (actif par défaut) écrit les événements dans les logs du serveur Keycloak. D'autres listeners peuvent être ajoutés via des extensions SPI. |

### User events settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Save events | Si activé, les événements utilisateur sont persistés en base de données et consultables dans la liste des événements de l'admin console. Si désactivé, les événements sont transmis aux listeners mais non stockés. Désactivé par défaut. |
| Expiration | Durée de rétention des événements utilisateur stockés. Passé ce délai, les événements sont supprimés automatiquement. Visible uniquement lorsque `Save events` est activé. |
| Event saved type | Liste des types d'événements à persister (ex. `LOGIN`, `LOGOUT`, `REGISTER`, `LOGIN_ERROR`, `UPDATE_PASSWORD`, etc.). Permet de filtrer les événements stockés pour ne conserver que ceux utiles à l'audit. 93 types d'événements sont disponibles. |
| Clear user events | Action permettant de supprimer immédiatement tous les événements utilisateur stockés pour le realm. Irréversible. |

### Admin events settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Save events | Si activé, les actions effectuées via la console d'administration (création, modification, suppression de ressources) sont persistées et consultables dans la liste des événements admin. Désactivé par défaut. |
| Expiration | Durée de rétention des événements administrateur stockés. Passé ce délai, les événements sont supprimés automatiquement. Visible uniquement lorsque `Save events` est activé. |
| Include representation | Si activé, le corps JSON de la ressource créée ou modifiée est inclus dans l'événement admin stocké. Utile pour l'audit détaillé mais augmente la taille des données stockées. Désactivé par défaut. |
| Clear admin events | Action permettant de supprimer immédiatement tous les événements admin stockés pour le realm. Irréversible. |

## Localization

### Locales

| Paramètre | Explications détaillées |
| :--- | :--- |
| Internationalization | Si activé, Keycloak adapte la langue des pages (login, compte, e-mails) selon les préférences de l'utilisateur ou du navigateur. Si désactivé, toutes les pages s'affichent dans la langue par défaut du thème. |
| Supported locales | Liste des langues proposées aux utilisateurs. Keycloak sélectionne la langue en fonction des préférences du navigateur parmi les locales supportées. |
| Default locale | Langue utilisée en repli lorsqu'aucune locale supportée ne correspond aux préférences de l'utilisateur. Également la langue affichée lorsque l'internationalisation est désactivée. |

### Realm overrides

Permet de surcharger des traductions pour l'ensemble du realm, indépendamment du thème. Les traductions définies ici prennent le dessus sur celles fournies par le thème, pour toutes les pages et tous les clients du realm. La surcharge est organisée par langue (ex. `English`) et par clé de message.

### Effective message bundles

Vue en lecture seule qui affiche l'ensemble résultant des traductions pour une combinaison donnée de langue, thème et type de thème (login, account, admin, email). Le résultat intègre les traductions du thème et les éventuelles surcharges du realm. Permet de vérifier quelle valeur finale sera affichée pour une clé de message donnée, en tenant compte de toute la chaîne de priorité.

## Security defenses

### Headers

En-têtes HTTP de sécurité ajoutés automatiquement par Keycloak aux réponses des pages qu'il sert. Ces valeurs sont modifiables mais les valeurs par défaut couvrent les cas d'usage courants.

| En-tête | Valeur par défaut | Explications détaillées |
| :--- | :--- | :--- |
| X-Frame-Options | `SAMEORIGIN` | Empêche l'intégration des pages Keycloak dans une `<iframe>` depuis une origine tierce. Protège contre le clickjacking. `SAMEORIGIN` autorise uniquement les iframes depuis le même domaine. |
| Content-Security-Policy | `frame-src 'self'; frame-ancestors 'self'; object-src 'none';` | Politique de sécurité du contenu. `frame-ancestors 'self'` renforce la protection contre le clickjacking (complément moderne de `X-Frame-Options`). `object-src 'none'` bloque les plugins (Flash, etc.). |
| Content-Security-Policy-Report-Only | _(vide)_ | Variante de CSP en mode rapport uniquement : les violations sont signalées (vers l'URL `report-uri` si définie) sans être bloquées. Utile pour tester une nouvelle politique CSP avant de l'appliquer. |
| X-Content-Type-Options | `nosniff` | Interdit au navigateur de déduire le type MIME d'une réponse autrement que depuis l'en-tête `Content-Type`. Protège contre les attaques de sniffing de type MIME. |
| X-Robots-Tag | `none` | Indique aux robots d'indexation (moteurs de recherche) de ne pas indexer les pages Keycloak. Évite que les pages de login apparaissent dans les résultats de recherche. |
| HTTP Strict Transport Security (HSTS) | `max-age=31536000; includeSubDomains` | Indique au navigateur de n'accéder au domaine qu'en HTTPS pendant la durée `max-age` (en secondes). `includeSubDomains` étend cette règle à tous les sous-domaines. Nécessite que HTTPS soit opérationnel avant activation. |
| Referrer Policy | _(vide)_ | Contrôle les informations d'origine transmises dans l'en-tête `Referer` lors des navigations depuis les pages Keycloak. Si vide, la politique par défaut du navigateur s'applique. |

### Brute force detection

Protection contre les attaques par force brute sur les comptes utilisateurs. Keycloak surveille les échecs de connexion et verrouille les comptes selon le mode choisi.

Le paramètre **Brute Force Mode** détermine le comportement global et les champs disponibles :

| Mode | Comportement |
| :--- | :--- |
| `Lockout temporarily` | Le compte est verrouillé pour une durée croissante après trop d'échecs, puis déverrouillé automatiquement. |
| `Lockout permanently` | Le compte est verrouillé définitivement après trop d'échecs. Seul un administrateur peut le déverrouiller manuellement. |
| `Lockout permanently after temporary lockout` | Combine les deux : le compte subit d'abord des verrouillages temporaires progressifs, puis est verrouillé définitivement après un nombre maximal de verrouillages temporaires atteint. |

Les paramètres disponibles varient selon le mode sélectionné :

| Paramètre | Lockout temporarily | Lockout permanently | Lockout permanently after temporary lockout |
| :--- | :---: | :---: | :---: |
| Max login failures | ✓ | ✓ | ✓ |
| Maximum temporary lockouts | | | ✓ |
| Strategy to increase wait time | ✓ | | ✓ |
| Wait increment | ✓ | | ✓ |
| Max wait | ✓ | | ✓ |
| Failure reset time | ✓ | | ✓ |
| Quick login check milliseconds | ✓ | ✓ | ✓ |
| Minimum quick login wait | ✓ | ✓ | ✓ |

| Paramètre | Explications détaillées |
| :--- | :--- |
| Max login failures | Nombre maximal d'échecs de connexion consécutifs autorisés avant déclenchement du verrouillage. |
| Maximum temporary lockouts | Nombre maximal de verrouillages temporaires avant bascule en verrouillage permanent. Spécifique au mode `Lockout permanently after temporary lockout`. |
| Strategy to increase wait time | Stratégie d'augmentation du temps d'attente entre les cycles d'échecs. `Multiple` : le temps d'attente est multiplié à chaque nouveau verrouillage. |
| Wait increment | Durée de base (en minutes) ajoutée au temps d'attente à chaque cycle d'échecs supplémentaires. |
| Max wait | Durée maximale (en minutes) d'un verrouillage temporaire, quel que soit le nombre d'échecs accumulés. Plafond de la progression. |
| Failure reset time | Délai (en heures) après lequel le compteur d'échecs est remis à zéro si aucune nouvelle tentative échouée n'est survenue. |
| Quick login check milliseconds | Seuil (en millisecondes) en dessous duquel deux tentatives consécutives sont considérées comme suspectes (trop rapides pour être humaines). Déclenche immédiatement un temps d'attente minimal. |
| Minimum quick login wait | Durée minimale d'attente (en minutes) imposée lorsqu'une tentative est détectée comme trop rapide. |

## Sessions

### SSO Session Settings

Durées de vie des sessions SSO Keycloak. Une session SSO représente la connexion d'un utilisateur au realm, indépendamment des clients accédés.

| Paramètre | Explications détaillées |
| :--- | :--- |
| SSO Session Idle | Durée d'inactivité maximale (en minutes) avant expiration de la session SSO. La session est prolongée à chaque interaction de l'utilisateur avec Keycloak. |
| SSO Session Max | Durée de vie absolue maximale (en heures) d'une session SSO, quelle que soit l'activité. Une fois ce délai atteint, l'utilisateur doit se reconnecter. |
| SSO Session Idle Remember Me | Durée d'inactivité maximale (en minutes) pour les sessions créées avec l'option « Rester connecté ». Remplace `SSO Session Idle` lorsque l'utilisateur a coché « Remember me ». Si à zéro, la valeur de `SSO Session Idle` s'applique. |
| SSO Session Max Remember Me | Durée de vie absolue maximale (en minutes) pour les sessions « Rester connecté ». Remplace `SSO Session Max`. Si à zéro, la valeur de `SSO Session Max` s'applique. |

### Client Session Settings

Durées de vie des sessions côté client, indépendantes des sessions SSO. Permettent de restreindre la durée de validité des tokens pour un client spécifique en deçà des limites SSO.

| Paramètre | Explications détaillées |
| :--- | :--- |
| Client Session Idle | Durée d'inactivité maximale (en minutes) d'une session client avant expiration. Si à zéro, la valeur de `SSO Session Idle` s'applique. |
| Client Session Max | Durée de vie absolue maximale (en minutes) d'une session client. Si à zéro, la valeur de `SSO Session Max` s'applique. |

### Offline Session Settings

Les sessions hors-ligne permettent à un client d'obtenir un refresh token à longue durée de vie, utilisable même lorsque l'utilisateur n'est pas connecté (ex. synchronisation en arrière-plan).

| Paramètre | Explications détaillées |
| :--- | :--- |
| Offline Session Idle | Durée d'inactivité maximale (en jours) d'une session hors-ligne. Si le refresh token hors-ligne n'est pas utilisé pendant ce délai, la session expire. |
| Client Offline Session Idle | Durée d'inactivité maximale (en minutes) d'une session hors-ligne côté client. Remplace `Offline Session Idle` si défini. Si à zéro, `Offline Session Idle` s'applique. |
| Offline Session Max Limited | Si activé, une durée de vie absolue maximale est également appliquée aux sessions hors-ligne (en plus de l'idle). Désactivé par défaut : les sessions hors-ligne expirent uniquement par inactivité. |

### Login Settings

Durées de vie applicables aux flux d'authentification en cours (actions temporaires, formulaires de login).

| Paramètre | Explications détaillées |
| :--- | :--- |
| Login timeout | Durée maximale (en minutes) accordée à un utilisateur pour terminer le flux de connexion depuis l'affichage de la page de login. Au-delà, la session de login expire et l'utilisateur doit recommencer. |
| Login action timeout | Durée maximale (en minutes) accordée à un utilisateur pour compléter une action dans le flux d'authentification (ex. saisie d'un code OTP, validation d'un e-mail). Chaque action démarre un nouveau compteur. |

## Tokens

### General

| Paramètre | Explications détaillées |
| :--- | :--- |
| Default Signature Algorithm | Algorithme de signature utilisé par défaut pour les tokens JWT du realm (ex. `RS256`). Peut être surchargé au niveau d'un client individuel. |
| OAuth 2.0 Device Code Lifespan | Durée de validité (en minutes) du code appareil dans le flux *Device Authorization Grant*. Au-delà, l'utilisateur doit relancer la procédure sur son appareil. |
| OAuth 2.0 Device Polling Interval | Intervalle minimal (en secondes) entre deux tentatives de polling du token par l'appareil dans le flux *Device Authorization Grant*. Évite les requêtes trop fréquentes vers le serveur. |
| Short verification\_uri in Device Authorization flow | Si activé, Keycloak utilise une URI de vérification courte dans le flux Device Authorization (ex. `https://example.com/activate` au lieu d'une URL avec code pré-rempli). Utile pour les affichages à faible résolution (TV, CLI). |
| Lifetime of the Request URI for Pushed Authorization Request | Durée de validité (en minutes) de l'URI de requête générée lors d'un *Pushed Authorization Request* (PAR, RFC 9126). Passé ce délai, l'URI expire et le client doit soumettre une nouvelle requête. |

### Refresh tokens

| Paramètre | Explications détaillées |
| :--- | :--- |
| Revoke Refresh Token | Si activé, chaque refresh token ne peut être utilisé qu'une seule fois. Après usage, un nouveau refresh token est émis. Protège contre la réutilisation d'un refresh token intercepté (*refresh token rotation*). Désactivé par défaut. |

### Access tokens

| Paramètre | Explications détaillées |
| :--- | :--- |
| Access Token Lifespan | Durée de validité (en minutes) des access tokens. Une valeur courte réduit la fenêtre d'exploitation d'un token compromis. Il est recommandé de rester en dessous de la valeur `SSO Session Idle` (par défaut 30 minutes). |
| Access Token Lifespan For Implicit Flow | Durée de validité (en minutes) des access tokens émis via le flux *Implicit* (déprécié). Ce flux ne dispose pas de refresh token, d'où une durée potentiellement plus longue. |
| Client Login Timeout | Durée maximale (en minutes) accordée à un client pour terminer un échange de code dans le flux *Authorization Code*. Au-delà, le code d'autorisation expire. |

### Action tokens

Les action tokens sont des tokens à usage unique générés par Keycloak pour des actions sensibles déclenchées par e-mail (vérification, reset de mot de passe, etc.).

| Paramètre | Explications détaillées |
| :--- | :--- |
| User-Initiated Action Lifespan | Durée de validité (en minutes) des action tokens déclenchés par l'utilisateur lui-même (ex. mise à jour de l'e-mail depuis la console de compte). |
| Default Admin-Initiated Action Lifespan | Durée de validité par défaut (en heures) des action tokens déclenchés par un administrateur (ex. envoi d'un e-mail de vérification ou d'un lien de reset depuis la console admin). |

### Override Action Tokens

Permet de surcharger la durée de validité par défaut pour chaque type d'action token spécifique. Si laissé vide, la valeur de `Default Admin-Initiated Action Lifespan` s'applique.

| Paramètre | Explications détaillées |
| :--- | :--- |
| Email Verification | Durée de validité (en minutes) du lien envoyé pour vérifier l'adresse e-mail d'un utilisateur. |
| IdP account email verification | Durée de validité (en minutes) du lien de vérification e-mail dans le cadre d'une liaison de compte via un fournisseur d'identité externe. |
| Forgot password | Durée de validité (en minutes) du lien de réinitialisation de mot de passe envoyé à l'utilisateur. |
| Execute actions | Durée de validité (en minutes) des liens d'actions requises envoyés par un administrateur (ex. mise à jour du profil, configuration OTP). |

## Client Policies

Les *Client Policies* permettent d'appliquer automatiquement des règles de sécurité à des groupes de clients, selon des conditions définies. Elles s'appuient sur des *Profiles* qui regroupent des executors (validateurs de configuration).

La configuration est accessible via deux modes : **Form view** (interface graphique) ou **JSON editor** (édition directe du JSON de configuration).

### Profiles

Un profil regroupe un ensemble d'*executors* qui vérifient ou appliquent des contraintes sur les clients (ex. algorithme de signature obligatoire, PKCE requis, mTLS). Keycloak fournit des profils globaux prédéfinis correspondant aux principales spécifications de sécurité.

Profils globaux disponibles par défaut :

| Nom | Description |
| :--- | :--- |
| fapi-1-baseline | Impose la conformité à la spécification *Financial-grade API Security Profile 1.0 — Part 1: Baseline*. |
| fapi-1-advanced | Impose la conformité à *FAPI 1.0 — Part 2: Advanced*. Niveau de sécurité supérieur à `fapi-1-baseline`. |
| fapi-ciba | Impose la conformité à *FAPI: Client Initiated Backchannel Authentication Profile*. Doit être combiné avec `fapi-1-advanced` pour satisfaire FAPI-CIBA complètement. |
| fapi-2-security-profile | Impose la conformité à *FAPI 2.0 Security Profile Final*. |
| fapi-2-message-signing | Impose la conformité à *FAPI 2.0 Message Signing Final* (signature des requêtes et réponses). |
| oauth-2-1-for-confidential-client | Impose la conformité à *OAuth 2.1* pour les clients confidentiels. |
| oauth-2-1-for-public-client | Impose la conformité à *OAuth 2.1* pour les clients publics (PKCE obligatoire, implicit flow interdit, etc.). |
| fapi-2-dpop-security-profile | Variante de `fapi-2-security-profile` utilisant *DPoP* (Demonstrating Proof of Possession) pour lier les tokens à un client. |
| fapi-2-dpop-message-signing | Variante de `fapi-2-message-signing` avec DPoP. |
| saml-security-profile | Impose des contraintes de sécurité aux clients SAML (signature des requêtes, algorithmes autorisés, etc.). |

Les profils globaux ne sont pas modifiables. Il est possible de créer des profils personnalisés pour le realm.

### Policies

Une politique (*policy*) relie des **conditions** (ex. type de client, présence d'un scope, protocole utilisé) à un ou plusieurs **profils**. Lorsque les conditions sont remplies, les executors des profils associés sont appliqués au client.

Par défaut, aucune politique n'est définie dans le realm. Les politiques sont entièrement personnalisées et créées selon les besoins.

## User Profile

Permet de définir le schéma du profil utilisateur du realm : quels attributs existent, comment ils sont validés, qui peut les lire ou les modifier. La configuration est accessible via trois onglets : **Attributes**, **Attributes Group** et **JSON editor**.

### Attributes

Liste des attributs du profil utilisateur. Chaque ligne affiche le nom technique de l'attribut, son nom d'affichage et le groupe auquel il appartient.

#### Formulaire de création / édition d'un attribut

##### General settings

| Paramètre | Explications détaillées |
| :--- | :--- |
| Attribute Name | Nom technique de l'attribut, utilisé comme clé dans les données utilisateur et dans les tokens (si mappé). Doit être unique dans le realm. |
| Display name | Libellé affiché à l'utilisateur sur les formulaires (inscription, console de compte). Peut contenir une clé i18n entre `${}` pour la traduction. |
| Multivalued | Si activé, l'attribut peut contenir plusieurs valeurs (liste). Si désactivé, une seule valeur est acceptée. |
| Default value | Valeur pré-remplie lors de la création d'un utilisateur si aucune valeur n'est fournie. |
| Attribute group | Groupe d'attributs auquel appartient cet attribut. Les groupes permettent d'organiser les attributs et de contrôler leur affichage sur les formulaires. |
| Enabled when | Condition d'activation de l'attribut. `Always` : l'attribut est toujours actif. `Scopes are requested` : l'attribut n'est activé (visible, requis, validé) que lorsque certains scopes OAuth2 sont demandés par le client. |
| Required field | Si activé, l'attribut est obligatoire. Il est possible de conditionner l'obligation selon le rôle (utilisateur ou admin) et le contexte (inscription, mise à jour de profil). |

##### Permission

Contrôle qui peut lire et modifier cet attribut. Les permissions sont définies séparément pour l'utilisateur et l'administrateur.

| Paramètre | Explications détaillées |
| :--- | :--- |
| Who can edit? | Détermine si l'**utilisateur** et/ou l'**admin** peuvent modifier la valeur de cet attribut. Si l'utilisateur n'a pas la permission d'édition, le champ est en lecture seule dans la console de compte. |
| Who can view? | Détermine si l'**utilisateur** et/ou l'**admin** peuvent voir cet attribut. Un attribut invisible pour l'utilisateur n'apparaît pas dans la console de compte ni dans les réponses userinfo si non mappé explicitement. |

##### Validations

Liste des validateurs appliqués à la valeur de l'attribut lors de la soumission d'un formulaire. Aucun validateur n'est défini par défaut. Des validateurs standard sont disponibles (longueur, format e-mail, expression régulière, liste de valeurs autorisées, etc.) et des validateurs personnalisés peuvent être ajoutés via SPI.

##### Annotations

Métadonnées clé/valeur libres attachées à l'attribut. Utilisées principalement pour transmettre des informations aux thèmes (ex. type de champ HTML à utiliser, ordre d'affichage, icône) ou à des extensions tierces. N'ont pas d'effet fonctionnel dans Keycloak lui-même.

### Attributes Group

Permet de regrouper des attributs sous une même étiquette pour organiser leur affichage sur les formulaires utilisateur.

#### Formulaire de création / édition d'un groupe

| Paramètre | Explications détaillées |
| :--- | :--- |
| Name | Identifiant technique du groupe, référencé dans les attributs via le champ `Attribute group`. Doit être unique dans le realm. |
| Display name | Libellé affiché comme titre de section sur les formulaires utilisateur (inscription, console de compte). Peut contenir une clé i18n entre `${}`. |
| Display description | Texte descriptif affiché sous le titre du groupe sur les formulaires. Permet d'ajouter une explication ou une instruction pour l'utilisateur. |
| Annotations | Métadonnées clé/valeur libres attachées au groupe. Utilisées par les thèmes ou des extensions pour contrôler l'apparence ou le comportement du groupe (ex. ordre d'affichage, icône). N'ont pas d'effet fonctionnel dans Keycloak lui-même. |

### JSON editor

Vue et édition directe de la configuration du profil utilisateur au format JSON. Permet d'importer ou d'exporter la configuration complète (attributs, groupes, validateurs, annotations) en une seule opération. Utile pour l'automatisation ou la réplication de configuration entre realms.

## User Registration

### Default roles

Liste des rôles attribués automatiquement à tout nouvel utilisateur créé ou importé dans le realm. Ces rôles sont assignés à la création du compte, quelle que soit la méthode d'inscription (formulaire, import, identity brokering).

| Colonne | Explications détaillées |
| :--- | :--- |
| Name | Nom du rôle, préfixé par le client propriétaire le cas échéant (ex. `account\view-profile` désigne le rôle `view-profile` du client `account`). Les rôles sans préfixe sont des rôles du realm. |
| Inherited | Indique si le rôle est hérité d'un rôle composite. `False` : le rôle est assigné directement, pas via un rôle parent. |
| Description | Description textuelle du rôle. |

Les rôles par défaut dans un realm fraîchement créé sont :

| Rôle | Description |
| :--- | :--- |
| `account\view-profile` | Permet à l'utilisateur de consulter son propre profil dans la console de compte. |
| `account\manage-account` | Permet à l'utilisateur de gérer son compte (modifier ses informations, ses credentials, ses sessions) dans la console de compte. |
| `offline_access` | Permet à l'utilisateur d'obtenir des refresh tokens hors-ligne (longue durée de vie) auprès des clients qui le demandent. |
| `uma_authorization` | Permet à l'utilisateur d'utiliser le point d'entrée UMA pour gérer ses autorisations de ressources (*User-Managed Access*). |

Des rôles supplémentaires peuvent être assignés par défaut via le bouton **Assign role**. L'option **Hide inherited roles** masque les rôles obtenus par héritage de rôles composites pour n'afficher que les assignations directes.

### Default groups

Groupes assignés automatiquement à tout nouvel utilisateur créé ou importé dans le realm, y compris via l'identity brokering. Permet de pré-affecter des utilisateurs à des groupes sans intervention manuelle.

Par défaut, aucun groupe n'est défini. Les groupes par défaut s'ajoutent depuis cette page et s'appliquent immédiatement aux futurs utilisateurs (les utilisateurs existants ne sont pas affectés rétroactivement).
