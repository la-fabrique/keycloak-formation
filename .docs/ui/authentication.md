# Authentication Realm Keycloak — Référence

Documentation exhaustive des paramètres de configuration de l'authentification d'un realm dans l'interface d'administration Keycloak. Les valeurs concrètes ne figurent pas ici ; seuls le rôle et l'effet de chaque paramètre sont décrits.

## Policies

L'onglet **Policies** regroupe les politiques de sécurité applicables aux credentials et aux méthodes d'authentification du realm.

### Password Policy

Définit les règles de composition et de gestion des mots de passe pour tous les utilisateurs du realm. Les politiques s'ajoutent individuellement via le bouton **Add policy** ; aucune politique n'est active par défaut.

| Paramètre | Explications détaillées |
| :--- | :--- |
| Minimum Length | Longueur minimale (en caractères) acceptée pour un mot de passe. Tout mot de passe plus court est refusé lors de la création ou de la modification. |
| Uppercase Characters | Nombre minimal de lettres majuscules (A–Z) requis dans le mot de passe. |
| Digits | Nombre minimal de chiffres (0–9) requis dans le mot de passe. |
| Special Characters | Nombre minimal de caractères spéciaux (ex. `!`, `@`, `#`) requis dans le mot de passe. |

### OTP Policy

Configure le comportement des tokens OTP (*One-Time Password*) générés par des applications d'authentification (FreeOTP, Google Authenticator, Microsoft Authenticator). Deux types sont supportés, avec des paramètres distincts.

#### Paramètres communs (Time-based et Counter-based)

| Paramètre | Explications détaillées |
| :--- | :--- |
| OTP type | Mode de génération du code OTP. **`Time based`** (TOTP) : le code est valide pendant une fenêtre temporelle (par défaut 30 secondes). **`Counter based`** (HOTP) : le code change à chaque utilisation selon un compteur incrémental. |
| OTP hash algorithm | Algorithme HMAC utilisé pour générer le code OTP. `SHA1` est la valeur standard supportée par la plupart des applications. |
| Number of digits | Nombre de chiffres du code OTP affiché à l'utilisateur. `6` est la valeur standard ; `8` offre une entropie supérieure. |
| Look around window | Nombre de codes supplémentaires (avant et après la valeur courante) acceptés par Keycloak pour absorber les décalages d'horloge (TOTP) ou les codes non utilisés (HOTP). Augmenter cette valeur réduit les échecs légitimes mais élargit la fenêtre d'attaque. |
| Supported applications | Applications d'authentification reconnues pour ce realm. Les applications listées sont affichées à l'utilisateur lors de la configuration de son OTP. Valeurs possibles : `FreeOTP`, `Google Authenticator`, `Microsoft Authenticator`. |
| Reusable token | Si activé, un même code OTP peut être utilisé plusieurs fois pendant sa période de validité. Désactivé par défaut pour empêcher la réutilisation d'un code intercepté. |

#### Paramètre spécifique au mode Time-based (TOTP)

| Paramètre | Explications détaillées |
| :--- | :--- |
| OTP Token period | Durée de validité (en secondes) d'un code TOTP. La valeur standard est 30 secondes. Une valeur plus longue facilite la saisie mais allonge la fenêtre d'exploitation d'un code compromis. |

#### Paramètre spécifique au mode Counter-based (HOTP)

| Paramètre | Explications détaillées |
| :--- | :--- |
| Initial counter | Valeur de départ du compteur HOTP lors de l'enregistrement d'un nouvel appareil OTP. La valeur `0` est standard. Modifier cette valeur permet de désynchroniser volontairement les appareils déjà enregistrés. |

### WebAuthn Policy

Configure les paramètres de l'authentification WebAuthn (FIDO2) pour le realm, utilisée comme second facteur ou méthode d'authentification forte. Ces paramètres s'appliquent aux authenticators physiques (clés de sécurité, empreinte biométrique, etc.).

