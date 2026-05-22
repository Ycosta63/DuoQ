## Maintenance

Catalogue des incidents

**I1 Quota Firestore épuisé lecture/écriture bloquéeCritiqueRTO : < 30 min**

**Description**

Le plan Spark de Firebase autorise 50 000 lectures et 20 000 écritures par jour. En cas de pic de trafic ou de boucle applicative défectueuse dans server.ts, ce quota peut être atteint. Toutes les requêtes Firestore échouent alors avec une erreur RESOURCE_EXHAUSTED, rendant le matching, la messagerie et l'authentification inopérants.

**Détection**

Alerte Firebase Console → quota > 80 % du seuil journalier. Erreurs 503 sur les routes POST /api/swipe, GET /api/discover remontées dans les logs Vercel.

**Résolution**

1. Identifier la route consommatrice via les logs Vercel. 2. Corriger la boucle ou la requête excessive dans server.ts. 3. Attendre le reset automatique du quota à minuit (heure du projet Firebase), ou migrer temporairement vers le plan Blaze (pay-as-you-go).

**I2 Échec de l'authentification Firebase Auth connexion impossibleCritiqueRTO : < 15 min**

**Description**

Une mauvaise configuration des variables d'environnement Firebase (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID…) après un déploiement, ou une indisponibilité du service Firebase Auth, empêche tout utilisateur de se connecter ou de s'inscrire. L'application est inutilisable car l'authentification conditionne l'accès à toutes les fonctionnalités (US01, US09).

**Détection**

Erreurs auth/invalid-api-key ou auth/network-request-failed dans la console navigateur. Taux d'erreur 401 sur POST /api/auth/login et /api/auth/register visible dans les logs Vercel.

**Résolution**

1. Vérifier le statut Firebase sur status.firebase.google.com. 2. Contrôler les variables d'environnement dans le dashboard Vercel (Settings → Environment Variables). 3. Si variable manquante : l'ajouter et redéployer. 4. Si incident Firebase : attendre le rétablissement du service.

**I3 Régression post-déploiement crash du backend ExpressCritiqueRTO : < 5 min**

**Description**

Un merge sur main introduit une erreur runtime dans dist/server.cjs (route manquante, exception non gérée, accès à une propriété undefined dans la logique de matching ou de messagerie). Les fonctions serverless Vercel retournent systématiquement des erreurs 500 sur les routes API.

**Détection**

Taux d'erreur 5xx > 5 % sur 10 minutes dans Vercel Analytics. Logs de fonction serverless affichant une stack trace dans Vercel → Functions → Logs.

**Résolution**

Rollback immédiat via Vercel Dashboard → Deployments → sélectionner le déploiement précédent sain → *Promote to Production*. Délai de rétablissement : < 1 min. Correction du bug sur une branche hotfix/ puis PR vers main.

**I4 Échec de l'intégration Discord OAuth liaison de compte impossibleModéréRTO : < 2h**

**Description**

Le flux Discord OAuth2 (GET /api/auth/discord/url → redirect → POST /oauth2/token → GET /users/@me) est interrompu. Causes possibles : URL de callback mal configurée dans l'application Discord Developer Portal, token Discord révoqué, ou changement de l'API Discord. Les utilisateurs matchés ne peuvent plus lier leur compte Discord ni lancer de DuoQ Date (US11, US12).

**Détection**

Erreurs 400 invalid_request ou 401 unauthorized sur les routes Discord OAuth dans les logs Vercel. Remontées utilisateurs signalant l'impossibilité de lier Discord.

**Résolution**

1. Vérifier la configuration du Discord Developer Portal (Redirect URIs, Client ID/Secret). 2. Régénérer le Client Secret si compromis et mettre à jour le secret Vercel correspondant. 3. Vérifier le statut Discord sur discordstatus.com. 4. Redéployer si variable d'environnement modifiée.

**I5 Violation des règles Firestore accès non autorisé aux donnéesMajeurRTO : < 20 min**

**Description**

Une modification incorrecte du fichier firestore.rules expose des collections sensibles (/users, /matches, /messages) à des accès non authentifiés ou croise les droits entre utilisateurs. Ce type d'incident a un impact direct sur la conformité RGPD et la confidentialité des données relationnelles des utilisateurs (profil, intention de rencontre, historique de messages).

