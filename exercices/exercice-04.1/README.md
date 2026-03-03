# Exercice 4.1 — Le Régisseur de la Réserve

> **Module 2 — Gestion des clients**

---

## Objectifs pédagogiques

À l'issue de cet exercice, vous serez capable de :

- Comprendre le modèle **Permission / Policy / Scope** de Keycloak pour la délégation d'administration
- Activer les **fine-grained admin permissions** sur un realm
- Créer une **policy** ciblant un utilisateur précis
- Déléguer la gestion de clients spécifiques sans octroyer les droits d'admin global
- Vérifier une délégation d'accès via l'**API REST Keycloak**

---

## Prérequis

- L'environnement Docker est **actif** (exercice 1 complété)
- Le realm `valdoria` existe avec ses utilisateurs et rôles (exercices 2 et 3 complétés)
- Les clients `comptoir-des-voyageurs` et `reserve-valdoria` sont créés (exercice 4 complété)
- Accès à la console d'administration de Keycloak

---

## Contexte narratif

> La province de Valdoria grandit. L'administration impériale ne peut plus tout gérer seule.
>
> Elle nomme **Roderick**, un fonctionnaire de confiance, comme **Régisseur de la Réserve**. Sa mission : gérer les rôles et la configuration du Comptoir des voyageurs et de la Réserve — sans pour autant avoir accès à l'ensemble du château impérial.
>
> Les Administrateurs Impériaux lui accordent des droits précis, sur des ressources précises. **Ni plus, ni moins.**

---

## Concept — Permission / Policy / Scope

Avant de commencer, prenons un moment pour comprendre le modèle qui sous-tend la délégation d'administration dans Keycloak.

Quand on veut accorder à un utilisateur le droit d'administrer un client précis, Keycloak utilise trois objets :


| Objet          | Rôle                                 | Exemple dans cet exercice                     |
| -------------- | ------------------------------------ | --------------------------------------------- |
| **Resource**   | Ce sur quoi on accorde des droits    | Le client `reserve-valdoria`                  |
| **Scope**      | Le niveau d'accès accordé            | `manage` (créer/modifier des rôles, mappers…) |
| **Policy**     | Qui bénéficie des droits             | L'utilisateur `roderick`                      |
| **Permission** | Lien entre Resource + Scope + Policy | « roderick peut `manage` `reserve-valdoria` » |


Ce modèle repose sur un client interne du realm : `**realm-management`**. Ce client gère les ressources d'administration (clients, utilisateurs, groupes…) et les policies associées. Quand on active les permissions fines sur un client, Keycloak expose ce client comme une ressource administrable via `realm-management`.

**Point clé** — Le scope `manage` sur un client permet de créer/modifier/supprimer des rôles et des mappers sur ce client. Il ne donne **pas** accès aux utilisateurs du realm.

---

## Étapes

### Étape 1 — Créer l'utilisateur Roderick

Roderick est le nouveau Régisseur de la Réserve. Commençons par créer son compte.

1. Dans le menu latéral, cliquez sur **« Users »**
2. Cliquez sur **« Create new user »**
3. Remplissez les champs :
  - **Username :** `roderick`
  - **Email :** `roderick@valdoria.empire`
  - **First name :** `Roderick`
  - **Last name :** `le Régisseur`
  - **Email verified :** ON
4. Cliquez sur **« Create »**
5. Onglet **« Credentials »** → **« Set password »**
  - Password : `valdoria123`
  - Temporary : **OFF**
6. Cliquez sur **« Save »** puis **« Save password »**

> **Observation :** Roderick n'a **aucun rôle** pour l'instant. C'est intentionnel — les droits seront accordés via les fine-grained permissions, pas via un rôle.

---

### Étape 2 — Activer les fine-grained admin permissions sur le realm

Par défaut, Keycloak n'active pas les permissions d'administration fines. Il faut d'abord les activer au niveau du realm.

1. Dans le menu latéral, cliquez sur **« Realm settings »**
2. Restez sur l'onglet **« General »**
3. Repérez l'option **« Admin permissions »** et activez-la
4. Cliquez sur **« Save »**

> **Observation :** Le client `realm-management` existait déjà dans votre realm (il est créé automatiquement par Keycloak). L'activation des admin permissions expose maintenant ses ressources internes pour la délégation.
>
> Une section **« Permissions »** apparaît dans le **menu latéral gauche** de la console. C’est désormais depuis cette section que vous gérez toutes les permissions fines du realm (il n’y a plus d’onglet « Permissions » sur chaque client).

---

### **Étape 3 — Créer la policy pour Roderick et la permission sur** `reserve-valdoria`

