# DevOrigin Standards Recommender

A Smart India Hackathon prototype that maps plain-language procurement requirements to illustrative Indian Standards, certification flags, and an audit trail. On Netlify, the backend runs as a serverless function, stores the audit trail in Netlify Database, and calls Gemini through Netlify AI Gateway.

## Requirements

- Node.js 20.19 or newer and npm
- MongoDB and a Google Gemini API key are needed only for the legacy local Express workflow
- Netlify automatically provisions the deployed database and AI Gateway credentials

## Setup

From the repository root in a VS Code PowerShell terminal:

```powershell
npm run install:all
Copy-Item .env.example server/.env
```

Edit `server/.env` with your MongoDB URI and Gemini key. Seed the illustrative standards catalog, then run the client and API together:

```powershell
npm run seed
npm run dev
```

Open the Vite address shown in the terminal (normally `http://localhost:5173`). Vite forwards `/api` requests to the Express server on port 5000.

## Environment variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `GEMINI_API_KEY` | For recommendations | — | Server-only Google Gemini key; never sent to the browser |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Gemini model name |
| `PORT` | No | `5000` | Express API port |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Allowed browser origin for CORS |

If the Gemini key is missing, the API stays available for health, standards, and query reads; recommendation requests return a clear `503` error.

## Netlify deployment

The deployed `/api/*` routes are served by `netlify/functions/api.mts`. Netlify Database applies the checked-in migrations automatically and provides isolated database branches for deploy previews. Gemini recommendations use Netlify AI Gateway with the supported `gemini-3.6-flash` model by default, so provider credentials are not exposed to the browser.

## Scripts

Run these at the repository root:

- `npm run install:all` — install root, client, and server dependencies.
- `npm run dev` — start Express and Vite together.
- `npm run seed` — idempotently upsert the standards catalog by standard number.
- `npm run build` — typecheck/build the client and syntax-check the server.
- `npm start` — start the API server.

You can also run `npm --prefix client run dev` or `npm --prefix server run dev` separately.

## Folder structure

```text
client/
  src/
    api/                 fetch-based API functions and response types
    components/          SearchForm, ResultCard, RecentQueries, UI components
    pages/               recommendation and history pages
server/
  src/
    config/              MongoDB connection
    models/              Mongoose Standard and QueryLog models
    routes/              health, recommend, queries, and standards routes
    seed/                illustrative catalog and idempotent seed command
    services/            server-only Gemini integration
_delete/                 preserved legacy files for manual review
```

## API endpoints

- `GET /api/health` — returns `{ "status": "ok" }`.
- `GET /api/standards` — returns standards with number, title, category, test methods, allied codes, certification requirements, edition, and status.
- `GET /api/standards/summary` — returns `{ "total": 18, "current": 18, "categories": [{ "category": "steel", "count": 6 }] }`.
- `GET /api/queries` — returns the latest 50 query logs, newest first.
- `POST /api/recommend` — accepts `{ "inputText": "steel rods for building construction" }` and returns `{ "matchedStandards": ["IS 1786"], "standards": [{ "standardNumber": "IS 1786", "title": "...", "testMethods": [], "alliedCodes": [], "certificationRequired": [] }], "confidenceScore": 0.8, "reasoning": "...", "certificationFlags": ["ISI Mark"], "needsReview": false, "queryId": "...", "createdAt": "..." }`.

Recommendation requests are limited to 10 per minute per client. Gemini output is restricted to catalog entries and checked against MongoDB before a result is saved.

The requested `gemini-2.0-flash` default has been replaced because Google shut that model down on June 1, 2026; `gemini-3.6-flash` is Google's listed replacement. You can choose another currently available model with `GEMINI_MODEL`.

## Data note

The seeded catalog is illustrative demo data carried over from the prototype. It is not scraped from BIS and must not be treated as an authoritative or current standards register. Verify applicable standards and editions with official sources before using them in procurement documents.
