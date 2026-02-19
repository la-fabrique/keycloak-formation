# 🏰 Réserve de Valdoria

API protégée par Keycloak pour la formation — Démonstration des concepts RBAC et ABAC.

## 📋 Description

La **Réserve de Valdoria** est une API REST minimaliste qui illustre les mécanismes de sécurité suivants :

- **Authentification JWT** : Validation des tokens émis par Keycloak via les clés publiques JWKS
- **RBAC (Role-Based Access Control)** : Contrôle d'accès basé sur les rôles (`marchand`, `gouverneur`)
- **ABAC (Attribute-Based Access Control)** : Filtrage contextuel basé sur l'attribut `villeOrigine`

## 🚀 Démarrage

### Avec Docker Compose (recommandé)

L'API est intégrée au `docker-compose.yml` de la formation :

```bash
cd infrastructure
docker compose up -d
```

L'API sera accessible sur `http://localhost:3001`

### En développement local

```bash
cd packages/api
npm install
cp .env.example .env
# Éditer .env avec les bonnes valeurs
npm run dev
```

## 🔐 Configuration Keycloak

### Prérequis dans Keycloak

1. **Realm** : `valdoria` doit exister
2. **Client** : `reserve-valdoria` configuré en **client confidentiel (Resource Server)**
3. **Rôles de royaume** :
   - `sujet` : Citoyen ordinaire
   - `marchand` : Commerçant (accès à l'inventaire et aux artefacts)
   - `gouverneur` : Administrateur (accès total, hérite de `sujet` + `marchand`)
4. **Attribut utilisateur** : `villeOrigine` (valeurs possibles : `valdoria-centre`, `nordheim`, `sudbourg`)
5. **Client Scope** : `attributs-valdorien` avec mapper pour injecter `villeOrigine` dans le token
6. **Mapper d'audience** : Configurer `aud: reserve-valdoria` dans les tokens

### Variables d'environnement

```env
PORT=3001
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=valdoria
KEYCLOAK_CLIENT_ID=reserve-valdoria
```

## 📡 Endpoints

### 1. GET `/info` (Public)

Retourne les informations de base de la Réserve.

**Authentification** : ❌ Aucune

**Exemple de requête** :
```bash
curl http://localhost:3001/info
```

**Réponse** :
```json
{
  "nom": "Réserve de Valdoria",
  "id": "reserve-valdoria",
  "description": "API protégée par Keycloak pour la formation"
}
```

---

### 2. GET `/inventaire` (RBAC)

Retourne l'inventaire de la Réserve.

**Authentification** : ✅ Token JWT requis  
**Autorisation** : Rôle `marchand` requis

**Exemple de requête** :
```bash
curl http://localhost:3001/inventaire \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Réponse (succès)** :
```json
{
  "inventaire": [
    { "id": 1, "nom": "Épée de Valdoria", "quantite": 5 },
    { "id": 2, "nom": "Bouclier impérial", "quantite": 3 },
    ...
  ],
  "total": 5
}
```

**Erreurs possibles** :
- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Rôle `marchand` manquant

---

### 3. GET `/villes/:ville/artefacts` (RBAC + ABAC)

Retourne les artefacts d'une ville spécifique.

**Authentification** : ✅ Token JWT requis  
**Autorisation** :
- Rôle `marchand` requis (RBAC)
- Accès limité à sa `villeOrigine` **sauf pour les `gouverneur`** (ABAC)

**Villes disponibles** : `valdoria-centre`, `nordheim`, `sudbourg`

**Exemple de requête** :
```bash
curl http://localhost:3001/villes/nordheim/artefacts \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Réponse (succès)** :
```json
{
  "ville": "nordheim",
  "artefacts": [
    { "id": 4, "nom": "Hache nordique", "ville": "nordheim" },
    { "id": 5, "nom": "Fourrure d'ours", "ville": "nordheim" },
    { "id": 6, "nom": "Cor de guerre", "ville": "nordheim" }
  ],
  "total": 3
}
```

**Erreurs possibles** :
- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Rôle `marchand` manquant OU ville ne correspond pas à `villeOrigine`
- `404 Not Found` : Ville inexistante

**Règles ABAC** :
- Un utilisateur avec le rôle `marchand` et `villeOrigine: nordheim` peut accéder uniquement à `/villes/nordheim/artefacts`
- Un utilisateur avec le rôle `gouverneur` peut accéder à **toutes** les villes

---

### 4. GET `/health` (Health check)

Vérifie que l'API est opérationnelle.

**Authentification** : ❌ Aucune

**Exemple de requête** :
```bash
curl http://localhost:3001/health
```

**Réponse** :
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T18:30:00.000Z"
}
```

## 🧪 Tests avec Postman

### 1. Obtenir un token d'accès

Utilisez le flux **Authorization Code** ou **Resource Owner Password Credentials** pour obtenir un token :

```bash
POST http://localhost:8080/realms/valdoria/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=comptoir-des-voyageurs
&username=brunhild
&password=<mot_de_passe>
```

### 2. Tester les endpoints protégés

Copiez l'`access_token` de la réponse et utilisez-le dans l'en-tête `Authorization` :

```bash
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Scénarios de test

