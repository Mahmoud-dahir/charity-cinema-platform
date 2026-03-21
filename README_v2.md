# Projet transversal (MIF10) — Groupe 15

Application web de gestion d'évènements caritatifs autour du cinéma (type Meetup).

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

---

## Intégration SonarQube (Lyon 1)

L'analyse de qualité du code est automatiquement déclenchée à chaque `git push` via le pipeline GitLab CI/CD.

### Configuration

**`sonar-project.properties`** (à la racine du repo) :

```properties
sonar.projectKey=mif10-projet-transversal-de-master-informatique-2025-2026-g15_mif10-projet-transversal-de-master-informatique-2025-2026-g15_AZ0QifQypItf3KCWeGyX
sonar.qualitygate.wait=true
```

**Variables GitLab CI/CD** (`Settings → CI/CD → Variables`) :

| Variable | Description |
|---|---|
| `SONAR_TOKEN` | Token généré sur SonarQube |
| `SONAR_HOST_URL` | `https://sonar.info.univ-lyon1.fr` |

**Pipeline `.gitlab-ci.yml`** — deux stages :

```yaml
stages:
  - sonarqube-check
  - sonarqube-vulnerability-report
```

- **`sonarqube-check`** : lance le scanner SonarQube (`sonarsource/sonar-scanner-cli:5.0`)
- **`sonarqube-vulnerability-report`** : exporte les vulnérabilités SAST vers GitLab Security

### Utilisation quotidienne

Chaque membre de l'équipe déclenche l'analyse en poussant simplement son code :

```bash
git push origin main
```

Ensuite, vérifier :

1. **GitLab → CI/CD → Pipelines** → job `sonarqube-check` doit être **VERT** 
2. **Dashboard SonarQube** → [https://sonar.info.univ-lyon1.fr](https://sonar.info.univ-lyon1.fr) → projet G15 MIF10

---

## Notes

- `frontend/node_modules/` et les artefacts `.next/` sont ignorés par Git.
- La base SQLite de dev `backend/db.sqlite3` est ignorée par Git.