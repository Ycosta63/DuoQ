### Analyse Rétrospective du Projet DuoQ

**1. Ce qui a bien fonctionné**


- **L'utilisation de Firebase (BaaS) :** Déléguer l'authentification et la base de données (Firestore) était la décision la plus rationnelle pour un projet d'une semaine. Cela a évité de devoir configurer un backend complet, ce qui aurait été irréalisable dans le temps imparti.
- **La priorisation fonctionnelle :** Face à la contrainte de temps, l'application stricte de la méthode MoSCoW a permis d'écarter les fonctionnalités secondaires pour se concentrer uniquement sur le cœur du MVP livrable ce vendredi.

**2. Ce qui a moins bien fonctionné**

- **Le temps de développement front-end :** La rédaction du code de l'application sous React a été une difficulté majeure. Le manque d'aisance de l'équipe en développement pur a entraîné des blocages sur la logique métier et la gestion des états, allongeant considérablement le temps passé sur l'intégration.

- **La mise en place de la CI/CD :** le projet etant genrer pas google ia studio est avec un plan gratuit de firebase nous n'avons pas pue mettre en place ce que nous voulions, il nous manque un utilisateur de service a creer sur firebase ce qui n'est pas possible avec notre plan gratuit et google ia studios

**3. Ce que nous ferions différemment**

Nous aurions du mieux cadrer nos technologies notamment le choix de notre base de données. En effet des changements on engendré des retards et le choix de Firebase dans un premier temps nous aurait fait gagné du temps.

Dans la même optique nous n'aurions pas du commencer le développement de l'application avant d'avoir bien cadrer l'environnement car la refonte d'une application à cause d'un changement de technologie est toujours complexe.