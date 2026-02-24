# Exercice 9 — Déléguer au Maître des Registres

> **Module 4 — Intégrations externes et durcissement**

---

## Objectifs pédagogiques

À l'issue de cet exercice, vous serez capable de :

- Connecter Keycloak à un **annuaire LDAP** via la User Federation
- Configurer les **mappers d'attributs** LDAP (email, ville d'origine)
- Mapper un **groupe LDAP** vers un **groupe Keycloak** (Group Mapper)
- Mapper un **groupe LDAP** vers un **rôle de royaume** (Role Mapper)
- Lancer une **synchronisation complète** et vérifier les utilisateurs fédérés

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le realm `valdoria` doit exister avec les rôles `sujet`, `marchand` et `gouverneur` (exercice 2 complété)
- Le groupe `guilde-marchands` doit exister avec le rôle `marchand` associé (exercice 7 complété)
- Les clients `comptoir-des-voyageurs` et `reserve-valdoria` doivent être configurés (exercice 4 complété)

### Prérequis de connaissances

- Avoir complété les exercices 1 à 8
- Connaître la notion de groupes et de rôles de royaume dans Keycloak

---

## Contexte narratif

> Jusqu'à présent, chaque sujet de Valdoria était enregistré manuellement dans Keycloak par les administrateurs impériaux. Mais la province grandit, et cette gestion artisanale atteint ses limites.
>
> L'Empire décide de confier la tenue des registres de population à une administration spécialisée : l'**Office du Maître des Registres**. Cet office maintient un annuaire centralisé (LDAP) contenant l'identité de chaque sujet, sa ville d'origine et son appartenance aux guildes.
>
> Votre mission : connecter Keycloak à l'Office du Maître des Registres, configurer les correspondances entre l'annuaire et la province, puis vérifier que les sujets fédérés obtiennent automatiquement les bons droits.

---

## Concepts nouveaux

### User Federation LDAP

La **fédération d'utilisateurs** permet à Keycloak de déléguer le stockage des identités à un annuaire externe (LDAP, Active Directory). Les utilisateurs restent dans l'annuaire — Keycloak les importe ou les interroge à la demande.

```
Office du Maître des Registres (OpenLDAP)
    │
    │  dc=registre,dc=valdoria,dc=local
    │
    ├── ou=people
    │     ├── uid=elara     (sujette, Estheim)
    │     ├── uid=thorin    (marchand, Nordheim)
    │     └── uid=aldric    (gouverneur, Valdoria-Centre)
    │
    └── ou=groups
          ├── cn=marchands  → member: thorin
          └── cn=gouverneurs        → member: aldric
```

### Mappers LDAP

Keycloak utilise des **mappers** pour faire correspondre les données LDAP aux concepts Keycloak :

| Mapper | Source LDAP | Cible Keycloak |
|--------|------------|----------------|
| **User Attribute Mapper** | `mail` | Attribut `email` |
| **User Attribute Mapper** | `l` (locality) | Attribut `villeOrigine` |
| **Group Mapper** | Groupe `marchands` | Groupe `guilde-marchands` |
| **Role Mapper** | Groupe `gouverneurs` | Realm role `gouverneur` |

Le **Group Mapper** convertit l'appartenance à un groupe LDAP en appartenance à un groupe Keycloak. Le **Role Mapper** convertit l'appartenance à un groupe LDAP directement en rôle Keycloak — deux mécanismes distincts pour deux besoins différents.

---

## Étapes

### Étape 1 — Vérifier et peupler l'annuaire LDAP

1. Vérifiez que le conteneur OpenLDAP est actif :
   ```bash
   docker ps | grep autheria-openldap
   ```

2. Injectez les données de l'Office du Maître des Registres dans l'annuaire :
   ```bash
   docker exec -i autheria-openldap ldapadd -x \
     -D "cn=admin,dc=registre,dc=valdoria,dc=local" -w admin \
     < infrastructure/openldap/50-bootstrap.ldif
   ```

   Vous devez voir `adding new entry` pour chaque entrée (OU, utilisateurs, groupes).

   > **Si l'erreur `Already exists` apparaît** : les données ont déjà été chargées, vous pouvez passer à l'étape suivante.