| Utilisateur | Rôle | `villeOrigine` | `/inventaire` | `/villes/nordheim/artefacts` |
|-------------|------|-----------------|---------------|------------------------------|
| Alaric | `gouverneur` | `valdoria-centre` | ✅ Accès autorisé | ✅ Accès autorisé (toutes villes) |
| Brunhild | `marchand` | `nordheim` | ✅ Accès autorisé | ✅ Accès autorisé (sa ville) |
| Brunhild | `marchand` | `nordheim` | ✅ Accès autorisé | ❌ Refusé pour `/villes/sudbourg/artefacts` |
| Cedric | `sujet` | `sudbourg` | ❌ Refusé (pas `marchand`) | ❌ Refusé (pas `marchand`) |

## 🏗️ Architecture

```
packages/api/
├── src/
│   ├── index.ts              # Serveur Express principal
│   ├── config.ts             # Configuration Keycloak
│   ├── middleware/
│   │   ├── auth.ts           # Validation JWT via JWKS
│   │   ├── rbac.ts           # Contrôle d'accès basé sur les rôles
│   │   └── abac.ts           # Contrôle d'accès basé sur les attributs
│   ├── routes/
│   │   ├── public.ts         # Routes publiques
│   │   ├── inventaire.ts     # Route protégée par RBAC
│   │   └── villes.ts         # Route protégée par RBAC + ABAC
│   └── data/
│       └── mock.ts           # Données mockées
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## 🔍 Concepts pédagogiques

### RBAC (Role-Based Access Control)

Le middleware `rbac.ts` vérifie que l'utilisateur possède un rôle spécifique dans `realm_access.roles` du token JWT.

**Exemple** : L'endpoint `/inventaire` est accessible uniquement aux utilisateurs ayant le rôle `marchand`.

### ABAC (Attribute-Based Access Control)

Le middleware `abac.ts` vérifie un attribut personnalisé (`villeOrigine`) dans le token JWT pour filtrer l'accès aux ressources.

**Exemple** : Un marchand de Nordheim (`villeOrigine: nordheim`) ne peut consulter que les artefacts de Nordheim, sauf s'il a le rôle `gouverneur` (accès total).

### Validation JWT locale

L'API utilise `jwks-rsa` pour récupérer les clés publiques de Keycloak et valider la signature des tokens JWT **sans appel réseau à chaque requête** (les clés sont mises en cache 10 minutes).

## 📚 Ressources

- [Documentation Keycloak](https://www.keycloak.org/documentation)
- [RFC 7519 - JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [OAuth 2.0 & OpenID Connect](https://oauth.net/2/)

## 🛠️ Développement

### Lancer en mode développement

```bash
npm run dev
```

### Compiler TypeScript

```bash
npm run build
```

### Lancer en production

```bash
npm start
```

## 📝 Licence

Ce projet est destiné à un usage pédagogique dans le cadre de la formation Keycloak.
