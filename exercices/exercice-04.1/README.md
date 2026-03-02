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

| Objet | Rôle | Exemple dans cet exercice |
|---|---|---|
| **Resource** | Ce sur quoi on accorde des droits | Le client `reserve-valdoria` |
| **Scope** | Le niveau d'accès accordé | `manage` (créer/modifier des rôles, mappers…) |
| **Policy** | Qui bénéficie des droits | L'utilisateur `roderick` |
| **Permission** | Lien entre Resource + Scope + Policy | « roderick peut `manage` `reserve-valdoria` » |

Ce modèle repose sur un client interne du realm : **`realm-management`**. Ce client gère les ressources d'administration (clients, utilisateurs, groupes…) et les policies associées. Quand on active les permissions fines sur un client, Keycloak expose ce client comme une ressource administrable via `realm-management`.

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

---

### Étape 3 — Activer les permissions fines sur `reserve-valdoria`

Maintenant que le realm supporte les permissions fines, activons-les sur le premier client.

1. Dans le menu latéral, cliquez sur **« Clients »**
2. Cliquez sur le client **`reserve-valdoria`**
3. Cliquez sur l'onglet **« Permissions »**
4. Activez **« Permissions enabled »**

**Observation :** Keycloak affiche automatiquement la liste des scopes disponibles pour ce client :

| Scope | Description |
|---|---|
| `view` | Lire la configuration du client |
| `manage` | Modifier la configuration, créer/supprimer des rôles et mappers |
| `configure` | Modifier les paramètres avancés |
| `map-roles` | Mapper des rôles du client à des utilisateurs |
| `map-roles-composite` | Inclure les rôles du client dans des rôles composites |
| `map-roles-client-scope` | Inclure les rôles du client dans des client scopes |

Chaque scope est un lien cliquable qui mène directement à la permission correspondante dans `realm-management`. Nous y reviendrons à l'étape 5.

> **Checkpoint :** L'onglet Permissions de `reserve-valdoria` affiche les scopes disponibles.

---

### Étape 4 — Créer la policy pour Roderick

Une policy définit **qui** bénéficie d'un accès. Ici, nous ciblons l'utilisateur `roderick`.

1. Dans le menu latéral, cliquez sur **« Clients »**
2. Cliquez sur le client **`realm-management`**
3. Cliquez sur l'onglet **« Authorization »**
4. Cliquez sur le sous-onglet **« Policies »**
5. Cliquez sur **« Create policy »** → sélectionnez le type **« User »**
6. Remplissez les champs :
   - **Name :** `policy-roderick`
   - **Description :** `Autorise Roderick le Régisseur à gérer les clients du Comptoir et de la Réserve`
   - **Users :** recherchez et sélectionnez `roderick`
   - **Logic :** `Positive`
7. Cliquez sur **« Save »**

**Point d'observation :** La logic `Positive` signifie que la policy *accorde* l'accès aux utilisateurs listés. Une logic `Negative` ferait l'inverse (bloquer explicitement). C'est le principe du modèle PBAC (Policy-Based Access Control) de Keycloak.

> **Checkpoint :** La policy `policy-roderick` est créée dans `realm-management` > Authorization > Policies.

---

### Étape 5 — Associer la permission `manage` à la policy sur `reserve-valdoria`

Nous avons la policy. Il reste à l'associer au scope `manage` du client `reserve-valdoria`.

1. Dans le menu latéral, cliquez sur **« Clients »**
2. Cliquez sur le client **`reserve-valdoria`**
3. Cliquez sur l'onglet **« Permissions »**
4. Cliquez sur le lien **`manage`**

   > Vous êtes redirigé vers la permission correspondante dans `realm-management` > Authorization > Permissions.

5. Dans le champ **« Policies »**, ajoutez **`policy-roderick`**
6. Laissez **Decision strategy** sur `Unanimous`
7. Cliquez sur **« Save »**

**Point d'observation :** La Decision strategy `Unanimous` signifie que *toutes* les policies associées à cette permission doivent être satisfaites pour accorder l'accès. Si vous aviez deux policies (ex : `policy-roderick` ET `policy-horaire-bureau`), les deux conditions devraient être remplies. Avec une seule policy, `Unanimous` et `Affirmative` sont équivalents.

> **Checkpoint :** La permission `manage` de `reserve-valdoria` est associée à `policy-roderick`.

---

### Étape 6 — Répéter pour `comptoir-des-voyageurs`

Roderick doit gérer les deux clients. Appliquez la même configuration sur `comptoir-des-voyageurs`.

1. Dans le menu latéral, cliquez sur **« Clients »**
2. Cliquez sur le client **`comptoir-des-voyageurs`**
3. Cliquez sur l'onglet **« Permissions »**
4. Activez **« Permissions enabled »**
5. Cliquez sur le lien **`manage`**
6. Dans le champ **« Policies »**, ajoutez **`policy-roderick`**
7. Cliquez sur **« Save »**

> **Checkpoint :** La permission `manage` de `comptoir-des-voyageurs` est également associée à `policy-roderick`.

---

### Étape 7 — Vérifier la délégation via le script `realm-admin`

La configuration est en place. Il est temps de la vérifier concrètement : Roderick va appeler l'API REST d'administration de Keycloak et nous allons observer ce qu'il peut — et ne peut pas — faire.

#### Préparer le script

```bash
cd packages/realm-admin
cp .env.example .env
```

Le fichier `.env.example` est déjà pré-rempli avec les valeurs de Roderick. Vérifiez son contenu :

```
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=valdoria
ADMIN_USERNAME=roderick
ADMIN_PASSWORD=valdoria123
```

#### Installer et lancer

```bash
npm install
npm start
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

| Problème | Cause probable | Solution |
|---|---|---|
| L'onglet « Permissions » n'apparaît pas sur un client | Les admin permissions ne sont pas activées sur le realm | Vérifiez Realm settings → General → Admin permissions |
| Le script retourne 401 à l'étape 1 | Mauvais mot de passe ou username | Vérifiez le `.env` et les credentials de `roderick` dans la console |
| L'étape 2 du script retourne 403 | La permission `manage` n'est pas associée à `policy-roderick` | Vérifiez l'onglet Permissions de `reserve-valdoria` → scope `manage` → policies |
| L'étape 5 retourne 200 au lieu de 403 | Roderick a un rôle d'administration accordé par erreur | Vérifiez l'onglet Role mapping de `roderick` — il ne doit avoir aucun rôle |
| La policy `policy-roderick` n'apparaît pas dans le champ Policies | La policy n'est pas créée dans `realm-management` | Créez-la dans Clients → `realm-management` → Authorization → Policies |