3. Vérifiez que les sujets sont bien présents :
   ```bash
   docker exec autheria-openldap ldapsearch -x \
     -b "ou=people,dc=registre,dc=valdoria,dc=local" \
     -D "cn=admin,dc=registre,dc=valdoria,dc=local" -w admin \
     "(objectClass=inetOrgPerson)" uid cn mail l
   ```

   Vous devez voir les trois sujets : `elara`, `thorin` et `aldric` avec leurs attributs.

---

### Étape 2 — Configurer la fédération LDAP dans Keycloak

1. Connectez-vous à la console Keycloak : **http://localhost:8080**
2. Sélectionnez le realm **valdoria**
3. Dans le menu de gauche, allez dans **User federation**
4. Cliquez **Add LDAP providers**
5. Renseignez les paramètres suivants :

   | Paramètre | Valeur |
   |-----------|--------|
   | **UI display name** | `Office du Maître des Registres` |
   | **Vendor** | `Other` |
   | **Connection URL** | `ldap://openldap:389` |
   | **Users DN** | `ou=people,dc=registre,dc=valdoria,dc=local` |
   | **Username LDAP attribute** | `uid` |
   | **UUID LDAP attribute** | `uid` |
   | **Bind type** | `simple` |
   | **Bind DN** | `cn=admin,dc=registre,dc=valdoria,dc=local` |
   | **Bind credential** | `admin` |
   | **Edit mode** | `READ_ONLY` |

6. Cliquez **Test connection** pour vérifier la connectivité
7. Cliquez **Test authentication** pour vérifier les identifiants
8. Cliquez **Save**

**Vérification :**

1. Dans le menu de gauche, allez dans **Users**
2. Recherchez `al` dans la barre de recherche
3. Vous devez voir apparaître deux utilisateurs : **aldric** et **alaric**
4. Cliquez sur **aldric** pour ouvrir ses détails — vous pouvez constater que le champ **Federation link** indique `Office du Maître des Registres`, confirmant que cet utilisateur provient bien de l'annuaire LDAP

**Point d'observation :** Keycloak est maintenant connecté à l'annuaire de l'Office du Maître des Registres. Les utilisateurs ne sont pas encore synchronisés — il faut d'abord configurer les mappers.

---

### Étape 3 — Configurer le mapper d'attribut `email`

Le mapper `email` est généralement pré-configuré par défaut dans Keycloak. Vérifions qu'il est bien présent.

1. Sur la page de la fédération LDAP, allez dans l'onglet **Mappers**
2. Vérifiez qu'un mapper **email** existe déjà, avec :
   - **LDAP Attribute** : `mail`
   - **User Model Attribute** : `email`

Si le mapper existe, passez à l'étape suivante. Sinon, créez-le :
1. Cliquez **Add mapper**
2. Renseignez :
   - **Name** : `email`
   - **Mapper type** : `user-attribute-ldap-mapper`
   - **User Model Attribute** : `email`
   - **LDAP Attribute** : `mail`
3. Cliquez **Save**

---

### Étape 4 — Configurer le mapper d'attribut `villeOrigine`

1. Toujours dans l'onglet **Mappers**, cliquez **Add mapper**
2. Renseignez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `ville d'origine` |
   | **Mapper type** | `user-attribute-ldap-mapper` |
   | **User Model Attribute** | `villeOrigine` |
   | **LDAP Attribute** | `l` |

3. Cliquez **Save**

**Vérification :**

1. En haut à droite, cliquez sur **Action** puis **Sync all users** pour recharger le cache Keycloak avec les nouveaux attributs
2. Dans le menu de gauche, allez dans **Users** et cliquez sur **alaric**
3. Vérifiez que l'attribut **villeOrigine** est bien renseigné dans ses détails

