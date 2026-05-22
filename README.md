# DuoQ

DuoQ est une application pour trouver votre partenaire de jeu idéal. Elle permet de matcher avec d'autres joueurs et de communiquer avec eux en temps réel.

## 🚀 Installation

Pour installer le projet localement et ses dépendances :

1. Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé sur votre machine.
2. Clonez le dépôt et naviguez dans le dossier du projet ou ouvrez-le.
3. Exécutez la commande suivante pour installer les dépendances :

```bash
npm install
```

## 🛠 Lancement de l'application (Développement)

Pour démarrer l'application en mode développement (ceci lance le backend Express et l'application frontend Vite) :

```bash
npm run dev
```

Le serveur sera ensuite accessible sur `http://localhost:3000`.

## 🧪 Lancer les tests

L'application possède une commande de vérification (lint). Pour analyser l'intégrité du code :

```bash
npm run lint
```
*(Remarque : par défaut, la commande lint vérifie la validité des composants TypeScript de l'application.*)

## 📦 Build et Production

Pour préparer l'application pour la production, exécutez la commande suivante :

```bash
npm run build
```

Cela va regrouper l'interface et le serveur dans le dossier `dist/`. Pour démarrer cette version de production :

```bash
npm run start
```

## ⚙️ Intégration Continue et Déploiement Continu (CI/CD Pipeline)

Le projet utilise **GitHub Actions** pour assurer la qualité et la stabilité du code, ainsi que son déploiement automatique en production. La configuration de ce pipeline complet se trouve dans `.github/workflows/ci.yml`.

À chaque `push` ou `pull_request` sur les branches `main` et `develop`, une première étape d'intégration continue (CI) garantit l'intégrité du code (Job `build-and-test`) :

1. **Installation des dépendances** (`npm ci`) : Téléchargement d'un arbre de dépendances strict pour reproduire l'environnement.
2. **Qualité du code / Lint** (`npm run lint`) : Analyse statique du code TypeScript pour détecter les potentielles erreurs de typage et de syntaxe avant exécution.
3. **Tests Unitaires** (`npm run test`) : Passage de la suite de tests automatisés (via Vitest) sur nos composants React pour s'assurer du non-bris des fonctionnalités critiques.
4. **Compilation / Build** (`npm run build`) : Construction complète pour vérifier que le projet est apte à être exécuté. Si une de ces étapes échoue, le processus s'arrête ici.

### 🚀 Déploiement Automatique (CD)

Si toutes les étapes précédentes réussissent, et **uniquement lors d'un merge ou d'un push sur la branche `main`**, le job `deploy-production` s'exécute pour mettre en ligne la dernière version :

5. **Déploiement en Production** (`Deploy to Firebase Hosting`) : L'action GitHub utilise les identifiants sécurisés (Secrets GitHub) pour authentifier le dépôt et déployer automatiquement la version validée sur les serveurs de production. Cela rend la nouvelle version de l'application immédiatement et automatiquement disponible pour les utilisateurs, complétant ainsi notre boucle d'intégration et de livraison continue.

### 🔄 Stratégie de Déploiement : Blue/Green Deployment (Via Firebase)

Pour notre processus de mise en production, nous avons opté pour une approche **Blue/Green Deployment** (déploiement atomique), facilitée nativement par Firebase Hosting, la plateforme que nous utilisons pour le CD :

- **Raisons du choix :** Contrairement au *rolling update* (où les instances sont mises à jour une par une et peuvent coexister de manière incohérente temporairement), ou au *canary* (déploiement asymétrique sur une fraction de la population), la stratégie Blue/Green via hébergement serverless assure que la nouvelle version est d'abord entièrement préparée et téléversée en isolation ("Green"). Une fois prête, une commutation de trafic instantanée est opérée. Cela garantit qu'il n'y a **aucun temps d'arrêt** (zéro downtime) pour les utilisateurs et prévient les erreurs de cache au chargement partiel.

#### 📝 Déroulé exact d'une mise en production
1. **Trigger :** Un développeur fusionne (merge) une modification validée vers la branche `main`.
2. **Isolation (Green) :** Le Pipeline CI/CD sur GitHub Actions s'exécute, vérifie le code et rassemble l'artefact de production complet dans le dossier `dist/`.
3. **Validation & Téléversement :** Lors de l'étape `Deploy to Firebase Hosting`, les fichiers sont uploadés vers un nouveau slot de publication interne sur les serveurs de Firebase.
4. **Basculement de Trafic (Switch) :** Une fois le bundle 100% transféré et son intégrité validée cryptographiquement, les CDN et les routeurs Firebase sont mis à jour pour orienter l'intégralité du trafic public vers cette nouvelle version (Blue -> Green) de manière atomique.

#### ⏪ Procédures de Rollback (Retour en Arrière)
L'avantage critique d'une stratégie Blue/Green est l'immuabilité de la version précédente, qui n'est pas "écrasée" mais préservée comme "inédite". En cas de régression ou de défaillance majeure post-déploiement (ex. crash applicatif sur des données du live) :

- **Rollback Manuel (1 Clic) :** Tout administrateur peut se rendre sur l'interface du projet Firebase, naviguer jusqu'à l'onglet Hosting -> "Historique des versions", trouver la version précédente saine (ancien "Blue"), et cliquer sur l'option de Rollback ("Restaurer").
- **Rollback via l'Interface de Déploiement CLI :** Un ingénieur DevOps peut basculer le trafic localement via la commande :
  `firebase hosting:clone your-project-id:version-id-precedente your-project-id:live`

Dans ce cas de figure, le rétablissement de la version stable est instantané, et n'implique pas un redéclenchement long de la phase de CI afin d'obtenir un rétablissement de service ultra rapide.

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
