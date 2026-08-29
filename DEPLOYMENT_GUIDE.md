# Deployment Notes

The frontend builds as a Vite static site. The FastAPI backend must be deployed separately before the complete demo works online.

## Before deploying

```powershell
python scratch\test_pipeline.py
npm run build
```

Both commands must pass. Test the local four-minute flow in [PROTOTYPE_GUIDE.md](PROTOTYPE_GUIDE.md) before promoting a deployment.

## Frontend

The repository root `package.json` delegates its build to `frontend`. For Vercel, either:

- import the repository root and use `npm run build` with `frontend/dist` as output, or
- set the project root to `frontend` and use `npm run build` with `dist` as output.

Set:

```text
VITE_API_URL=https://your-backend.example/api
```

Do not deploy without this variable unless the demo will deliberately use the labelled local preview dataset.

## Backend

Use Python 3.10+ and run from the `backend` directory:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8008
```

The current database is SQLite and is suitable only for the hackathon demonstration. A typical ephemeral host may reset it during redeploys. PostgreSQL/Supabase migration remains roadmap work.

## Release checklist

- Backend `/` and `/docs` load over HTTPS.
- `VITE_API_URL` ends in `/api` and points to that backend.
- Faculty demo evaluation returns a saved submission ID.
- Student retry persists an updated RAS after refresh.
- A second device can load the hosted frontend.
- A local copy and a short screen recording are available as fallbacks.
