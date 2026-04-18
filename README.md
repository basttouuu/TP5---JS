# TP5 - Todo App

## Objectif
Application Todo avec:
- Frontend pour afficher et manipuler les taches
- Backend Express avec API REST
- Persistance des taches dans `backend/data/data.json`

## Structure
- `backend/`
	- `app.js`
	- `router/todo.js`
	- `controller/tasks.js`
	- `data/data.json`
- `frontend/`
	- `index.html`
	- `templates/gestion.html`
	- `templates/recherche.html`
	- `script.js`
	- `assets/css/styles.css`

## Installation
Depuis le dossier `backend`:

```bash
npm install
```

ou

```bash
npm i
```

## Lancement

```bash
npm start
```
Ou dans le cas où vous avez installé `nodemon` et que vous voulez le lancer en mode développement affin de bénéficier de l'actualisation automatique:

```bash
npm run dev
```

Application disponible sur:
`http://localhost:8000/index.html`

## API REST
- `GET /todo` : lire toutes les taches
- `GET /todo/:id` : lire une tache
- `POST /todo` : creer une tache
- `PUT /todo/:id` : modifier une tache
- `DELETE /todo/:id` : supprimer une tache
- `GET /todo/search?q=mot` : rechercher des taches

## Gestion d'erreurs
- Backend: reponses avec `res.status(...)` et message JSON (`400`, `404`, `500`)
- Frontend: affichage des erreurs utilisateur sur les pages
