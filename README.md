# NextGame 🏀

Find pickup basketball games near you. Check in to courts, see who's playing, 
and request new courts in your area.

## What it does

- **Map view** — see basketball courts near your location
- **Check in** — let others know you're at a court
- **Player list** — see who's currently at each court
- **Court requests** — submit new courts for admin approval
- **Profiles** — track your check-in history

## Tech stack

**Backend** — FastAPI, SQLAlchemy, SQLite (dev) / PostgreSQL (prod)  
**Frontend** — React, Vite, Tailwind CSS, Mapbox GL

## Running locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:
```
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///./NEXTGAME.db
```

```bash
uvicorn main:app --reload
```

Seed the database with courts:
```bash
python seeds/seed.py
```

API runs at `http://localhost:8000`  
Docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

App runs at `http://localhost:5173`

## Deployment

- **Frontend** — Vercel (connect GitHub repo, set env variables in dashboard)
- **Backend** — Railway (connect GitHub repo, add PostgreSQL plugin, set env variables)

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `SECRET_KEY` | backend | JWT signing key — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | backend | PostgreSQL connection string (Railway provides this) |
| `VITE_MAPBOX_TOKEN` | frontend | Mapbox public token (starts with `pk.`) |
| `VITE_API_URL` | frontend | Backend URL |
