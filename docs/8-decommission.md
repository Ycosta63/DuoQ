## Décommission

Inventaire des données:

Le premier type de donnees personnel traité est les donnees d’identifications et d’authentification(login, AuthContext)

- **Catégorie de données :** Adresses e-mail, identifiants uniques (UID Firebase), mots de passe (sous forme de hash stockés en toute sécurité).
•L**ocalisation :** Serveurs de Firebase Authentication et collection Utilisateurs dans la base de données Firestore.
- Durée  de conservation légale (CNIL/RGPD):
Jusqu’a la supression du compte par l’utilisateur.
En cas D’inactivité, purge recommandée après 3 ans maximum à compter de la derniere connexion.

Le deuxieme type est les donnees de communication et de contenu (chat)

- **Catégorie de données :** Contenue des messages textes envoyées, dates et heure, identifiant de l’expediteur et du destinataire. Ces champs libres peuvent contenir des données sensibles saisies par l’user.
- Localisation : Base de données Firestore
- **Durée de conservation légale :**  Actives : Pendant toute la durée d'utilisation de l'application jusqu'à la fermeture du compte.
Au titre de la "LCEN" (Loi pour la Confiance dans l'Économie Numérique) en France : Obligation pour les hébergeurs de conserver les données permettant d'identifier la création d'un contenu pendant 1 an.

le trosiemes types de données est  configuration et préférences (Settings.tsx)

Catégorie de données : Choix de thèmes, préférences de notification, configuration des clés LLM privées (le cas échéant).
Localisation dans le système : Stockage local du navigateur (Local Storage) ou document de profil Firebase Firestore.
Durée de conservation légale : Tant que le compte est actif ou que le cache du navigateur n'est pas purgé.

1. Données techniques, télémétrie et logs (Grafana Faro, OpenTelemetry)

Catégorie de données : Adresses IP, informations sur le navigateur et l'appareil (User-Agent), traces de navigation, événements d'erreur frontend (sessions utilisateurs) et traces backend.
Localisation dans le système : Transmises et hébergées sur l'infrastructure tierce Grafana Cloud. Outils d'infrastructure d'hébergement.
Durée de conservation légale :
Logs de sécurité / connexion : 6 à 12 mois maximum pour les enquêtes ou répondre aux obligations légales (LCEN).
Cookies/Traceurs analytiques : 13 mois maximum.
Télémétrie brute (Grafana) : Généralement configurée pour une rétention courte (ex: 15 à 30 jours) car utilisée uniquement à des fins de débogage et de supervision de performance.

## Procédure de suppression et d'anonymisation

Pour une application de rencontre (basée sur une architecture classique avec base de données et authentification, comme Firebase), voici les opérations techniques précises à mener lorsqu'un utilisateur demande la suppression de son compte :

### **1. Déclenchement technique de la procédure**

- **Via l'application :** L'utilisateur clique sur le bouton "Supprimer mon compte" dans les paramètres. Cela déclenche un appel API (ou une Cloud Function) de type DELETE /api/users/me.
- **Contrôle de sécurité :** Le serveur vérifie le jeton d'authentification (Token JWT) pour s'assurer que seul l'utilisateur légitime peut déclencher cette action.

### **2. Suppression définitive (Hard Delete) des données personnelles**

Certaines données doivent être littéralement effacées de la base de données :

- **Profil Utilisateur :** Suppression du document ou de la ligne correspondant à l'utilisateur dans la table Users (nom, email, date de naissance, préférences de jeu).
- **Médias :** Suppression de tous les fichiers stockés (Cloud Storage, AWS S3) liés au profil, comme les photos de profil ou de bannières (/avatars/{userId}/).
- **Données de localisation et consentements :** Suppression de l'historique géographique et des logs de validation d'âge.

### **3. Anonymisation des données relationnelles (Messages et Matchs)**

Le RGPD et l'expérience utilisateur exigent souvent de ne pas casser l'application pour les autres utilisateurs (par exemple, si un compte disparaît, les conversations de ses matchs ne doivent pas crasher).

- **Messages envoyés :** Remplacement de l'identifiant de l'auteur (senderId) par un ID générique (ex: deleted_user), et remplacement du pseudonyme associé par "Compte supprimé". Le contenu du message textuel peut être conservé si aucun identifiant n'y figure, ou purgé par mesure de précaution.
- **Statistiques et Analytique :** La plateforme peut conserver des données agrégées à des fins statistiques (ex: l'âge moyen des joueurs de FPS, le nombre de connexions). Le lien avec l'IP, le mail ou le nom de l'utilisateur est rompu de manière irréversible. L'ID de l'utilisateur (userId) est haché ou supprimé des tables d'analytique.

### **4. Suppression de l'identité système (Authentification)**

- **Destruction du compte Auth :** Appel à l'API du fournisseur d'identités (ex: Firebase Authentication admin.auth().deleteUser(uid)) pour supprimer les identifiants de connexion (email/mot de passe).
- **Révocation des sessions :** Tous les Tokens et sessions actives de l'utilisateur sont immédiatement invalidés.

### **5. Gestion des Sauvegardes (Backups) et Logs**

Le RGPD reconnaît qu'il est techniquement complexe de supprimer des données individuelles d'une sauvegarde de base de données globale.

- **Rétention temporelle :** Les processus techniques doivent s'assurer que les sauvegardes (backups réguliers) et les logs serveurs tournent sur une courte période (ex: 30 jours au grand maximum). Passé ce délai, la sauvegarde contenant les données de l'utilisateur supprimé est écrasée automatiquement.
- **Restitution de backup :** Une procédure est documentée par l'équipe technique stipulant que, si un backup doit être restauré suite à un crash, un script de "re-purge" repassera pour effacer les utilisateurs qui avaient été supprimés de la base de données entre-temps.

## Révocation des accès : procédure de désactivation des comptes, des clés API, et des certificats.

### **1. Désactivation et Révocation des Comptes Utilisateurs (Firebase Authentication)**

Lorsqu'un compte utilisateur doit être désactivé (suspension, demande de suppression ou compromission) :

**Désactivation de l'accès (Console Firebase) :**

1. Accédez à la console Firebase > **Authentication** > onglet **Users**.
2. Recherchez l'utilisateur à l'aide de son UID ou de son adresse e-mail.
3. Cliquez sur le menu d'actions (les trois petits points à droite).
4. Sélectionnez **Désactiver le compte** (Disable account) pour empêcher toute nouvelle connexion tout en conservant les données, ou **Supprimer le compte** (Delete account) pour une révocation et suppression totale de l'identité.

**Révocation des sessions actives :**

Une simple désactivation bloque les nouvelles connexions, mais les jetons (tokens JWT) en cours de validité (généralement 1 heure) permettent encore l'accès. Pour couper l'accès immédiatement, il faut révoquer les tokens de rafraîchissement.

- **Techniquement :** Cela s'effectue via le SDK Firebase Admin (côté serveur/Cloud Functions) avec la commande :
    
    codeJavaScript
    
    `admin.auth().revokeRefreshTokens(uid)`
    

### **2. Révocation des Clés API (Environnement Client / Firebase)**

Les clés API publiques de Firebase (utilisées par votre front-end web ou mobile) ne sont pas secrètes, mais elles peuvent faire l'objet de quotas abusifs si elles sont utilisées ailleurs.

**Procédure (Google Cloud Console) :**

1. Allez sur **Google Cloud Console** et sélectionnez votre projet (reliable-gravity-707pf).
2. Naviguez vers **API et services** > **Identifiants**.
3. Dans la liste **Clés API**, repérez la clé Firebase (souvent nommée *Browser key* ou *Auto-created by Firebase*).
4. Pour la révoquer définitivement, cliquez sur l'icône **Supprimer**.
5. *Bonne pratique :* Plutôt que de la supprimer (ce qui casserait votre application), il est souvent préférable de cliquer sur la clé pour **Restreindre la clé** (Restrictions d'applications > Référents HTTP) en n'autorisant que les URL de votre site (ex: *.votredomaine.com/*).

### **3. Révocation des Comptes de Service (CI/CD et Backend)**

Les comptes de service permettent d'authentifier des machines (comme GitHub Actions pour le déploiement ou un backend pour accéder à Firestore). Si un fichier JSON de compte de service a fuité, il doit être révoqué immédiatement.

**Procédure (Google Cloud Console) :**

1. Allez dans **IAM et administration** > **Comptes de service**.
2. Cliquez sur l'adresse e-mail du compte de service compromis (ex: celui utilisé pour l'action FirebaseExtended).
3. Allez dans l'onglet **Clés**.
4. Repérez la clé compromise (grâce à son ID ou à sa date de création) et cliquez sur l'icône de corbeille pour la **Supprimer**. La révocation est immédiate.
5. **Rotation :** Cliquez sur **Ajouter une clé** > **Créer une clé** (JSON) pour en générer une nouvelle.
6. Allez mettre à jour cette nouvelle valeur dans les secrets de votre plateforme d'intégration continue (ex: GitHub Secrets FIREBASE_SERVICE_ACCOUNT).

### **4. Révocation des Certificats SSL/TLS**

Le trafic vers votre application (si elle est hébergée sur Firebase Hosting ou Google Cloud Run) est protégé par des certificats SSL gérés automatiquement.

**Procédure (Firebase Hosting) :**

- **Gestion managée :** Firebase provisionne, renouvelle et révoque automatiquement les certificats SSL via *Let's Encrypt* ou *Google Trust Services*. Il n'y a pas de manipulation de clé privée SSL à votre niveau.
- **Révocation d'un domaine :** Si vous souhaitez forcer la révocation d'un certificat pour un domaine que vous ne voulez plus utiliser :
    1. Allez dans la console Firebase > **Hosting**.
    2. Trouvez votre domaine personnalisé dans le tableau de bord.
    3. Cliquez sur le menu d'actions (trois points) et choisissez **Supprimer le domaine**. Firebase cessera de router le trafic et renouvellera la configuration pour exclure ce certificat de son infrastructure de front commun.

## **Archivage légal**

Conformément au RGPD et aux obligations légales françaises, certaines données doivent être conservées au-delà de la décommission de DuoQ, même après suppression de la plateforme. Ces données sont extraites de Firestore avant la décommission et archivées dans un stockage sécurisé hors ligne.

| **Catégorie de données** | **Localisation dans le système** | **Durée de conservation** | **Justification légale** |
| --- | --- | --- | --- |
| **Logs de connexion et d'authentification** | Firebase Auth + logs Vercel | **1 an** | Obligation de conservation des traces d'accès (LCEN, art. 6) |
| **Données de facturation (abonnements premium)** | Collection /users — champ is_premium + historique transactions | **10 ans** | Obligation comptable (Code de commerce, art. L123-22) |
| **Signalements de modération traités** | Données modérateurs (incidents résolus) | **3 ans** | Preuve de diligence en cas de litige ou plainte ultérieure |
| **Consentements RGPD recueillis** | Collection /users — horodatage de création de compte et acceptation CGU | **5 ans** | Preuve de consentement exigée par le RGPD (art. 7) |

### **Modalités d'archivage**

**1 Export Firestore** avant décommission, export complet des collections concernées via firebase firestore:export au format JSON chiffré (AES-256).

**2 Stockage hors ligne sécurisé** les archives sont stockées sur un support chiffré à accès restreint, conservé par le responsable de traitement désigné. Accès journalisé et limité aux seuls ayants droit légaux.

**3 Purge à échéance**  destruction sécurisée des archives à l'issue de leur durée de conservation légale, documentée par un procès-verbal de destruction.

**Données exclues de l'archivage :** messages privés (/matches/{id}/messages), photos de profil (Firebase Storage), swipes (/swipes) et intentions relationnelles (relation_mode) — ces données à caractère personnel sensible sont supprimées définitivement à la décommission, conformément au principe de minimisation du RGPD.

## **Communication**

Le plan de communication vise à informer les utilisateurs et les parties prenantes de la décommission de DuoQ dans des délais suffisants pour leur permettre d'exercer leurs droits et de récupérer leurs données avant fermeture définitive.

### **Calendrier de communication**

**J-60 — Annonce officielle**

**Notification de fermeture aux utilisateurs**

Email envoyé à tous les comptes actifs via Firebase Auth (adresses email collectées à l'inscription US01). Message clair indiquant la date de fermeture, les raisons, et la procédure pour exporter ou supprimer ses données. Mise à jour de la page d'accueil de l'application avec une bannière d'information.

**J-30 — Rappel et portabilité**

**Second email de rappel + activation de l'export de données**

Rappel par email aux utilisateurs n'ayant pas encore exporté leurs données. Activation d'une fonctionnalité d'export JSON du profil et de l'historique de matchs (droit à la portabilité RGPD, art. 20). Notification interne à l'équipe de développement pour préparer les étapes techniques de décommission.

**J-7 — Dernier avertissement**

**Email final + passage en mode lecture seule**

Dernier email de rappel avant fermeture. L'application passe en mode lecture seule : les utilisateurs peuvent consulter et exporter leurs données mais ne peuvent plus créer de nouveaux matchs ou envoyer de messages. Bannière de compte à rebours affichée dans l'application.

**J0 — Fermeture définitive**

**Décommission et page de fermeture**

Suppression des données non archivées, révocation des accès, désactivation des services Firebase et Vercel. L'URL de production affiche une page statique de fermeture pendant 30 jours, indiquant la date de fermeture et un contact email pour toute demande RGPD résiduelle.

**J+30 — Clôture complète**

**Suppression de l'URL et archivage final**

Suppression du projet Vercel et fermeture du projet Firebase. Seules les données soumises à archivage légal sont conservées selon les durées définies à la section 4.

### **Canaux et destinataires**

| **Destinataire** | **Canal** | **Message clé** |
| --- | --- | --- |
| **Utilisateurs actifs** | Email (Firebase Auth) + bannière in-app | Date de fermeture, procédure d'export, droits RGPD, contact |
| **Utilisateurs premium** | Email prioritaire + remboursement prorata | Remboursement de l'abonnement en cours, délai et modalités |
| **Modérateurs** | Email direct + réunion de clôture | Fin de mission, procédure de révocation des accès admin, archivage des signalements |
| **Équipe de développement** | Réunion interne + document de décommission | Planning technique de décommission, responsabilités, archivage du dépôt GitHub |

**Contact RGPD résiduel :** une adresse email dédiée reste active pendant 12 mois après la fermeture pour traiter toute demande d'exercice de droits (accès, rectification, effacement) sur les données archivées.
