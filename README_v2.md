# Projet transversal (MIF10) — Groupe 15

Application web de gestion d’évènements caritatifs autour du cinéma (type Meetup).

## Structure du repo

- `backend/` : API Django + Django REST Framework
- `frontend/` : application Next.js
- `docs/` : documentation

## Prérequis

- Python via `pyenv` avec un environnement `transversal-venv`
- Node.js 20 via `nvm`

## Démarrage rapide (backend)

Depuis la racine du repo :

```bash
cd backend

# Utiliser le python du venv pyenv
PYTHON="$(pyenv prefix transversal-venv)/bin/python"

$PYTHON -m pip install -r requirements.txt
$PYTHON manage.py migrate
$PYTHON manage.py runserver
```

API healthcheck : `GET http://127.0.0.1:8000/api/health/`

## Démarrage rapide (frontend)

```bash
cd frontend

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

nvm use 20
npm install
npm run dev
```

Frontend : `http://localhost:3000`

## Notes

- `frontend/node_modules/` et les artefacts `.next/` sont ignorés par Git.
- La base SQLite de dev `backend/db.sqlite3` est ignorée par Git.
