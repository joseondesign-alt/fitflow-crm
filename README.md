# FitFlow CRM — Démonstration interactive

Application Next.js et React pour présenter un service freelance de CRM fitness connecté.

## Démarrer

Double-cliquez sur `START.bat`.

Le script ouvre l’application dans votre navigateur à `http://127.0.0.1:3100`.

Gardez ouverte la fenêtre `FitFlow CRM Server`. Elle exécute le serveur local.

## Fonctions de démonstration

- Navigation entre les six modules CRM.
- Création de contacts et d’évènements.
- Changement de statut dans le parcours client.
- Exécution et pause des automatisations.
- Création et validation de programmes personnalisés.
- Saisie de lignes financières avec bénéfice brut recalculé.
- Persistance des actions dans le navigateur avec `localStorage`.
- Réinitialisation de toutes les données de démonstration.

## Activer la base Convex

Le projet contient déjà le schéma et les fonctions Convex dans `convex/`. Sans variable d’environnement, l’interface reste en mode démo local (utile pour présenter le portfolio). Pour activer la synchronisation temps réel :

1. Créez un déploiement sur [Convex](https://dashboard.convex.dev) puis lancez `npx convex dev` dans ce dossier.
2. Copiez l’URL `https://…convex.cloud` dans `NEXT_PUBLIC_CONVEX_URL` (voir `.env.example`).
3. Redémarrez Next.js. Le badge « Convex synchronisé » confirme que les actions sont persistées dans la base.

`CONVEX_DEPLOY_KEY` sert uniquement à la CLI ou au déploiement Netlify. Il ne doit jamais être placé dans une variable `NEXT_PUBLIC_*` ni envoyé au navigateur. Les écritures de démonstration sont regroupées dans le snapshot `fitflow-demo`, tandis que le schéma expose aussi les tables contacts, événements, automatisations, programmes, séances et finance pour faire évoluer l’intégration vers des requêtes métier dédiées.
