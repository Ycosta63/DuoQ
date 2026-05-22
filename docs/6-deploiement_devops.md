# DÉPLOIEMENT & DEVOPS

## Application en production

### Architecture de déploiement

**Vercel :** Frontend / Backend (React + Express)

**Firebase :** Firestore (BDD) + Auth + Storage

L'intégralité de l'application frontend et backend est hébergée sur **Vercel**.  
Le frontend est rendu via **React**, et la logique backend est implémentée sous forme d'**API Routes Express**, exécutées comme fonctions serverless directement sur Vercel. **Firebase** est utilisé exclusivement comme couche de données : Firestore pour la base de données (profils, matchs, messages), Firebase Auth pour l'authentification, et Firebase Storage pour les avatars.

| **Composant** | **Service** | **Plan** | **Rôle** |
| --- | --- | --- | --- |
| Frontend | **Vercel** | Hobby (gratuit) | Rendu React, CDN mondial, HTTPS automatique |
| Backend | **Vercel** | Hobby (gratuit) | API Routes serverless (matching, messagerie, profils) |
| Base de données | **Firebase Firestore** | Spark (gratuit) | Stockage des profils, matchs, messages en temps réel |
| Authentification | **Firebase Auth** | Spark (gratuit) | Gestion des comptes, sessions, vérification d'âge |
| Médias | **Firebase Storage** | Spark (gratuit) | Stockage des avatars et photos de profil |