**Détection**

Erreurs permission-denied inattendues dans les logs côté client, ou inversement : accès réussis sur des ressources qui devraient être protégées. Détectable via Firebase Console → Firestore → Rules Playground en rejouant des scénarios d'accès.

**Résolution**

1. Identifier le commit fautif dans l'historique Git de firestore.rules. 2. Exécuter git revert sur ce commit. 3. Redéployer les règles via firebase deploy --only firestore:rules. 4. Valider via Rules Playground que les accès sont correctement restreints. 5. Notifier les utilisateurs potentiellement affectés (obligation RGPD si fuite avérée).

#### Gestion de la dette technique

**Accès direct à Firestore depuis le frontend React — contournement du backendImpact : Modéré à Élevé**

**Description**

Dans une optique de rapidité de développement, le frontend React interagit directement avec Firestore via le SDK client Firebase (imports de doc et getDoc visibles dans AuthContext.tsx). La logique métier contourne ainsi le backend personnalisé (server.ts), qui avait pourtant été conçu pour centraliser les accès aux données.

**Impact estimé**

**Sécurité :** la protection des données repose uniquement sur les firestore.rules, qui ont des capacités de logique conditionnelle limitées par rapport à du code backend.**Observabilité :** les requêtes Firestore ne transitant pas par Express, la télémétrie OpenTelemetry installée sur le routeur Node.js ne les capture pas, rendant le monitoring partiel.**Couplage :** toute migration de base de données ou ajout d'une couche de traitement (validation, transformation) impose de modifier le frontend directement.

**Effort de remédiation :** Élevé 

nécessite de créer de nouvelles routes Express, de refactoriser AuthContext.tsx et tous les composants accédant directement à Firestore, puis de tester l'ensemble de la chaîne. Estimé à plusieurs sprints complets en v2.

**Plan de remédiation** 

**1** Installer et configurer le **Firebase Admin SDK** côté server.ts pour que le backend dispose d'un accès privilégié à Firestore, indépendant du SDK client.

**2** Créer des routes API dédiées dans Express pour chaque opération actuellement faite côté client :

GET  /api/users/:id
POST /api/auth/register
POST /api/auth/login
PUT  /api/users/:id

**3** Refactoriser le frontend pour qu'il interroge exclusivement ces routes via fetch, supprimant tout import du SDK Firestore client dans les composants React.

**DT2 Monolithe d'exécution — backend Express couplé au middleware ViteImpact : Faible à Modéré**

**Description**