**Point d'observation :** L'attribut `l` (locality) est un attribut standard LDAP. Le mapper le traduit en `villeOrigine` côté Keycloak, le même attribut utilisé par le Comptoir des voyageurs et la Réserve depuis l'exercice 4.

---

### Étape 5 — Configurer le Group Mapper (`guilde-marchands`)

1. Toujours dans l'onglet **Mappers**, cliquez **Add mapper**
2. Renseignez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `guilde-marchands` |
   | **Mapper type** | `group-ldap-mapper` |
   | **LDAP Groups DN** | `ou=groups,dc=registre,dc=valdoria,dc=local` |
   | **Group Name LDAP Attribute** | `cn` |
   | **Group Object Classes** | `groupOfNames` |
   | **Membership LDAP Attribute** | `member` |
   | **Membership Attribute Type** | `DN` |
   | **Groups Path** | `/` |
   | **Drop non-existing groups during sync** | `OFF` |

3. Cliquez **Save**

**Vérification :**

1. En haut à droite, cliquez sur **Action** puis **Sync all users**
2. Dans le menu de gauche, allez dans **Users** et cliquez sur **thorin**
3. Vérifiez qu'il est bien membre du groupe **guilde-marchands**

**Point d'observation :** Le groupe LDAP `guilde-marchands` porte le même nom que le groupe Keycloak créé à l'exercice 7. Lors de la synchronisation, Keycloak reconnaîtra le groupe existant et y ajoutera les membres LDAP. Thorin héritera ainsi automatiquement du rôle `marchand` associé au groupe.

---

### Étape 6 — Configurer le Role Mapper (`gouverneur`)

1. Toujours dans l'onglet **Mappers**, cliquez **Add mapper**
2. Renseignez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `role-gouverneur` |
   | **Mapper type** | `role-ldap-mapper` |
   | **LDAP Roles DN** | `ou=groups,dc=registre,dc=valdoria,dc=local` |
   | **Role Name LDAP Attribute** | `cn` |
   | **Role Object Classes** | `groupOfNames` |
   | **Membership LDAP Attribute** | `member` |
   | **Membership Attribute Type** | `DN` |
   | **Use Realm Roles Mapping** | `ON` |

3. Cliquez **Save**

**Vérification :**

1. En haut à droite, cliquez sur **Action** puis **Sync all users**
2. Dans le menu de gauche, allez dans **Users** et cliquez sur **aldric**
3. Allez dans l'onglet **Role mapping** et vérifiez qu'il possède bien le rôle **gouverneur**

**Point d'observation :** Ce mapper convertit les groupes LDAP sous `ou=groups` en rôles de royaume. Le groupe LDAP `gouverneur` porte le même nom que le realm role `gouverneur` créé à l'exercice 2 : Keycloak fera la correspondance automatiquement. Aldric, membre de ce groupe LDAP, recevra le rôle `gouverneur` (et par héritage composite, les rôles `sujet` et `marchand`).

---

### Étape 7 — Vérifier `elara` dans la console Keycloak

1. Retournez dans **Users** et recherchez **`elara`**
2. Cliquez sur **`elara`**
3. Vérifiez son profil :
   - **Email** : `elara@valdoria.empire` ✅
4. Allez dans l'onglet **Attributes** et vérifiez :
   - **`villeOrigine`** : `Estheim` ✅
5. Allez dans l'onglet **Role mapping**
6. Décochez **Hide inherited roles**
7. Vérifiez que le rôle **`sujet`** est présent ✅ (rôle par défaut du realm)

**Point d'observation :** Elara n'appartient à aucun groupe LDAP. Elle n'a donc que le rôle `sujet`, attribué automatiquement par le realm à tout nouvel utilisateur.

---

### Étape 8 — Vérifier `thorin` via le Comptoir des voyageurs