**URL de production :** [https://duoq.vercel.app](https://duo-q-silk.vercel.app) : URL générée au premier déploiement.**Limites plan gratuit :** Vercel Hobby limite les fonctions serverless à 10 s d'exécution et 100 Go de bande passante/mois. Firestore Spark est limité à 50 000 lectures / 20 000 écritures / jour — largement suffisant en contexte académique.

## Intégration Continue et Déploiement Continu (CI/CD Pipeline)

Le projet utilise **GitHub Actions** pour assurer la qualité et la stabilité du code, ainsi que son déploiement automatique en production. La configuration de ce pipeline complet se trouve dans `.github/workflows/ci.yml`.

À chaque `push` ou `pull_request` sur les branches `main` et `develop`, une première étape d'intégration continue (CI) garantit l'intégrité du code (Job `build-and-test`) :

1. **Installation des dépendances** (`npm ci`) : Téléchargement d'un arbre de dépendances strict pour reproduire l'environnement.
2. **Qualité du code / Lint** (`npm run lint`) : Analyse statique du code TypeScript pour détecter les potentielles erreurs de typage et de syntaxe avant exécution.
3. **Tests Unitaires** (`npm run test`) : Passage de la suite de tests automatisés (via Vitest) sur nos composants React pour s'assurer du non-bris des fonctionnalités critiques.
4. **Compilation / Build** (`npm run build`) : Construction complète pour vérifier que le projet est apte à être exécuté. Si une de ces étapes échoue, le processus s'arrête ici.

### Déploiement Automatique (CD)

Si toutes les étapes précédentes réussissent, et **uniquement lors d'un merge ou d'un push sur la branche `main`**, le job `deploy-production` s'exécute pour mettre en ligne la dernière version :

5. **Déploiement en Production** (`Deploy to Firebase Hosting`) : L'action GitHub utilise les identifiants sécurisés (Secrets GitHub) pour authentifier le dépôt et déployer automatiquement la version validée sur les serveurs de production. Cela rend la nouvelle version de l'application immédiatement et automatiquement disponible pour les utilisateurs, complétant ainsi notre boucle d'intégration et de livraison continue.


## Stratégie de déploiement

### Architecture de déploiement

**Vercel**Frontend React/Vite+ Backend Express (serverless)

**Firestore** /users /swipes /matches /messages

Le frontend (React + Vite) et le backend (Express via server.ts) sont tous deux hébergés sur **Vercel**. Le backend est compilé par esbuild en dist/server.cjs et déployé comme fonction serverless. **Firebase** est utilisé uniquement comme couche de données via Firestore (collections /users, /swipes, /matches, /matches/{id}/messages) et Firebase Auth.

### Stratégie retenue : Blue/Green via Vercel

**🔵 Blue**  
Version courante en production  
Trafic utilisateurs actif  
⇄  
**🟢 Green**  
Nouveau build Vite + server.cjs  
Isolé, validé, prêt au basculement

DuoQ adopte une stratégie de **Blue/Green Deployment**, rendue native par Vercel qui conserve l'intégralité de l'historique des déploiements. Chaque push validé sur main génère un nouvel artefact immuable (build Vite + dist/server.cjs) qui est déployé sans écraser la version précédente.

| **Stratégie** | **Verdict** | **Raison** |
| --- | --- | --- |
| **Blue/Green** | **✓ Retenu** | Natif Vercel : déploiement, zéro downtime, rollback instantané sur n'importe quelle version précédente sans redéclencher le pipeline CI |
| Rolling Update | **✗ Écarté** | Implique une coexistence temporaire de plusieurs versions, source d'incohérences entre le schéma Firestore attendu et les collections existantes (/swipes, /matches) |
| Canary | **✗ Écarté** | Routage pondéré du trafic non disponible sur Vercel Hobby ; base d'utilisateurs trop réduite en phase projet pour être pertinent |

### Déroulé d'une mise en production

1. **Trigger :** Un développeur merge une PR validée sur main. Le workflow .github/workflows/ci.yml se déclenche automatiquement.
2. **CI - Installation :** npm ci installe les dépendances de façon stricte depuis package-lock.json, garantissant un environnement reproductible.
3. **CI - Lint :** tsc --noEmit vérifie la validité des types TypeScript sur l'ensemble du projet (frontend React + backend Express). Toute erreur de typage bloque le pipeline.
4. **CI - Tests :** vitest run exécute la suite de tests unitaires sur les composants React et la logique métier. Tout test en échec bloque le déploiement.
5. **CI - Build :** vite build compile le frontend dans dist/ ; esbuild server.ts compile le backend Express en dist/server.cjs. L'artefact complet est prêt.
6. **CD - Déploiement Green (si le CI fonctionne + branche main) :** Vercel reçoit l'artefact et le déploie sur un nouveau slot isolé. La version Blue reste active et continue de servir les utilisateurs pendant ce temps.
7. **Basculement atomique :** Une fois le slot Green validé par Vercel, le trafic est basculé instantanément vers la nouvelle version. Les variables d'environnement Firebase (VITE_FIREBASE_*) sont injectées depuis les secrets GitHub, jamais committées dans le dépôt.
8. **Vérification post-déploiement :** Contrôle manuel rapide sur duo-q-silk.vercel.app : inscription, swipe GG/FF, match, messagerie. Vérification du quota Firestore dans la Firebase Console.

### Procédures de rollback

**A. Rollback Vercel - 1 clic (méthode principale) :**  
Vercel conserve l'historique complet de tous les déploiements. Depuis le dashboard Vercel → Deployments, sélectionner le déploiement précédent sain et cliquer sur *Promote to Production*. Le basculement est instantané. Délai de rétablissement : **< 1 minute**, sans redéclencher le pipeline CI.

**B. Rollback Git - revert de commit :**  
En cas de régression sur le code source : git revert HEAD crée un commit d'annulation qui repasse par le pipeline CI complet avant déploiement. Plus lent (≈ 5 min) mais garantit la cohérence du dépôt.

**C. Rollback des règles Firestore :**  
Si la régression provient d'une modification de firestore.rules, effectuer un git revert du commit concerné, puis redéployer les règles via firebase deploy --only firestore:rules. Les règles étant versionnées dans le dépôt, tout l'historique est traçable.

# Monitoring:  Supervision avec Grafana Cloud

Ce document explique la configuration de la supervision implémentée dans l'application via Grafana Cloud. Nous avons mis en place à la fois la supervision frontend des utilisateurs réels (RUM) et le traçage backend.

## 1. Supervision Frontend (Grafana Faro)

Nous avons intégré le **Grafana Faro Web SDK** pour collecter la télémétrie frontend, comme les erreurs, les web vitals et les sessions utilisateurs.

- **Initialisation** : Le récepteur Faro est initialisé dans `src/main.tsx`.
- **Configuration** : Il envoie les données à l'URL du endpoint Grafana Faro.
- **Instrumentations** : Il capture les instrumentations web standards et inclut `TracingInstrumentation` pour une visibilité de bout en bout des requêtes HTTP effectuées par le frontend.

## 2. Traçage Backend (OpenTelemetry)

Nous avons configuré **OpenTelemetry** sur le backend pour capturer les traces et les exporter vers Grafana Cloud.

- **Initialisation** : La configuration se trouve dans `instrument.ts`, qui est importé tout en haut de `server.ts`.
- **Node SDK** : Il utilise `@opentelemetry/sdk-node` avec les auto-instrumentations pour Node.js (`@opentelemetry/auto-instrumentations-node`) pour capturer automatiquement les traces des modules comme Express et HTTP.
- **Exportateur** : Les traces sont exportées via HTTP en utilisant `OTLPTraceExporter` (`@opentelemetry/exporter-trace-otlp-http`).
- **Configuration** : L'exportateur s'appuie sur les variables d'environnement standards d'OpenTelemetry (`OTEL_EXPORTER_OTLP_ENDPOINT` et `OTEL_EXPORTER_OTLP_HEADERS`) pour s'authentifier et router les traces vers votre instance Grafana Cloud spécifique.

## 3. Variables d'Environnement Utilisées

Pour que cela fonctionne de manière sécurisée, les variables d'environnement suivantes sont utilisées (et leurs structures sont indiquées dans `.env.example`) :

- **`OTEL_EXPORTER_OTLP_ENDPOINT`** : L'URL du endpoint pour la passerelle OpenTelemetry (par exemple, `https://otlp-gateway-prod-us-east-2.grafana.net/otlp`).
- **`OTEL_EXPORTER_OTLP_HEADERS`** : Le jeton d'autorisation au format `Authorization=Basic <base64_encoded_token>`. Cela garantit que les traces backend sont poussées en toute sécurité vers votre endpoint OpenTelemetry Grafana Cloud.

_Note : Si `OTEL_EXPORTER_OTLP_ENDPOINT` et `OTEL_EXPORTER_OTLP_HEADERS` ne sont pas définis dans vos variables d'environnement secrètes, l'initialisation du traçage backend sera simplement ignorée pour éviter les plantages lors de l'exécution._
