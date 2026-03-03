# Exercice 8 — Se faire passer pour un sujet

> **Module 3 — Identités, groupes et scopes**

---

## Objectifs pédagogiques

À l'issue de cet exercice, vous serez capable de :

- Utiliser la fonction **Impersonate** depuis la console d'administration
- Observer la session créée dans le Comptoir des voyageurs
- **Diagnostiquer un problème de droits** en reproduisant exactement l'expérience de l'utilisateur

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le realm `valdoria` doit exister avec les rôles `sujet` et `marchand` (exercice 2 complété)
- L'utilisateur `brunhild` (marchande, `villeOrigine: Nordheim`) doit exister (exercice 3 complété)
- Les clients `comptoir-des-voyageurs` et `reserve-valdoria` doivent être configurés (exercice 4 complété)

### Prérequis de connaissances

- Avoir complété les exercices 1 à 7
- Connaître la notion de rôles de client (`realm-management`)

---

## Contexte narratif

> Le service de renseignement impérial reçoit une plainte : **Brunhild**, marchande de Nordheim, signale qu'elle ne peut plus accéder à l'inventaire de la Réserve.
>
> Plutôt que de lui demander de partager son mot de passe, l'administrateur impérial dispose d'un outil puissant : l'**impersonation**. Il peut voir la province exactement à travers les yeux de Brunhild — sa session, ses droits, ses données — sans connaître ses identifiants.
>
> Votre mission : impersonner Brunhild depuis la console d'administration, et diagnostiquer si le problème vient réellement de ses droits.

---

## Concepts nouveaux

### Impersonation Keycloak

L'impersonation permet à un administrateur (ou un utilisateur habilité) d'**ouvrir une session au nom d'un autre utilisateur** sans connaître son mot de passe.

```
console admin
     │
     │  (impersonate brunhild)
     ▼
Keycloak ──── crée une session ────▶ token signé au nom de brunhild
                                           │
                                           ▼
                                    Comptoir des voyageurs
                                    (session brunhild active)
```

La session créée est une vraie session Keycloak : le token contient l'identité de Brunhild, ses rôles et ses attributs. L'API ne fait aucune distinction entre une connexion normale et une session impersonnée.

### Droit d'impersonation

Par défaut, seuls les administrateurs du realm `master` peuvent impersonner. Pour déléguer ce droit à un utilisateur spécifique, il faut lui attribuer le rôle `**impersonation**` du client `realm-management`.

---

## Étapes

### Étape 1 — Impersonner Brunhild depuis la console

1. Dans le menu de gauche, allez dans **Users**
2. Cliquez sur l'utilisateur `**brunhild`**
3. En haut à droite de la fiche utilisateur, cliquez sur le menu **⋮** (trois points) ou le bouton **Action**
4. Sélectionnez **Impersonate**
5. Confirmez l'action si une fenêtre de confirmation apparaît

Keycloak ouvre automatiquement une nouvelle session dans votre navigateur **au nom de Brunhild** et affiche la **console Account** : **[http://localhost:8080/realms/valdoria/account](http://localhost:8080/realms/valdoria/account)**.

Pour constater que vous êtes authentifié sur le Comptoir des voyageurs, retournez sur **[http://localhost:5173/](http://localhost:5173/)** et actualisez la page.

---

### Étape 2 — Observer la session dans le Comptoir

1. Vous êtes maintenant connecté au Comptoir des voyageurs en tant que **Brunhild**
2. Allez dans la page **Debug** du Comptoir
3. Dans l'access token, vérifiez :
  - `**preferred_username`** : `brunhild` ✅
  - `**realm_access.roles**` : contient `marchand` ✅
  - `**villeOrigine**` : `Nordheim` ✅
4. Naviguez vers la page **Inventaire**
5. Constatez que Brunhild y accède ✅

**Diagnostic :** Les droits de Brunhild sont corrects. Le rôle `marchand` est bien présent dans son token, et son attribut `villeOrigine` est correctement renseigné. Le problème signalé ne vient pas de ses droits Keycloak — il faudra chercher ailleurs (cache navigateur, problème réseau, etc.).

---

### Étape 3 — Vérifier les sessions dans la console d'administration

1. Revenez à la console d'administration Keycloak (ouvrez un nouvel onglet : **[http://localhost:8080/admin](http://localhost:8080/admin)**)
2. Dans le realm **valdoria**, allez dans **Sessions** (menu de gauche)
3. Observez : la session impersonnée de **brunhild** est bien présente.

**Note :** La session de l'administrateur n'apparaît pas ici : elle est rattachée au realm **master**. Dans le realm valdoria, on ne voit que les sessions des utilisateurs de ce realm (dont la session créée par l'impersonation).

**Point d'observation :** L'impersonation crée une session distincte dans le realm, traçable dans la console. Elle peut être révoquée indépendamment.

---

## Point clé

> **L'impersonation est un outil de support puissant — et à encadrer.**
>
> Elle permet de reproduire exactement l'expérience d'un utilisateur sans connaître son mot de passe. Le token généré est identique à celui d'une connexion normale : mêmes rôles, mêmes attributs, même audience.
>
> En tant qu'administrateur, préférez toujours l'impersonation à la demande du mot de passe utilisateur. Mais encadrez ce droit : seuls les utilisateurs explicitement habilités (rôle `impersonation`) doivent pouvoir l'exercer.

---

## Pour aller plus loin

## Déléguer l'impersonation à un utilisateur non-administrateur

Dans cet exercice, vous avez impersonné Brunhild en tant que super admin. Mais il est possible de déléguer ce droit à un utilisateur ordinaire (par exemple un agent de support) sans lui donner accès à la console d'administration.

Pour créer un utilisateur `support-imperial` habilité à impersonner :

1. Créez l'utilisateur `support-imperial` dans le realm `valdoria`
2. Dans l'onglet **Role mapping** de cet utilisateur, cliquez **Assign role**
3. Sélectionnez le rôle `impersonation` du client `realm-management`
4. Cliquez **Assign**

Pour aller encore plus loin, vous pouvez gérer ces droits via un groupe dédié et y placer tous les agents de support :

1. Créer le groupe `cellule-renseignement`
2. Attribuer le rôle `realm-management/impersonation` au groupe (onglet **Role mapping** du groupe, **Filter by clients**)
3. Ajouter `support-imperial` dans ce groupe

Cette approche est plus maintenable : pour habiliter un nouvel agent de support, il suffit de l'ajouter au groupe.

---

## Dépannage


| Problème                                         | Cause probable                                   | Solution                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Le bouton **Impersonate** n'apparaît pas         | Vous êtes dans le realm `master`                 | Assurez-vous d'être dans le realm `valdoria`                                                                 |
| Le Comptoir ne s'ouvre pas après l'impersonation | L'URL de redirection n'est pas configurée        | Vérifiez que `http://localhost:5173` est dans les **Valid redirect URIs** du client `comptoir-des-voyageurs` |
| Le rôle `marchand` est absent du token           | Brunhild n'a pas le rôle `marchand`              | Vérifiez le **Role mapping** de Brunhild (exercice 3)                                                        |
| `villeOrigine` est absent du token               | Le scope `attributs-valdorien` n'est pas assigné | Vérifiez la configuration du client `comptoir-des-voyageurs` (exercice 4)                                    |


