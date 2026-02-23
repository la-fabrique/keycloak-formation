# Exercice 6 — L'Automate impérial

> **Module 2 — Gestion des clients**
> Difficulté : ★★☆☆☆

---

## Objectifs pédagogiques

À l'issue de cet exercice, vous serez capable de :

- Comprendre le flux **Client Credentials** et en quoi il diffère du flux Authorization Code
- Créer un client Keycloak de type **service account** (aucun utilisateur impliqué)
- Attribuer un rôle directement à un compte de service
- Lancer un automate qui obtient un token et appelle une API protégée

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le client `reserve-valdoria` et le rôle `marchand` doivent exister (exercice 4 complété)
- Node.js installé sur votre machine (`node -v` pour vérifier)

### Prérequis de connaissances

- Avoir complété les exercices 1 à 5
- Connaître la notion de rôles et de clients dans Keycloak

---

## Contexte narratif

> L'Empire d'Authéria ne repose pas uniquement sur des marchands humains.
>
> Des automates impériaux — des processus automatisés — doivent accéder à la Réserve de Valdoria pour consulter l'inventaire : réapprovisionnement, rapports nocturnes, synchronisation de données.
>
> Ces automates n'ont pas de compte utilisateur. Ils s'identifient directement avec leurs propres **identifiants de client**. Votre mission : créer l'automate `automate-imperial` dans Keycloak et lui donner accès à l'inventaire.

---

## Concepts nouveaux

### Flux Client Credentials

Dans les exercices précédents, un utilisateur humain se connectait via un navigateur (flux Authorization Code). Ici, **aucun utilisateur n'est impliqué** : c'est le client lui-même qui s'authentifie.

Le flux est simple :

```
Automate → POST /token  (client_id + client_secret)
         ← access_token

Automate → GET /inventaire  (Authorization: Bearer <token>)
         ← données
```

Le token obtenu porte les rôles attribués **au compte de service du client**, pas à un utilisateur.

### Service Account

Quand on active **Service Accounts** sur un client Keycloak, Keycloak crée automatiquement un utilisateur virtuel associé à ce client : `service-account-<client-id>`. On peut lui attribuer des rôles comme à n'importe quel utilisateur.

---

## Étapes

### Étape 1 — Créer le client `automate-imperial`

1. Connectez-vous à la console Keycloak : **http://localhost:8080**
2. Sélectionnez le realm **valdoria**
3. Allez dans **Clients** → **Create client**
4. Renseignez :
   - **Client ID :** `automate-imperial`
   - **Client type :** OpenID Connect
5. Cliquez **Next**
6. Dans **Capability config** :
   - **Client authentication :** ON (client confidentiel)
   - **Standard flow :** OFF
   - **Direct access grants :** OFF
   - **Service accounts roles :** ON ✅
7. Cliquez **Next** puis **Save**

**Point d'observation :** L'onglet **Credentials** est visible — le client a un secret. Les flux utilisateur (Standard flow) sont désactivés : cet client n'initie jamais de connexion humaine.

---

### Étape 2 — Récupérer le secret

1. Dans le client `automate-imperial`, allez dans l'onglet **Credentials**
2. Copiez la valeur du **Client secret**

Vous en aurez besoin à l'étape 4.

---

### Étape 3 — Attribuer le rôle `marchand` au compte de service

1. Dans le client `automate-imperial`, allez dans l'onglet **Service accounts roles**
2. Cliquez **Assign role**
3. Sélectionnez le rôle **`marchand`** (realm role)
4. Cliquez **Assign**

**Point d'observation :** Vous venez d'attribuer un rôle à `service-account-automate-imperial` — l'utilisateur virtuel de l'automate. Ce rôle apparaîtra dans le token obtenu via Client Credentials.

---

### Étape 4 — Configurer et lancer l'automate

#### Installer les dépendances

Dans un terminal, depuis la racine du projet :

```bash
cd packages/cli
npm install
```

#### Créer le fichier de configuration

```bash
cp .env.example .env
```

Éditez le fichier `.env` et collez le secret copié à l'étape 2 :

```
CLIENT_SECRET=<votre-secret>
```

#### Lancer l'automate

```bash
npm start
```

**Résultat attendu :**

```
[1] Demande de token pour le client "automate-imperial"...

[2] Token obtenu. Contenu :
    sub  : <uuid-du-service-account>
    azp  : automate-imperial
    rôles: default-roles-valdoria, offline_access, uma_authorization, marchand
    exp  : <heure>

[3] Appel de GET http://localhost:3001/inventaire...
    Statut : 200
    Réponse :
    {
        ...
    }
```

> **Checkpoint :** L'automate a obtenu un token et accédé à l'inventaire sans aucune intervention humaine.

---

### Étape 5 — Observer le token

1. Dans `packages/cli/src/index.ts`, décommentez la ligne 35 (`console.log(access_token)`), relancez le CLI si besoin, puis copiez la valeur du token affichée dans les logs
2. Collez-le sur **https://jwt.io**
3. Dans le payload décodé, repérez :

| Champ | Valeur attendue | Ce que ça signifie |
|-------|----------------|---------------------|
| `azp` | `automate-imperial` | Le client qui a demandé le token |
| `realm_access.roles` | contient `marchand` | Le rôle attribué au service account |
| `sub` | UUID du service account | Pas un utilisateur humain |
| `preferred_username` | `service-account-automate-imperial` | Confirmation : c'est un compte de service |

**Point d'observation clé :** Il n'y a pas d'`email`, pas de `given_name`, pas de `villeOrigine` — ce token ne représente pas un humain. Il représente un client applicatif.

---

### Étape 6 — Tester le refus d'accès

Modifiez temporairement le `.env` pour utiliser un mauvais secret :

```
CLIENT_SECRET=mauvais-secret
```

Relancez l'automate et observez l'erreur retournée par Keycloak.

Rétablissez ensuite le bon secret.

---

## Point clé

> **Le flux Client Credentials est le flux des machines.**
>
> Aucun humain n'est impliqué. Le client s'identifie avec son propre secret et obtient un token portant ses propres rôles. L'API ne fait pas la différence entre un token humain et un token de service : elle vérifie la signature et les rôles, c'est tout.
>
> **Un automate et un humain peuvent partager le même rôle** (`marchand` ici). Ce qui les distingue, c'est le flux d'authentification et le `preferred_username` dans le token.

---

## Dépannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| `401 Unauthorized` au token endpoint | Secret incorrect ou client mal configuré | Vérifiez le `.env` et l'onglet Credentials du client |
| `invalid_client` | `client_id` introuvable dans le realm | Vérifiez l'orthographe dans le `.env` |
| `GET /inventaire` renvoie 403 | Rôle `marchand` non attribué au service account | Retournez à l'étape 3 |
| `Service accounts roles` non visible | Service Accounts non activé à la création | Settings du client → Service accounts roles = ON |
