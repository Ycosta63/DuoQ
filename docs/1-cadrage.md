# CADRAGE

## DuoQ

**DuoQ** est une application de rencontres destinée aux joueurs de jeux vidéo. Elle permet à ses utilisateurs de créer un profil centré sur leurs preferences (jeux favoris, style de jeu, disponibilités), puis de découvrir d'autres joueurs selon des critères de compatibilité partagés. La mise en relation repose sur un système de likes mutuels (*GG / FF Go Next)* et d'une fonctionnalité premium (*GOAT*) permettant de se mettre en avant dans la liste des profils. Une fois le match établi, les utilisateurs peuvent entamer une conversation directement dans l'application ou rejoindre ensemble un lobby via l'intégration Discord. DuoQ s'adresse à une communauté de joueurs qui peinent à faire des rencontres via les canaux classiques.

**Problème résolu et valeur apportée**

Les plateformes de rencontres généralistes ne tiennent pas compte des pratiques et de l'identité gaming de leurs utilisateurs. Deux joueurs peuvent se retrouver en complet décalage sur des aspects essentiels : temps de jeu, jeux pratiqués, compétitivité ou type de relation recherché. DuoQ résout ce problème en plaçant le jeu vidéo au centre du profil et du processus de matching.

La valeur apportée est double : d'une part, un filtrage pertinent grâce au questionnaire de profil gaming et au choix explicite du type de relation recherché ; d'autre part, un brise-glace naturel avec le ou les jeux communs qui facilitent l'engagement de la conversation et réduit la friction liée à la timidité souvent associée à ce public.

**Parties prenantes**

| **Partie prenante** | **Rôle** | **Attentes** |
| --- | --- | --- |
| **Utilisateurs** | Acteurs principaux de la plateforme, créent un profil et interagissent avec d'autres membres | Trouver des profils compatibles rapidement ; bénéficier d'une interface intuitive et fidèle à la culture gaming ; protéger leurs données personnelles |
| **Utilisateurs premium** | Sous-ensemble des utilisateurs ayant souscrit à un abonnement payant | Accéder à des fonctionnalités exclusives (GOAT) offrant une meilleure visibilité ; retour sur investissement perçu comme justifié |
| **Modérateurs** | Garants de la sécurité et du respect des règles de la communauté | Disposer d'outils efficaces de signalement et de sanction ; maintenir un environnement sain et inclusif |
| **Équipe de développement** | Conception, développement et maintenance de l'application | Périmètre fonctionnel clair ; backlog priorisé ; retours utilisateurs exploitables |

**Périmètre fonctionnel**

| N° | **Fonctionnalité** | **Description** |
| --- | --- | --- |
| F1 | Création de profil gaming | À l'inscription, l'utilisateur remplit un questionnaire détaillant ses jeux favoris, son style de jeu et ses disponibilités. Il choisit obligatoirement un mode qui signale son intention relationnelle, affiché en badge visible sur son profil dès avant le like :<br/>🎮 Manette à deux : relation sérieuse<br/> 🕹️ Co-op story : relation décontractée<br/> 🖥️ PC : Plan Cul<br/> 🎯 One-shot : coup d'un soir<br/> Ce système, inspiré de Fruitz, permet de clarifier les intentions dès le profil et d'éviter les malentendus. |
| F2 | Système de matching GG / FF Go Next | Les utilisateurs peuvent liker (GG) ou passer (FF Go Next) les profils suggérés. Un match est établi lorsque deux utilisateurs se GG mutuellement, débloquant l'accès à la messagerie et au profil complet. |
| F3 | Affichage du profil complet post-match | Le questionnaire complet d'un utilisateur n'est révélé qu'après un match mutuel. Ce mécanisme incite à l'interaction plutôt qu'au rejet superficiel, et sert de brise-glace naturel pour engager la conversation. |
| F4 | GOAT — Mise en avant premium | Fonctionnalité réservée aux abonnés premium. L'envoi d'un GOAT positionne l'émetteur en tête de liste chez le destinataire. Si ce dernier répond par un GG, le match est immédiatement établi. |
| F5 | Intégration Discord — DuoQ en date | Une fois matché, les utilisateurs peuvent lier leur compte Discord et rejoindre un lobby commun depuis l'application, permettant de passer naturellement de la rencontre en ligne à la session de jeu partagée. |

**Hors périmètre**

- Intégration avec d'autres plateformes tierces que Discord (Steam, Twitch, PlayStation Network, Xbox Live…)
- Création ou gestion de tournois et d'événements gaming in-app
- Système de géolocalisation ou de rencontres physiques organisées via l'application
- Streaming ou diffusion de parties en direct au sein de la plateforme
- Application mobile native (iOS / Android) pour la V1 — la version initiale cible un accès web responsive
- Algorithme de recommandation basé sur l'apprentissage automatique (matching par règles métier uniquement en V1)

**Contraintes identifiées**

| **Catégorie** | **Contrainte** |
| --- | --- |
| **Légale** | Conformité RGPD obligatoire : collecte de données sensibles (orientation, pratiques relationnelles). Nécessite une politique de confidentialité claire, un consentement explicite et un droit à l'effacement opérationnel. |
| Légale | Vérification de l'âge des utilisateurs (18 ans minimum) compte tenu de la nature de certaines options de relation proposées. |
| Technique | L'intégration Discord repose sur l'API OAuth2 de Discord, soumise à ses propres conditions d'utilisation et limitations de taux (*rate limits*). |
| Technique | Scalabilité du système de matching : les algorithmes de suggestion doivent rester performants à mesure que la base d'utilisateurs croît. |
| Organisationnelle | Projet réalisé par une équipe réduite (3–4 étudiants) sur une durée contrainte, imposant une priorisation stricte du périmètre fonctionnel. |
| Financière | Budget infrastructure limité : hébergement sur solution cloud gratuite ou à faible coût (Render, Vercel, Railway) pour la durée du projet. |