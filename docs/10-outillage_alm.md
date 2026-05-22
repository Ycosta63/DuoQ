**Outillage ALM**

**1. Grille de critères**
Pour répondre aux contraintes de notre équipe et de notre stack technique, nous avons défini 8 critères d'évaluation :

- **Gestion du backlog :** Organisation des 3 sprints et priorisation des User Stories selon la méthode MoSCoW.
- **CI/CD intégré :** Automatisation des workflows de tests (Vitest) et de build (Vite/esbuild).
- **Traçabilité :** Lien direct entre les requêtes de fonctionnalités, les commits et le code source.
- **Coût d'exploitation :** Adéquation avec un budget d'infrastructure limité nécessitant l'usage de plans gratuits.
- **Courbe d'apprentissage :** Prise en main rapide de l'outil pour respecter un délai de livraison très court.
- **Écosystème et Déploiement :** Synergie native avec notre hébergement sur Vercel et notre base Firebase pour assurer le Blue/Green Deployment.
- **Gestion documentaire :** Espace centralisé pour stocker la conception (diagrammes) et la matrice des risques.
- **Sécurité et accès :** Capacité à gérer et injecter de manière invisible les secrets et variables d'environnement.

**2. Comparatif**

| Critère | GitHub + Actions | GitLab | Jira + Confluence |
| --- | --- | --- | --- |
| 1. Gestion du backlog | 4/5 | 4/5 | 5/5 |
| 2. CI/CD intégré | 5/5 | 5/5 | 2/5 |
| 3. Traçabilité | 5/5 | 5/5 | 4/5 |
| 4. Coût d'exploitation | 5/5 | 5/5 | 3/5 |
| 5. Courbe d'apprentissage | 4/5 | 3/5 | 2/5 |
| 6. Écosystème et déploiement | 5/5 | 4/5 | 3/5 |
| 7. Gestion documentaire | 3/5 | 4/5 | 5/5 |
| 8. Sécurité (gestion des secrets) | 5/5 | 5/5 | 3/5 |
| Total | 36/40 | 35/40 | 27/40 |

**3. Recommandation motivée**
Nous recommandons d'utiliser **GitHub + Actions** (associé à GitHub Projects) pour piloter le projet DuoQ.
Ce choix s'explique par trois facteurs adaptés à notre contexte :

- **Continuité technique :** Notre pipeline d'intégration (installation stricte, typage, tests) et de déploiement continu vers Vercel est déjà scripté via les workflows GitHub Actions. Conserver cet environnement évite une migration risquée et garantit le maintien de notre stratégie de Blue/Green Deployment.
- **Traçabilité anticollision :** GitHub Projects nous permet de lier directement le backlog produit aux pull requests. Pour une équipe réduite, cette centralisation limite fortement le risque de travail en doublon ou de rôles mal définis identifié dans notre matrice des risques.
- **Respect du budget :** L'écosystème GitHub rassemble l'hébergement du code, le suivi Kanban et l'automatisation CI/CD dans un plan totalement gratuit, ce qui répond à notre contrainte financière stricte.