| Paramètre | Explications détaillées |
| :--- | :--- |
| Relying party entity name | Nom lisible de l'entité (application ou organisation) affiché à l'utilisateur lors de l'enregistrement ou de l'authentification WebAuthn. Requis. |
| Signature algorithms | Algorithmes de signature cryptographique acceptés par le realm pour les assertions WebAuthn. Les valeurs courantes sont `ES256` (ECDSA) et `RS256` (RSA). Plusieurs algorithmes peuvent être sélectionnés. |
| Relying party ID | Identifiant technique de la Relying Party, généralement le domaine de l'application (ex. `example.com`). Les authenticators lient leurs credentials à cet identifiant ; une modification invalide les credentials existants. Si vide, Keycloak utilise le domaine de la requête. |
| Attestation conveyance preference | Niveau de vérification de l'attestation de l'authenticator demandé par le serveur. `None` : aucune attestation requise. `Indirect` : une attestation anonymisée est préférée. `Direct` : l'attestation complète est demandée (peut identifier le modèle d'authenticator). |
| Authenticator attachment | Type d'authenticator accepté. `Cross platform` : authenticators externes (clés USB, NFC, Bluetooth). `Platform` : authenticators intégrés à l'appareil (Touch ID, Windows Hello). Si non spécifié, les deux types sont acceptés. |
| Require discoverable credential | Si activé, seuls les authenticators capables de stocker des credentials sans information de compte côté client (*resident keys*) sont acceptés. Requis pour les flux sans nom d'utilisateur. |
| User verification requirement | Niveau de vérification de l'utilisateur exigé lors de l'authentification. `Not specified` : laissé à la discrétion de l'authenticator. `Required` : vérification de l'utilisateur obligatoire (PIN, biométrie). `Preferred` / `Discouraged` : indications non contraignantes. |
| Timeout | Durée maximale (en secondes) accordée à l'utilisateur pour interagir avec son authenticator. Au-delà, l'opération est abandonnée. |
| Avoid same authenticator registration | Si activé, un authenticator déjà enregistré ne peut pas être enregistré une seconde fois pour le même compte. Désactivé par défaut. |
| Acceptable AAGUIDs | Liste des identifiants AAGUID (*Authenticator Attestation GUID*) acceptés. Permet de restreindre l'enregistrement à des modèles d'authenticators approuvés. Si vide, tous les authenticators sont acceptés. |
| Extra Origins | Origines supplémentaires (en plus du Relying party ID) autorisées à initier des opérations WebAuthn. Utile lorsque l'application est accessible depuis plusieurs domaines. |

### WebAuthn Passwordless Policy

Configure les paramètres WebAuthn spécifiques au flux d'authentification sans mot de passe (*passwordless*). Les paramètres sont identiques à la **WebAuthn Policy** avec les différences et ajouts suivants :

| Paramètre | Différence par rapport à WebAuthn Policy |
| :--- | :--- |
| Attestation conveyance preference | Valeur par défaut : `Not specified` (au lieu de `None`). |
| Authenticator attachment | Valeur par défaut : `Not specified` (accepte tous les types, au lieu de `Cross platform` uniquement). |
| Require discoverable credential | Activé par défaut (`Yes`), car les credentials résidentes sont nécessaires pour l'authentification sans saisie de nom d'utilisateur. |
| User verification requirement | `Required` par défaut, car la vérification de l'utilisateur (PIN ou biométrie) est indispensable dans un flux sans mot de passe. |

#### Paramètre supplémentaire

| Paramètre | Explications détaillées |
| :--- | :--- |
| Enable Passkeys | Si activé, active la prise en charge des Passkeys (credentials synchronisables entre appareils via un gestionnaire de mots de passe ou un écosystème de plateforme). Désactivé par défaut. Nécessite que `Require discoverable credential` soit activé et `User verification requirement` défini sur `Required`. |

### CIBA Policy

Configure les paramètres du flux *Client Initiated Backchannel Authentication* (CIBA), qui permet à un client d'initier une authentification découplée : l'utilisateur s'authentifie sur un appareil secondaire (ex. application mobile) sans redirection du navigateur principal.

| Paramètre | Explications détaillées |
| :--- | :--- |
| Backchannel Token Delivery Mode | Mode de livraison du token au client après authentification. `Poll` : le client interroge périodiquement l'endpoint token de Keycloak jusqu'à obtenir le résultat. `Ping` : Keycloak notifie le client via une URL de callback lorsque l'authentification est terminée. `Push` : Keycloak pousse directement le token vers le client. |
| Expires In | Durée de validité (en secondes) de la requête d'authentification CIBA. Passé ce délai, la requête expire et l'utilisateur doit en initier une nouvelle. Requis. |
| Interval | Intervalle minimal (en secondes) entre deux requêtes de polling du client vers l'endpoint token de Keycloak. Évite les requêtes trop fréquentes. Requis en mode `Poll`. |
| Authentication Requested User Hint | Indique comment le client transmet l'identité de l'utilisateur dans la requête CIBA. `login_hint` : le client envoie le nom d'utilisateur ou l'adresse e-mail. D'autres valeurs (`id_token_hint`, `login_hint_token`) peuvent être supportées selon la configuration. |
