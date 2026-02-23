# Exercice 7 — La Guilde des Marchands

> **Module 3 — Identités, groupes et scopes**

---

## Objectifs pédagogiques

À l'issue de cet exercice, vous serez capable de :

- Créer un **groupe** dans Keycloak
- Assigner un **rôle de royaume** à un groupe
- Comprendre l'**héritage de rôles** : un utilisateur membre du groupe hérite automatiquement de ses rôles
- Vérifier cet héritage en appelant une route protégée avec le token du nouvel utilisateur

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le realm `valdoria` doit exister avec le rôle `marchand` (exercice 2 complété)
- Les clients `comptoir-des-voyageurs` et `reserve-valdoria` doivent être configurés (exercice 4 complété)
- L'utilisateur `brunhild` (marchande) doit exister (exercice 3 complété)

### Prérequis de connaissances

- Avoir complété les exercices 1 à 6
- Connaître la notion de rôles de royaume dans Keycloak

---

## Contexte narratif

> La province de Valdoria prospère. Mais attribuer les titres impériaux un par un à chaque nouveau marchand devient fastidieux pour les administrateurs.
>
> L'Empire décide de s'organiser en **guildes** : des corporations qui regroupent les sujets selon leur métier. Désormais, tout sujet admis dans la **Guilde des Marchands** hérite automatiquement du titre de `marchand` — sans qu'il soit nécessaire de le lui attribuer individuellement.
>
> Votre mission : créer la guilde, lui attribuer le titre de `marchand`, puis accueillir **Siegfried**, un nouveau marchand. Vérifiez qu'il bénéficie bien des mêmes droits que **Brunhild**, marchand depuis l'exercice 3.

---

## Concepts nouveaux

### Groupe Keycloak

Un groupe est un **conteneur d'utilisateurs** auquel on peut attribuer des rôles. Tous les membres du groupe héritent automatiquement de ces rôles.

```
brunhild        ──(rôle direct)──▶  marchand ✅   (n'appartient pas à la guilde)

guilde-marchands  ──(rôle)──▶  marchand
       │
       └── siegfried  ──hérite──▶  marchand ✅   (obtient le rôle via la guilde)
```

Brunhild a le rôle `marchand` **en direct** (comme dans l'exercice 3) et n'appartient pas à la guilde. Siegfried appartient à la guilde et obtient donc le rôle `marchand` via elle. L'avantage du groupe : pour donner le rôle à plusieurs nouveaux utilisateurs, il suffit de les ajouter au groupe — pas d'attribution individuelle.

### Différence avec l'attribution directe de rôle (exercice 3)

Dans l'exercice 3, le rôle `marchand` a été attribué **directement** à `brunhild`. Ici, on illustre les deux cas :
1. **Brunhild** : rôle `marchand` attribué directement (inchangé par rapport à l'exercice 3).
2. **Siegfried** : on attribue le rôle au **groupe** `guilde-marchands`, puis on ajoute Siegfried dans ce groupe — il obtient le rôle via la guilde.

Le résultat dans le token est identique — c'est le mécanisme qui change (direct vs hérité du groupe).

---

## Étapes

### Étape 1 — Créer le groupe `guilde-marchands`

1. Connectez-vous à la console Keycloak : **http://localhost:8080**
2. Sélectionnez le realm **valdoria**
3. Dans le menu de gauche, allez dans **Groups**
4. Cliquez **Create group**
5. Nommez le groupe : `guilde-marchands`
6. Ajouter la description : `Guilde des marchands
7. Cliquez **Create**

---

### Étape 2 — Attribuer le rôle `marchand` au groupe

1. Dans la liste des groupes, cliquez sur **`guilde-marchands`**
2. Allez dans l'onglet **Role mapping**
3. Cliquez **Assign role** \ **Realm roles**
4. Sélectionnez le rôle **`marchand`** (realm role)
5. Cliquez **Assign**

**Point d'observation :** Le rôle `marchand` est maintenant associé au groupe. Tout utilisateur ajouté dans ce groupe héritera de ce rôle.

---

### Étape 3 — Créer l'utilisateur `siegfried`

1. Dans le menu de gauche, allez dans **Users**
2. Cliquez **Create new user**
3. Renseignez :
   - **Username :** `siegfried`
   - **Email :** `siegfried@valdoria.empire`
   - **First name :** Siegfried
   - **Last name :** le Marchand
   - **Email verified :** ON
4. Cliquez **Create**
5. Allez dans l'onglet **Credentials**
6. Cliquez **Set password**
7. Définissez le mot de passe `valdoria123` et désactivez **Temporary**
8. Cliquez **Save**

> **Note :** Siegfried n'a aucun rôle attribué directement. Il aura uniquement `sujet` (rôle par défaut du realm) avant d'être ajouté au groupe.

---

### Étape 4 — Ajouter `siegfried` dans le groupe

1. Toujours sur la fiche de `siegfried`, allez dans l'onglet **Groups**
2. Cliquez **Join Group**
3. Sélectionnez **`guilde-marchands`**
4. Cliquez **Join**

**Point d'observation :** Siegfried n'a toujours aucun rôle attribué **directement**. Pourtant, il va hériter du rôle `marchand` via le groupe.

---

### Étape 5 — Vérifier l'héritage de rôles dans la console

1. Depuis la fiche de `siegfried`, allez dans l'onglet **Role mapping**
2. Décochez **Hide inherited roles** pour afficher les rôles hérités des groupes
3. Observez: le rôle `marchand` doit y apparaître, hérité du groupe `guilde-marchands`

**Checkpoint :** Le rôle `marchand` est bien présent dans les rôles effectifs de Siegfried, sans avoir été attribué directement.

---

### Étape 6 — Vérifier l'accès dans l'application

1. Ouvrez le Comptoir des voyageurs : **http://localhost:5173**
2. Connectez-vous avec **`siegfried`** et son mot de passe
3. Dans la page **Debug**, inspectez l'access token :
   - Le champ `realm_access.roles` doit contenir **`marchand`**
4. Naviguez vers la page **Inventaire** (route protégée par le rôle `marchand`)
5. Constatez que Siegfried y accède ✅ — comme Brunhild

**Point d'observation :** Le token de Siegfried contient `marchand` exactement comme celui de Brunhild. L'API ne fait aucune distinction entre un rôle hérité d'un groupe et un rôle attribué directement.

---

## Point clé

> **Les groupes permettent de gérer les droits à l'échelle.**
>
> Plutôt que d'attribuer le rôle `marchand` à chaque nouvel utilisateur individuellement, il suffit de l'ajouter dans `guilde-marchands`. Le rôle est hérité automatiquement et apparaît dans le token JWT comme s'il avait été attribué directement.
>
> **L'API ne voit pas de différence** entre un rôle direct et un rôle hérité d'un groupe : elle lit simplement `realm_access.roles` dans le token.

---

## Dépannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| Le rôle `marchand` n'apparaît pas dans le token de Siegfried | Siegfried n'est pas dans le groupe | Vérifiez l'onglet **Groups** sur la fiche utilisateur |
| Le rôle `marchand` n'est pas dans les **Effective roles** | Le rôle n'est pas assigné au groupe | Vérifiez l'onglet **Role mapping** du groupe `guilde-marchands` |
| Erreur 403 sur `/inventaire` | Token expiré ou pas rechargé | Déconnectez-vous et reconnectez-vous pour obtenir un nouveau token |
| Le groupe n'apparaît pas dans **Join Group** | Le groupe n'a pas été créé | Retournez à l'étape 1 |