1. Ouvrez le Comptoir des voyageurs : **http://localhost:5173**
2. Connectez-vous avec **`thorin`** / `valdoria123`
3. Dans la page **Debug**, inspectez l'access token :
   - **`realm_access.roles`** contient **`marchand`** ✅
   - **`villeOrigine`** : `Nordheim` ✅
4. Naviguez vers la page **Inventaire**
5. Constatez que Thorin y accède ✅

**Point d'observation :** Thorin est membre du groupe LDAP `guilde-marchands`. Le Group Mapper a synchronisé cette appartenance vers le groupe Keycloak `guilde-marchands`, et le rôle `marchand` est hérité du groupe — exactement comme pour Siegfried à l'exercice 7.

---

### Étape 9 — Vérifier `aldric` dans la console Keycloak

1. Retournez dans la console Keycloak
2. Dans **Users**, cliquez sur **`aldric`**
3. Allez dans l'onglet **Role mapping**
4. Décochez **Hide inherited roles**
5. Vérifiez que le rôle **`gouverneur`** est présent ✅

**Point d'observation :** Aldric est membre du groupe LDAP `gouverneur`. Le Role Mapper a converti cette appartenance directement en realm role — sans passer par un groupe Keycloak. C'est la différence clé avec le Group Mapper : le Role Mapper crée une correspondance groupe LDAP → rôle Keycloak.

---

## Point clé

> **La fédération LDAP permet de déléguer la gestion des identités à un annuaire externe sans migration.**
>
> Keycloak offre deux mécanismes distincts pour convertir la structure LDAP en autorisations :
> - Le **Group Mapper** synchronise un groupe LDAP en groupe Keycloak (les membres héritent des rôles du groupe Keycloak)
> - Le **Role Mapper** convertit directement un groupe LDAP en rôle de royaume Keycloak
>
> Les **mappers d'attributs** assurent la correspondance entre les champs LDAP (standards comme `mail` ou `l`) et les attributs Keycloak utilisés par les applications (`email`, `villeOrigine`).

---

## Pour aller plus loin

### Synchronisation périodique par différentiel

Plutôt que de lancer manuellement une synchronisation complète à chaque modification de l'annuaire, Keycloak peut synchroniser automatiquement les changements :

1. Sur la page de la fédération **Office du Maître des Registres**, dans les paramètres
2. Configurez :
   - **Periodic Full Sync** : `OFF` (évite de recharger tous les utilisateurs à chaque fois)
   - **Periodic Changed Users Sync** : `ON`
   - **Changed Users Sync Period** : `60` (synchronisation toutes les 60 secondes)
3. Cliquez **Save**

La synchronisation différentielle ne récupère que les entrées modifiées depuis la dernière synchronisation, ce qui est bien plus performant sur un annuaire volumineux.

---

## Dépannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| **Test connection** échoue | Le conteneur OpenLDAP n'est pas démarré | Vérifiez avec `docker ps \| grep openldap` |
| **« No Such Object »** lors du `ldapsearch` | Les données n'ont pas été injectées | Relancez la commande `ldapadd` de l'étape 1 |
| **Test authentication** échoue | Mauvais Bind DN ou mot de passe | Vérifiez : `cn=admin,dc=registre,dc=valdoria,dc=local` / `admin` |
| Aucun utilisateur après synchronisation | Mauvais Users DN | Vérifiez : `ou=people,dc=registre,dc=valdoria,dc=local` |
| `villeOrigine` absente du profil | Mapper `ville d'origine` non configuré | Vérifiez l'étape 4 et relancez la synchronisation |
| Thorin n'a pas le rôle `marchand` | Group Mapper mal configuré ou noms de groupes différents | Vérifiez que le nom du groupe Keycloak correspond au groupe LDAP |
| Aldric n'a pas le rôle `gouverneur` | Role Mapper mal configuré ou noms différents | Vérifiez que le nom du groupe LDAP correspond au realm role |
| `ldapadd` échoue avec "Already exists" | Les données ont déjà été injectées | Ignorez l'erreur ou recréez le conteneur avec `docker compose down -v && docker compose up -d` |
