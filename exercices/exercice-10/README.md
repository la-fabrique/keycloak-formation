# Exercice 10 — Signer le traité diplomatique

> **Module 4 — Intégrations externes et durcissement**

---

## Objectifs pédagogiques

À l'issue de cet exercice, vous serez capable de :

- Créer un **realm externe** simulant un empire tiers (`OtherAuth` — La Confédération d'Ostmark)
- Configurer un **Identity Provider OIDC** dans Valdoria pour déléguer l'authentification à Ostmark
- Comprendre le rôle de **broker d'identité** joué par Keycloak
- Configurer un **IDP Mapper** pour traduire un rôle étranger (`tradesman`) en rôle local (`marchand`)
- Vérifier qu'un sujet ostmarkien obtient les **bons droits dans Valdoria** sans y avoir de compte préalable
- *(Pour aller plus loin)* Mapper un **attribut cross-IDP** (`city` → `villeOrigine`)

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le realm `valdoria` doit exister avec les rôles `sujet`, `marchand` et `gouverneur` (exercice 2 complété)
- Les clients `comptoir-des-voyageurs` et `reserve-valdoria` doivent être configurés (exercice 4 complété)
- Le scope `attributs-valdorien` avec le mapper `villeOrigine` doit être configuré (exercice 4 complété)

### Prérequis de connaissances

- Avoir complété les exercices 1 à 9
- Connaître la notion de clients OIDC et de mappers de tokens

---

## Contexte narratif

> La Province de Valdoria a bâti son système d'identité de toutes pièces : ses guildes, ses registres, ses automates impériaux. Mais le monde ne s'arrête pas aux frontières de l'empire.
>
> Une délégation arrive de la **Confédération d'Ostmark** (`OtherAuth`), empire marchand de l'est. Ses sujets disposent déjà de leurs propres laissez-passer ostmarkiens — il serait fastidieux de les obliger à recréer un compte dans Valdoria.
>
> Les deux empires signent un **traité diplomatique** : désormais, tout sujet d'Ostmark peut se présenter au Comptoir des voyageurs avec son identité ostmarkienne. Valdoria délègue l'authentification à l'ambassade d'Ostmark, tout en conservant le contrôle de ses propres autorisations.
>
> Votre mission : ouvrir l'ambassade, configurer le traité, et vérifier que **Ragnar**, marchand ostmarkien (`tradesman`), obtient bien le titre de `marchand` dans Valdoria.

---

## Concepts nouveaux

### Keycloak comme broker d'identité

Keycloak peut agir simultanément comme **Identity Provider** (pour ses propres utilisateurs) et comme **Service Provider** (en déléguant l'authentification à un IDP externe). C'est le rôle de broker.

```
Sujet ostmarkien (Ragnar)
        │
        │  "Se connecter avec Ostmark"
        ▼
Comptoir des voyageurs (Valdoria)
        │
        │  redirect vers l'ambassade
        ▼
Keycloak realm OtherAuth  ←── authentification réelle ici
        │
        │  token ostmarkien (contient : tradesman)
        ▼
Keycloak realm valdoria  ←── broker : traduit l'identité
        │
        │  IDP Mapper : tradesman → marchand
        ▼
Token valdorien (contient : marchand, sujet)
        │
        ▼
Réserve de Valdoria ✅
```

Valdoria ne vérifie jamais le mot de passe de Ragnar. Elle fait confiance au token signé par Ostmark.

### IDP Mapper

Un **IDP Mapper** permet de traduire des informations contenues dans le token d'un IDP externe vers les concepts Keycloak locaux (rôles, attributs). Sans mapper, le sujet étranger n'obtient que le rôle par défaut du realm.

| Mapper | Source (token Ostmark) | Cible (realm Valdoria) |
|--------|------------------------|------------------------|
| **Hardcoded Role** conditionnel | Claim `tradesman` dans les rôles | Realm role `marchand` |

---

## Étapes

### Étape 1 — Créer le realm `OtherAuth` (La Confédération d'Ostmark)

Ce realm simule l'empire tiers. Il sera l'IDP externe de Valdoria.

1. Connectez-vous à la console Keycloak : **http://localhost:8080**
2. Assurez-vous d'être dans le realm **master** (menu déroulant en haut à gauche)
3. Cliquez sur le menu déroulant des realms, puis **Create realm**
4. Renseignez :
   - **Realm name** : `OtherAuth`
   - **Display name** : `La Confédération d'Ostmark`
5. Cliquez **Create**

---

### Étape 2 — Créer le sujet de test `ragnar` dans `OtherAuth`

1. Sélectionnez le realm **OtherAuth**
2. Dans le menu de gauche, allez dans **Users**
3. Cliquez **Create new user**
4. Renseignez :
   - **Username** : `ragnar`
   - **Email** : `ragnar@ostmark.conf`
   - **First name** : Ragnar
   - **Last name** : Ostmark
   - **Email verified** : ON
5. Cliquez **Create**
6. Allez dans l'onglet **Credentials**
7. Cliquez **Set password**, définissez `ostmark123`, désactivez **Temporary**
8. Cliquez **Save**

---

### Étape 3 — Attribuer le rôle `tradesman` à Ragnar

1. Toujours dans le realm **OtherAuth**, allez dans **Realm roles**
2. Cliquez **Create role**
3. Renseignez :
   - **Role name** : `tradesman`
   - **Description** : `Marchand de la Confédération d'Ostmark`
4. Cliquez **Save**
5. Retournez dans **Users**, cliquez sur **ragnar**
6. Allez dans l'onglet **Role mapping**
7. Cliquez **Assign role**, sélectionnez **`tradesman`**, cliquez **Assign**

---

### Étape 4 — Créer le client OIDC d'Ostmark pour Valdoria

Valdoria doit s'enregistrer comme client auprès d'Ostmark pour pouvoir lui déléguer l'authentification.

1. Toujours dans le realm **OtherAuth**, allez dans **Clients**
2. Cliquez **Create client**
3. Renseignez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Client type** | `OpenID Connect` |
   | **Client ID** | `valdoria-broker` |

4. Cliquez **Next**
5. Activez **Client authentication** (ON) → le client sera confidentiel
6. Cliquez **Next**
7. Dans **Valid redirect URIs**, ajoutez :
   ```
   http://localhost:8080/realms/valdoria/broker/ostmark/endpoint
   ```
8. Cliquez **Save**
9. Allez dans l'onglet **Credentials** et **copiez le Client Secret** — vous en aurez besoin à l'étape suivante.

---

### Étape 5 — Configurer l'Identity Provider dans Valdoria

1. Sélectionnez le realm **valdoria**
2. Dans le menu de gauche, allez dans **Identity providers**
3. Cliquez **Add provider** et sélectionnez **OpenID Connect v1.0**
4. Renseignez les paramètres suivants :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Alias** | `ostmark` |
   | **Display name** | `La Confédération d'Ostmark` |
   | **Discovery endpoint** | `http://keycloak:8080/realms/OtherAuth/.well-known/openid-configuration` |

5. Cliquez sur **Import** (ou **Import external IdP config**) pour charger automatiquement les URLs depuis le Discovery endpoint

   > **Si l'import automatique échoue** (résolution DNS), renseignez manuellement :
   > - **Authorization URL** : `http://localhost:8080/realms/OtherAuth/protocol/openid-connect/auth`
   > - **Token URL** : `http://localhost:8080/realms/OtherAuth/protocol/openid-connect/token`
   > - **Issuer** : `http://localhost:8080/realms/OtherAuth`

6. Renseignez ensuite :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Client ID** | `valdoria-broker` |
   | **Client Secret** | *(le secret copié à l'étape 4)* |
   | **Client Authentication** | `Client secret sent as post` |

7. Dans la section **Advanced** :
   - **Trust Email** : ON (pour éviter une vérification email au premier login)

8. Cliquez **Add**

**Vérification :**

1. Ouvrez le Comptoir des voyageurs : **http://localhost:5173**
2. Déconnectez-vous si vous êtes connecté, puis cliquez **Se connecter**
3. Sur la page de login Keycloak, vérifiez qu'un bouton **La Confédération d'Ostmark** est apparu

**Point d'observation :** Valdoria reconnaît désormais l'ambassade d'Ostmark. Mais si Ragnar se connecte maintenant, il n'obtiendra que le rôle `sujet` par défaut — le traité ne prévoit pas encore la traduction des titres ostmarkiens.

---

### Étape 6 — Configurer l'IDP Mapper (`tradesman` → `marchand`)

1. Dans le realm **valdoria**, allez dans **Identity providers**
2. Cliquez sur **`ostmark`** pour ouvrir sa configuration
3. Allez dans l'onglet **Mappers**
4. Cliquez **Add mapper**
5. Renseignez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `tradesman-vers-marchand` |
   | **Sync mode override** | `Inherit` |
   | **Mapper type** | `Hardcoded Role` |
   | **Role** | `marchand` |

6. Cliquez **Save**

> **Comment fonctionne ce mapper ?** À chaque connexion via l'IDP `ostmark`, Keycloak attribue automatiquement le rôle `marchand` à l'utilisateur fédéré. Dans un cas réel, on utiliserait un mapper de type **Role** conditionnel basé sur un claim du token. Ici, pour simplifier, on attribue le rôle à tous les sujets d'Ostmark — ce qui représente bien le traité : Ostmark ne fait transiter que ses marchands vers Valdoria.

---

### Étape 7 — Tester le traité : connexion de Ragnar

1. Ouvrez le Comptoir des voyageurs : **http://localhost:5173**
2. Déconnectez-vous si une session est active
3. Cliquez **Se connecter**
4. Sur la page de login Keycloak, cliquez sur **La Confédération d'Ostmark**
5. Vous êtes redirigé vers la page de login du realm `OtherAuth`
6. Connectez-vous avec **`ragnar`** / `ostmark123`
7. Keycloak redirige automatiquement vers le Comptoir des voyageurs

**Vérification dans la page Debug :**

1. Allez dans la page **Debug** du Comptoir
2. Inspectez l'access token :
   - **`preferred_username`** : `ragnar` ✅
   - **`realm_access.roles`** contient **`marchand`** ✅ (mapper IDP en action)
   - **`realm_access.roles`** contient **`sujet`** ✅ (rôle par défaut du realm)
3. Naviguez vers la page **Inventaire**
4. Constatez que Ragnar y accède ✅

**Vérification dans la console d'administration :**

1. Retournez dans la console Keycloak, realm **valdoria**
2. Dans **Users**, recherchez **ragnar**
3. Ragnar est maintenant présent dans Valdoria ✅ — son compte a été créé automatiquement lors du premier login
4. Observez l'onglet **Identity provider links** : il indique `ostmark` comme IDP source

**Point d'observation :** Ragnar n'avait pas de compte dans Valdoria avant de se connecter. Keycloak a automatiquement créé un compte fédéré lors du premier login (first login flow). Son identité reste liée à Ostmark : si son compte Ostmark est désactivé, il ne pourra plus entrer dans Valdoria.

---

## Point clé

> **Keycloak broker d'identité : déléguer l'authentification sans abandonner les autorisations.**
>
> Quand Valdoria délègue l'authentification à Ostmark, elle ne délègue pas ses propres règles d'accès. Le token final est émis par Valdoria — avec les rôles valdoriens. Keycloak joue le rôle d'intermédiaire de confiance : il valide l'identité auprès d'Ostmark, puis applique ses propres mappers pour produire un token valdorien.
>
> Les **IDP Mappers** sont le mécanisme clé pour traduire les identités étrangères : sans eux, tout sujet étranger n'obtient que le rôle par défaut. Avec eux, les titres ostmarkiens (`tradesman`) sont reconnus et convertis en titres valdoriens (`marchand`).

---

## Pour aller plus loin

### Mapper l'attribut `city` → `villeOrigine`

Les sujets ostmarkiens peuvent également transmettre leur ville d'origine. Configurons un mapper d'attribut pour que `city` dans le token Ostmark alimente `villeOrigine` dans Valdoria.

#### Ajouter l'attribut `city` à Ragnar dans `OtherAuth`

1. Dans le realm **OtherAuth**, allez dans **Users**, cliquez sur **ragnar**
2. Allez dans l'onglet **Attributes**
3. Ajoutez l'attribut :
   - **Key** : `city`
   - **Value** : `Ostheim`
4. Cliquez **Save**

#### Configurer le mapper `city` dans le client `valdoria-broker`

Pour que `city` soit inclus dans le token envoyé par Ostmark à Valdoria, il faut créer un mapper côté client.

1. Dans le realm **OtherAuth**, allez dans **Clients**, cliquez sur **`valdoria-broker`**
2. Allez dans l'onglet **Client scopes**
3. Cliquez sur **`valdoria-broker-dedicated`**
4. Dans l'onglet **Mappers**, cliquez **Configure a new mapper**
5. Sélectionnez **User Attribute**
6. Renseignez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `city` |
   | **User Attribute** | `city` |
   | **Token Claim Name** | `city` |
   | **Claim JSON Type** | `String` |
   | **Add to access token** | ON |

7. Cliquez **Save**

#### Configurer l'IDP Mapper d'attribut dans Valdoria

1. Dans le realm **valdoria**, allez dans **Identity providers**, cliquez sur **`ostmark`**
2. Allez dans l'onglet **Mappers**, cliquez **Add mapper**
3. Renseignez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `city-vers-villeOrigine` |
   | **Sync mode override** | `Inherit` |
   | **Mapper type** | `Attribute Importer` |
   | **Claim** | `city` |
   | **User Attribute Name** | `villeOrigine` |

4. Cliquez **Save**

#### Vérifier

1. Dans le Comptoir des voyageurs, déconnectez-vous puis reconnectez-vous avec **ragnar** via Ostmark
   > La reconnexion est nécessaire pour que le mapper s'applique à la session.
2. Dans la page **Debug**, vérifiez que l'access token contient désormais :
   - **`villeOrigine`** : `Ostheim` ✅
3. Naviguez vers `/villes/ostheim/artefacts` via la page **Artefacts** du Comptoir
4. Ragnar accède aux artefacts d'Ostheim ✅ (ABAC : rôle `marchand` + `villeOrigine` correspondante)

**Point d'observation :** L'ABAC fonctionne de bout en bout, même pour un utilisateur fédéré. La ville d'Ostheim n'existe pas dans Valdoria — mais la Réserve ne vérifie que le claim `villeOrigine` du token, indépendamment de son origine.

---

## Dépannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| Le bouton **La Confédération d'Ostmark** n'apparaît pas | L'IDP n'est pas activé ou l'alias est incorrect | Vérifiez que l'IDP `ostmark` est bien sauvegardé dans le realm `valdoria` |
| **Discovery endpoint** échoue à l'import | Résolution DNS `keycloak` impossible depuis le navigateur | Utilisez `localhost` dans l'URL du Discovery endpoint, ou renseignez les URLs manuellement |
| Ragnar n'a pas le rôle `marchand` après connexion | Le mapper `tradesman-vers-marchand` n'est pas configuré | Vérifiez l'onglet **Mappers** de l'IDP `ostmark` (étape 6) |
| Erreur **Invalid redirect URI** lors de la connexion Ostmark | L'URI de redirection du client `valdoria-broker` est incorrecte | Vérifiez que `http://localhost:8080/realms/valdoria/broker/ostmark/endpoint` est dans les **Valid redirect URIs** du client (étape 4) |
| Ragnar n'est pas créé dans Valdoria après connexion | Problème de first login flow | Vérifiez dans **Authentication > Flows** que le flow **First Broker Login** est actif |
| `villeOrigine` absent du token (Pour aller plus loin) | Le mapper côté `OtherAuth` n'inclut pas `city` dans le token | Vérifiez le mapper dans le client `valdoria-broker` (onglet Client scopes) |
