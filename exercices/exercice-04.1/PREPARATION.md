# Exercice 4.1 — Le Régisseur de la Réserve

> **Document de préparation — Usage formateur**
>
> Cet exercice s'insère entre l'exercice 4 (création des clients) et l'exercice 5 (lecture des tokens).

---

## Positionnement pédagogique

### Ce que les participants savent déjà

À l'issue de l'exercice 4, les participants ont manipulé :

- Les **rôles de royaume** (realm roles) simples et composites
- Les **clients** `comptoir-des-voyageurs` et `reserve-valdoria`
- Les **client scopes** et **mappers** (dont le mapper `audience resolve` via les client roles)
- Les **client roles** : ils ont créé `reserve-valdoria/access` et l'ont inclus dans le rôle composite `sujet`

### Concept nouveau introduit par cet exercice

Les **fine-grained admin permissions** (permissions d'administration fines) : déléguer la gestion d'un ou plusieurs clients spécifiques à un utilisateur sans lui donner les droits d'admin global du realm.

### Pourquoi maintenant ?

Les participants viennent de créer les clients. La question naturelle est : *qui peut les administrer sans avoir accès à tout le realm ?* C'est le bon moment pour introduire la délégation d'administration.

---

## Scénario narratif

> La province de Valdoria grandit. L'administration impériale ne peut plus tout gérer seule. Elle nomme **Roderick**, un fonctionnaire de confiance, comme **Régisseur de la Réserve**.
>
> Sa mission : gérer les rôles et la configuration des deux comptoirs (`comptoir-des-voyageurs` et `reserve-valdoria`) — sans pour autant avoir accès à l'ensemble du château impérial.
>
> Les administrateurs impériaux lui accordent des droits précis, sur des ressources précises. Ni plus, ni moins.

---

## Objectifs pédagogiques

À l'issue de cet exercice, les participants seront capables de :

1. Activer les **fine-grained admin permissions** sur le realm
2. Comprendre le modèle **Permission / Policy / Scope** de Keycloak
3. Créer une **permission** sur un client spécifique (manage)
4. Créer une **policy** ciblant un utilisateur précis
5. Vérifier la délégation via l'**API REST Keycloak** (script TypeScript fourni)

---

## Concepts clés à maîtriser (pour le formateur)

### Le modèle Permission / Policy / Scope

Keycloak modélise la délégation d'administration avec trois objets :

| Objet | Rôle | Exemple |
|---|---|---|
| **Resource** | Ce sur quoi on accorde des droits | Le client `reserve-valdoria` |
| **Scope** | Le niveau d'accès accordé | `manage` (créer/modifier/supprimer les rôles, mappers, etc.) |
| **Policy** | Qui bénéficie des droits | L'utilisateur `roderick` |
| **Permission** | Lien entre Resource + Scope + Policy | "roderick peut `manage` `reserve-valdoria`" |

### Le client `realm-management`

Les fine-grained admin permissions de Keycloak reposent sur un client interne du realm : **`realm-management`**. Ce client expose des ressources (les clients du realm, les utilisateurs, les groupes, etc.) et des scopes d'administration. Quand on active les permissions fines, Keycloak crée automatiquement une ressource pour chaque client, et on peut y associer des policies.

### Les scopes disponibles sur un client

Quand on active les permissions fines sur un client, les scopes suivants sont disponibles :

| Scope | Ce que ça permet |
|---|---|
| `view` | Lire la configuration du client |
| `manage` | Modifier la configuration, créer/supprimer des rôles, des mappers, etc. |
| `configure` | Modifier les paramètres avancés |
| `map-roles` | Mapper des rôles du client à des utilisateurs |
| `map-roles-composite` | Inclure les rôles du client dans des rôles composites |
| `map-roles-client-scope` | Inclure les rôles du client dans des client scopes |

**Pour cet exercice, on utilise `manage`** — c'est le scope le plus large qui couvre la création de rôles et la gestion des mappers.

### Ce que `manage` ne couvre PAS

- **Gérer les utilisateurs** : roderick ne peut pas voir ni modifier les utilisateurs du realm
- **Mapper les rôles aux utilisateurs** : roderick ne peut pas assigner un rôle à un utilisateur (c'est couvert par `map-roles` combiné à des droits sur les utilisateurs)
- **Créer des clients** : il ne peut gérer que les clients sur lesquels il a la permission

C'est une bonne occasion de discuter de la **séparation des responsabilités** : un régisseur de ressource technique ≠ un gestionnaire des accès utilisateurs.

---

## Prérequis

- Exercice 4 complété : les clients `comptoir-des-voyageurs` et `reserve-valdoria` existent
- L'environnement Docker est actif

---

## État final attendu dans Keycloak

Après cet exercice, le realm `valdoria` doit contenir :

- Un utilisateur `roderick` (credentials : `valdoria123`)
- Les fine-grained admin permissions activées sur le realm
- Une **policy** `policy-roderick` ciblant l'utilisateur `roderick`
- Sur le client `reserve-valdoria` :
  - Permissions fines activées
  - Permission `manage` associée à `policy-roderick`
- Sur le client `comptoir-des-voyageurs` :
  - Permissions fines activées
  - Permission `manage` associée à `policy-roderick`

---

## Flux technique complet (comment ça marche sous le capot)

```
[Roderick] ──── POST /token (password grant) ────► [Keycloak]
                                                         │
                                                    token avec rôle
                                                    realm-management/
                                                    manage-clients (scopé)
                                                         │
[Roderick] ──── PUT /clients/{id}/roles ─────────► [Admin API]
                                                         │
                                              Keycloak vérifie :
                                              - le token de roderick
                                              - la permission `manage`
                                                sur ce client
                                              - la policy `policy-roderick`
                                                         │
                                              ✅ Autorisé (ou ❌ Refusé)
```

---

## Déroulé de l'exercice (version participants)

### Étape 1 — Créer l'utilisateur Roderick

Via la console d'administration (super-admin) :

1. Créer l'utilisateur `roderick` dans le realm `valdoria`
   - Username : `roderick`
   - Email : `roderick@valdoria.empire`
   - First name : `Roderick`
   - Last name : `le Régisseur`
2. Définir son mot de passe : `valdoria123` (Temporary : OFF)

> Roderick n'a **aucun rôle** pour l'instant. C'est intentionnel.

---

### Étape 2 — Activer les fine-grained admin permissions sur le realm

> **Concept** : Par défaut, Keycloak n'active pas les permissions fines. Il faut l'activer au niveau du realm.

1. Aller dans **Realm settings** → onglet **General**
2. Activer l'option **« Admin permissions »** (ou « User-managed access »)
3. Sauvegarder

**Point d'observation :** Un nouveau client `realm-management` devient visible dans la liste des clients (il était déjà là, mais ses ressources sont maintenant exposées pour la délégation).

---

### Étape 3 — Activer les permissions fines sur `reserve-valdoria`

1. Aller dans **Clients** → `reserve-valdoria`
2. Onglet **« Permissions »**
3. Activer **« Permissions enabled »**

**Observation :** Keycloak affiche automatiquement une liste de scopes disponibles (`view`, `manage`, `configure`, `map-roles`, etc.) avec des liens vers les permissions correspondantes dans le client `realm-management`.

---

### Étape 4 — Créer la policy pour Roderick

> **Concept** : Une policy définit *qui* a accès. Ici, on cible l'utilisateur `roderick`.

1. Dans le client `realm-management` → **Authorization** → **Policies**
2. Créer une nouvelle policy de type **User**
   - Name : `policy-roderick`
   - Users : sélectionner `roderick`
3. Sauvegarder

---

### Étape 5 — Associer la permission `manage` à la policy

1. Retourner dans **Clients** → `reserve-valdoria` → onglet **Permissions**
2. Cliquer sur la permission **`manage`**
3. Dans **Policies**, ajouter `policy-roderick`
4. Sauvegarder

---

### Étape 6 — Répéter pour `comptoir-des-voyageurs`

Même séquence qu'aux étapes 3 et 5 pour le client `comptoir-des-voyageurs`.

---

### Étape 7 — Vérifier via le script `realm-admin`

> Les participants utilisent le script TypeScript fourni dans `packages/realm-admin` pour vérifier que `roderick` peut bien interagir avec l'API Admin de Keycloak sur les deux clients, et rien d'autre.

```bash
cd packages/realm-admin
cp .env.example .env
# Renseigner le mot de passe de roderick dans .env
npm install
npm start
```

Le script effectue dans l'ordre :
1. Obtenir un token pour `roderick` (Resource Owner Password Credentials — utilisable en formation)
2. Lister les rôles de `reserve-valdoria` → doit fonctionner ✅
3. Créer un rôle client `gardien` sur `reserve-valdoria` → doit fonctionner ✅
4. Lister les rôles de `comptoir-des-voyageurs` → doit fonctionner ✅
5. Tenter de lister les **utilisateurs du realm** → doit échouer ❌ (403 Forbidden)

---

## Points de discussion pédagogique

### Pourquoi les fine-grained permissions et pas `manage-clients` ?

Le rôle `manage-clients` (dans `realm-management`) donne accès à **tous** les clients du realm. Les fine-grained permissions permettent de limiter à **un ou deux clients précis**. C'est le principe du moindre privilège.

### La séparation gestion technique / gestion des accès

Roderick peut créer des rôles sur les clients, mais il ne peut pas les assigner à des utilisateurs. Pour ça, il faudrait combiner `manage` (sur les clients) avec des droits sur les utilisateurs — ce qui sort volontairement du périmètre de cet exercice.

### Quel flux d'authentification pour roderick ?

Le script utilise le flux **Resource Owner Password Credentials** (ROPC) : roderick envoie directement son login/mot de passe au token endpoint. Ce flux est **déprécié en production** mais acceptable en formation pour simplifier le script. En production, roderick utiliserait un flux Authorization Code via la console d'admin.

---

## Points d'attention pour le formateur

- L'activation des fine-grained permissions nécessite **Keycloak 26+** — c'est le cas ici (26.1).
- La UI pour les permissions a changé entre les versions de Keycloak. Se référer à la section **Permissions** de l'onglet client (pas le menu Authorization global).
- Si les participants ne voient pas l'onglet **Permissions** sur un client, vérifier que les admin permissions sont bien activées au niveau du realm (étape 2).
- Le client `realm-management` est un client **interne** de Keycloak — ne pas le supprimer ni le modifier hors du cadre des policies/permissions.