**Il faut d’abord créer la policy (qui bénéficie de l’accès), puis la permission qui cible le client et associe cette policy.**

**Keycloak 26+ :** tout se fait dans la section **Permissions** du menu latéral.

#### Partie A — Créer la policy

Une policy définit **qui** bénéficie de l’accès. Ici : l’utilisateur `roderick`.

1. Menu latéral → **« Permissions »** → onglet **« Policies »**
2. **Create policy** (ou **Create**) → type **« User »**
3. Remplir :
   - **Name :** `policy-roderick`
   - **Description :** `Autorise Roderick le Régisseur à gérer les clients du Comptoir et de la Réserve`
   - **Users :** recherchez et sélectionnez `roderick`
   - **Logic :** `Positive`
4. **Save**

**Versions antérieures à Keycloak 26 :** Clients → `realm-management` → Authorization → Policies → Create policy (User) → idem.

#### Partie B — Créer la permission sur `reserve-valdoria`

1. Toujours dans **Permissions** → onglet **Permissions** (liste des permissions)
2. **Create permission** (ou **Create**) → type de ressource **« Clients »**
3. Configurer la permission :
   - **Name :** par ex. `manage-reserve-valdoria`
   - **Enforce access to :** **Specific resources** → choisir le client **`reserve-valdoria`**
   - **Authorization scopes :** cocher au minimum **`view`** et **`manage`**
   - **Policies :** ajouter **`policy-roderick`**
4. **Save**

**Observation :** Les scopes disponibles pour les clients incluent notamment :

| Scope                    | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| `view`                   | Lire la configuration du client                                 |
| `manage`                 | Modifier la configuration, créer/supprimer des rôles et mappers |
| `configure`              | Modifier les paramètres avancés                                 |
| `map-roles`              | Mapper des rôles du client à des utilisateurs                   |
| `map-roles-composite`    | Inclure les rôles du client dans des rôles composites           |
| `map-roles-client-scope` | Inclure les rôles du client dans des client scopes              |

**Point d'observation :** La logic `Positive` sur la policy signifie qu’elle *accorde* l’accès aux utilisateurs listés (modèle PBAC de Keycloak).

> **Checkpoint :** La policy `policy-roderick` existe et une permission sur le client `reserve-valdoria` (scopes `view` et `manage`) lui est associée.

---

### Étape 4 — Répéter pour `comptoir-des-voyageurs`

Roderick doit gérer les deux clients. Créez une permission équivalente pour `comptoir-des-voyageurs`.

1. Menu latéral → **« Permissions »** → **Create permission**
2. Type de ressource : **Clients**
3. Name : ex. `manage-comptoir-des-voyageurs`
4. **Enforce access to :** ressource **`comptoir-des-voyageurs`**
5. **Authorization scopes :** `view` et `manage`
6. **Policies :** ajoutez **`policy-roderick`**
7. Enregistrez

**Versions antérieures à Keycloak 26 :** Clients → `comptoir-des-voyageurs` → Permissions → Permissions enabled → lien `manage` → ajouter `policy-roderick` dans Policies → Save.

> **Checkpoint :** La permission sur `comptoir-des-voyageurs` est également associée à `policy-roderick`.

---

### Étape 5 — Vérifier la délégation via le script `realm-admin`

La configuration est en place. Il est temps de la vérifier concrètement : Roderick va appeler l'API REST d'administration de Keycloak et nous allons observer ce qu'il peut — et ne peut pas — faire.

#### Préparer le script

À la racine du dépôt, copiez le fichier d’environnement du package `realm-admin` :

```bash
cp packages/realm-admin/.env.example packages/realm-admin/.env
```

Le fichier `.env.example` est déjà pré-rempli avec les valeurs de Roderick. Vérifiez le contenu de `packages/realm-admin/.env` :

```
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=valdoria
ADMIN_USERNAME=roderick
ADMIN_PASSWORD=valdoria123
RESERVE_CLIENT_ID=<UUID du client reserve-valdoria>
COMPTOIR_CLIENT_ID=<UUID du client comptoir-des-voyageurs>
```

**Récupérer les IDs des clients :** Roderick n'a pas la permission de lister les clients (fine-grained). Il faut donc renseigner les IDs internes (UUID) dans le `.env`. Connecté en tant qu'administrateur Keycloak : **Clients** → cliquer sur `reserve-valdoria` puis récupérer l'ID dans l'URL. Répéter pour `comptoir-des-voyageurs`. Coller ces UUID dans `RESERVE_CLIENT_ID` et `COMPTOIR_CLIENT_ID`.

#### Installer et lancer

Depuis la **racine du dépôt** :