Le fichier server.ts a été conçu de façon hybride pour gérer à la fois les routes API (/api/*) et servir de middleware pour le serveur de développement Vite (createServer({ server: { middlewareMode: true } })). Ce compromis a permis de lancer le projet avec une seule commande (npm run dev), mais crée un couplage fort entre les deux couches.

**Impact estimé**

**Développement :** la boucle de rechargement à chaud (HMR) accumule de la latence car le démarrage du backend et du frontend est fortement couplé.**Production :** chaque instance serverless Vercel embarque à la fois le serveur d'assets statiques et le traitement des requêtes API, rendant impossible une mise à l'échelle isolée de l'un ou de l'autre.

**Effort de remédiation :** Modéré 

nécessite une restructuration en monorepo et une modification de vite.config.ts pour déléguer le proxy API à Vite en développement. N'impacte pas la logique métier existante.

**Plan de remédiation**

**1** Migrer vers une architecture **monorepo** (ex : pnpm workspaces) avec deux packages distincts : packages/api pour Express et packages/web pour React/Vite.

**2** Définir des scripts de lancement séparés : un pour l'API backend, un pour le frontend, orchestrés via concurrently en développement uniquement.

**3** Configurer le proxy natif de Vite dans vite.config.ts pour rediriger les appels /api/* vers le backend pendant le développement :

server: {
  proxy: {
    '/api': 'http://localhost:3001'
  }
}

**DT3Gestion de l'état asynchrone global via React Context exclusivementImpact : Modéré**

**Description**

L'information asynchrone et les accès réseau (profil Firebase Auth, données utilisateur) sont gérés via la Context API native de React (AuthContext.tsx), combinée à useState et useEffect. Ce choix a permis de démarrer rapidement sans dépendance supplémentaire, mais montre ses limites dès que la complexité des états réseau augmente.

**Impact estimé**

**Performance :** la Context API n'est pas optimisée pour des états fréquemment mutés — toute mise à jour d'un état dans le contexte déclenche un re-rendu de tous les composants consommateurs, y compris ceux non concernés.**Maintenabilité :** le cache, les états de chargement (loading), et les mécanismes de retry en cas d'erreur réseau doivent être écrits et maintenus manuellement, augmentant le risque de bugs subtils.

**Effort de remédiation** Modéré 

introduction d'une librairie externe (TanStack Query ou SWR) et refactorisation progressive des hooks existants. Ne nécessite pas de réécriture de l'architecture globale.

**Plan de remédiation**

**1** Conserver la React Context API uniquement pour les états globaux statiques ou peu mutés (ex : thème clair/sombre, préférences UI).

**2** Introduire **TanStack Query** (ou **SWR**) pour déléguer la récupération de données, la mise en cache et la gestion des états asynchrones :

const { data: user, isLoading, error } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId)
})

**3** Bénéficier automatiquement du cache intégré pour éviter de re-solliciter Firestore à chaque navigation, réduisant ainsi la consommation du quota journalier identifié dans l'incident I1.

## SLO

### **SLI 1 : Taux de disponibilité (Availability)**

- **Indicateur (SLI) :** Pourcentage de requêtes HTTP et requêtes vers l'API traitées avec succès (sans erreurs HTTP 5xx côté backend, et sans erreurs fatales de connexion Firebase côté client) mesurées via OpenTelemetry et Faro.
- **Seuil cible (SLO) :** **99,9 %** de requêtes réussies sur une fenêtre de 30 jours consécutifs.
- **Action en cas de violation :**
    - Déclenchement d'une alerte critique (Priorité 1) envoyée à l'équipe de garde (via Slack, webhook ou PagerDuty).
    - Recherche immédiate des erreurs d'infrastructure dans Grafana OpenTelemetry (Logs et Traces backend).
    - Si le pic de requêtes échouées fait suite à une mise en production < 1h, basculement automatique sur la version précédente (rollback).

### **SLI 2 : Taux d'Erreurs Frontend / Crash (Error Rate)**

- **Indicateur (SLI) :** Pourcentage de sessions utilisateurs côté client (RUM) rencontrant une erreur JavaScript non gérée ou un blocage (identifié et renvoyé par Grafana Faro).
- **Seuil cible (SLO) :** **Moins de 1 %** des sessions utilisateurs.
- **Action en cas de violation :**
    - Alerte métier (Priorité 2) adressée aux développeurs Front-end.
    - Regroupement des erreurs par empreinte (*stack trace*) dans Grafana pour identifier le composant React fautif (ex: défaillance de formatage sur un message entrant).
    - Création automatique d'un ticket de bug et intégration du correctif en urgence (hotfix).

### **SLI 3 : Performance de rendu – Largest Contentful Paint (Latency/UX)**

- **Indicateur (SLI) :** Le temps Largest Contentful Paint (LCP), soit la durée nécessaire pour afficher le plus grand élément visible à l'écran (généralement la fenêtre de la conversation et le dernier message du chat). Cet indicateur web vital est remonté en temps réel par Grafana Faro RUM.
- **Seuil cible (SLO) :** Le LCP doit être **inférieur à 2,5 secondes** pour le **90e centile (p90)** des visiteurs sur desktop et mobile.
- **Action en cas de violation :**
    - Alerte produit dégradé (Priorité 3) remontée à l'équipe.
    - Aucune action à chaud (pas d'arrêt de service), mais analyse des requêtes Firebase initiales pour valider s'il ne manque pas un index de base de données.
    - Ajout immédiat d'un ticket d'optimisation (dette de performance) dans le prochain sprint pour travailler sur le *lazy-loading* des images, la pagination des messages et la taille du bundle compilé.

## 🤖 Mises à jour automatiques des dépendances

Pour garantir la sécurité et la stabilité de l'application de façon proactive, un mécanisme de mise à jour automatique des dépendances a été mis en place via **Dependabot**.

### Fonctionnement

Dependabot est l'outil natif de GitHub pour la gestion des dépendances. Sa configuration est définie dans le fichier `.github/dependabot.yml` à la racine de notre projet.

Il est configuré pour scanner de façon hebdomadaire (`interval: "weekly"`) l'arbre de dépendances (écosystème `npm` via le `package.json`) à la recherche de nouvelles versions (correctifs de sécurité, versions mineures ou majeures).
Dès qu'une nouvelle version d'une librairie utilisée est publiée, Dependabot :
1. Crée automatiquement une branche isolée sur le dépôt.
2. Met à jour la version de la dépendance ciblée dans `package.json` et `package-lock.json`.
3. Ouvre automatiquement une Pull Request détaillée ajoutant un label `dependencies`, prête pour la revue de code.

Cette PR déclenche automatiquement notre pipeline de CI/CD (Lint et Tests). Si les tests sont au vert, l'équipe technique peut fusionner la mise à jour d'un simple clic sans effort manuel, réduisant drastiquement la dette technique.

### Exemple de Pull Request générée automatiquement

Voici à quoi ressemble une Pull Request typo générée par notre outil :

> **Titre:** Bump vite from 5.4.10 to 5.4.14
> **Auteur:** @dependabot[bot]
> **Labels:** `dependencies`
> 
> **Description de la PR :**
> Bumps [vite](https://github.com/vitejs/vite/tree/HEAD/packages/vite) from 5.4.10 to 5.4.14.
> 
> <details>
> <summary><b>Release notes</b></summary>
> <p><em>Sourced from vite's <a href="https://github.com/vitejs/vite/releases">releases</a>.</em></p>
> <ul>
> <li>fix(deps): update all non-major dependencies</li>
> <li>perf(resolve): optimize module resolution in dev server</li>
> <li>fix(build): handle circular dependencies properly</li>
> </ul>
> </details>
> 
> <details>
> <summary><b>Commits</b></summary>
> <ul>
> <li><code><a href="#">a1b2c3d</a></code> chore: update versions</li>
> <li><code><a href="#">e4f5g6h</a></code> fix: build error on windows</li>
> </ul>
> </details>
> 
> ---
> **Fichiers modifiés (2) :**
> - `package.json` : `"vite": "^5.4.14"`
> - `package-lock.json` : Mise à jour de l'arbre et du hash d'intégrité de Vite.

## 🛡 Audits de Sécurité Continus (npm audit)

En complément de Dependabot qui met à jour les dépendances de façon récurrente, il est crucial d'automatiser une surveillance de la sécurité sur les paquets que nous utilisons. Pour cela, nous avons mis en place une vérification continue basée sur l'outil natif `npm audit`.

### Fonctionnement

Nous avons créé un workflow GitHub Actions dédié, disponible dans le fichier `.github/workflows/npm-audit.yml`. 

Cette action va s'exécuter à plusieurs moments stratégiques :
1. **Quotidiennement** (via un cron `0 2 * * *` à 2h00 du matin) pour attraper les vulnérabilités dès qu'elles sont découvertes et répertoriées dans la base de données (advisory database) de Node.js.
2. **Sur chaque Pull Request** (vers la branche `main`) pour d'assurer que du code fraîchement poussé n'introduit pas une nouvelle dépendance vulnérable (une bibliothèque tierce pour implémenter une nouvelle fonctionnalité par exemple).
3. **Manuellement** (via `workflow_dispatch`), permettant à tout développeur d'exécuter un audit de sécurité à la demande.

### Politique de remontée d'information (Purement consultatif)

Afin d'éviter le "bruit" généré par les centaines d'avertissements de sécurité mineurs et de ne pas bloquer les développements pour de fausses alertes logiques, nous avons ajusté notre outil pour être strictement informatif :
La commande exécutée est `npm audit --audit-level=high || true`.

- L'outil ne réalise **aucune modification**, mise à jour ou suppression automatique du code (pas de `npm audit fix`).
- La clause `|| true` garantit que le pipeline CI/CD **n'échouera jamais** à cause de cette vérification.
- Le but de cette configuration est uniquement de générer et archiver un compte rendu consultatif de l'état de sécurité dans l'interface GitHub Actions. Les développeurs ou Lead Dev peuvent ensuite consulter ces résultats ponctuellement pour prendre des décisions d'architecture, sans avoir leurs travaux quotidiens bloqués.