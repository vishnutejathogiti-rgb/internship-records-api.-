# Internship Records API

Node.js + Express REST API with SQLite persistence, validation, pagination, search, filters, and CRUD endpoints. Seed records are fictional.

## Requirements
- Node.js 18+
- npm

## Run locally
```bash
npm install
npm run seed
npm start
```
API base URL: `http://localhost:3000`. Database is created at `data/internships.sqlite`.

## Endpoints
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/internships?page=1&limit=10` | List and paginate |
| GET | `/api/internships?domain=Data&mode=Remote&search=python` | Filter and search |
| GET | `/api/internships/:id` | Get one |
| POST | `/api/internships` | Create (201) |
| PUT | `/api/internships/:id` | Replace (all fields required) |
| PATCH | `/api/internships/:id` | Partial update |
| DELETE | `/api/internships/:id` | Delete (204) |

Domains: `Technology`, `Data`, `Design`, `Marketing`, `Business`. Modes: `Remote`, `Hybrid`, `On-site`. Pagination limit maximum is 100.

## Example: create
```bash
curl -X POST http://localhost:3000/api/internships \
  -H "Content-Type: application/json" \
  -d '{"title":"QA Tester Intern","company":"Sample Labs","domain":"Technology","description":"Test web apps and write reproducible bug reports.","location":"Hyderabad","mode":"Hybrid","duration":"3 months","stipend":"₹7,000/mo","skills":["Testing","Communication"]}'
```

## Example: update
```bash
curl -X PATCH http://localhost:3000/api/internships/1 \
  -H "Content-Type: application/json" -d '{"mode":"Hybrid"}'
```

## Example: list
```bash
curl "http://localhost:3000/api/internships?page=1&limit=2"
```

## Response contracts
Success list: `{ "success": true, "data": [], "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0, "hasNextPage": false, "hasPreviousPage": false } }`

Errors use `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Request validation failed.", "details": [] } }`.

Status codes: 200 success, 201 created, 204 deleted, 400 invalid input, 404 missing route/record, 413 body too large, 500 unexpected server error.

## Validation and safety
- Validates required strings, lengths, allowed enum values, and skills array.
- Rejects unknown fields and malformed JSON.
- Uses parameterized SQL statements and limits JSON bodies to 100 KB.
- `schema.sql` documents the database schema; `seed-data.json` contains the same fictional starter records.

## Deploy note
This is a backend API; GitHub Pages cannot execute Express. Use Node.js hosting (for example Render or Railway) for a public API URL. Keep the source, schema, seed records, and README in this repository for one-link submission.