```bash
# Une seule fois : installer les dépendances du package realm-admin
npm run realm-admin:install

# Lancer le script de vérification
npm run realm-admin
```

#### Ce que fait le script

Le script effectue 5 opérations dans l'ordre et affiche le résultat de chacune :

1. **Authentification** — Roderick obtient un token via l'API Keycloak (flux password, usage formation)
2. **Lecture des rôles de `reserve-valdoria`** — doit fonctionner ✅
3. **Création du rôle `gardien` sur `reserve-valdoria`** — doit fonctionner ✅
4. **Lecture des rôles de `comptoir-des-voyageurs`** — doit fonctionner ✅
5. **Tentative de lecture des utilisateurs du realm** — doit être refusé ❌ (403 Forbidden)

#### Résultat attendu

```
[1] Authentification de "roderick" via l'API Keycloak...
  ✅ Token obtenu pour "roderick"

    Rôles realm-management dans le token :
    (aucun rôle global — accès délégué via fine-grained permissions)

[2] Lister les rôles du client "reserve-valdoria"...
  ✅ Rôles de "reserve-valdoria" : access

[3] Créer le rôle client "gardien" sur "reserve-valdoria"...
  ✅ Rôle "gardien" créé sur "reserve-valdoria"

[4] Lister les rôles du client "comptoir-des-voyageurs"...
  ✅ Rôles de "comptoir-des-voyageurs" : (aucun)

[5] Tenter de lister les utilisateurs du realm (doit être refusé)...
  ✅ Accès aux utilisateurs refusé (403 Forbidden) — la délégation est correctement scopée

✅ Vérification terminée.
```

**Points d'observation :**

- La section **« Rôles realm-management dans le token »** affiche `(aucun rôle global)` — Roderick n'a aucun rôle d'admin global. Ses droits viennent exclusivement des fine-grained permissions.
- Les opérations 2, 3, 4 réussissent car `policy-roderick` est associée au scope `manage` des deux clients.
- L'opération 5 échoue avec **403** car aucune permission n'a été accordée à Roderick sur les utilisateurs du realm.
- **Roderick n'a pas accès à la console d'administration Keycloak** : il peut manipuler les clients via l'API REST (comme le démontre le script), mais il n'a pas les droits nécessaires pour l'interface d'administration. En se connectant à l'URL de la console (ex. `http://localhost:8080/admin/valdoria/console/`), l'accès lui sera refusé ou les fonctionnalités d'admin ne seront pas disponibles — la délégation est limitée à l'API, pas à l'UI.

> **Checkpoint final :** Le script affiche 5 lignes de résultat conformes au résultat attendu ci-dessus.

---

## Point clé

> **Les fine-grained admin permissions permettent de déléguer l'administration à la ressource près.**
>
> Plutôt que d'accorder le rôle `manage-clients` (qui donne accès à *tous* les clients du realm), on accorde une permission `manage` sur *un client précis* à *un utilisateur précis*. C'est le principe du **moindre privilège** appliqué à l'administration Keycloak.
>
> Le modèle **Resource / Scope / Policy / Permission** est le même que celui utilisé par Keycloak pour l'autorisation applicative (UMA). Maîtriser ce modèle ici facilite sa compréhension dans d'autres contextes.

---

## Dépannage


| Problème                                                          | Cause probable                                                | Solution                                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| L'onglet / section « Permissions » n'apparaît pas                 | Les admin permissions ne sont pas activées sur le realm       | Vérifiez Realm settings → General → Admin permissions → Save. En Keycloak 26+, la section **Permissions** est dans le menu latéral gauche (pas sur la fiche du client). |
| Le script retourne 401 à l'étape 1                                | Mauvais mot de passe ou username                              | Vérifiez le `.env` et les credentials de `roderick` dans la console             |
| L'étape 2 du script retourne 403                                  | Roderick n'a pas le droit de lister les clients OU permission manquante | Renseignez `RESERVE_CLIENT_ID` et `COMPTOIR_CLIENT_ID` dans `.env` (IDs visibles dans Clients → [nom] → Détails). Si déjà renseignés, vérifiez que la permission `manage` sur les deux clients est bien associée à `policy-roderick`. |
| L'étape 5 retourne 200 au lieu de 403                             | Roderick a un rôle d'administration accordé par erreur        | Vérifiez l'onglet Role mapping de `roderick` — il ne doit avoir aucun rôle      |
| La policy `policy-roderick` n'apparaît pas dans le champ Policies | La policy n'est pas créée                                     | Keycloak 26+ : Permissions → Policies → Create. Anciennes versions : Clients → `realm-management` → Authorization → Policies |


