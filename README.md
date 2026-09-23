# omni-calculator

A small React + Vite calculator app.

## Local development

```bash
npm install
npm run dev
```

The dev server listens on http://localhost:5173.

## Alloy sessions

```bash
docker compose -f docker-compose.alloy.yaml up
```

Alloy reads `.alloy/environment.json`, which points at `docker-compose.alloy.yaml`
and declares `frontendPort: 5173`.
