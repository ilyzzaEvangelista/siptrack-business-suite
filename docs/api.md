# SipTrack API overview

Base URL: `http://localhost:8000/api`

## Auth

| Method | Path | Auth |
|--------|------|------|
| POST | `/login` | Public |
| POST | `/register` | Public |
| POST | `/logout` | Sanctum |
| GET | `/user` or `/me` | Sanctum |

## Resources

| Area | Endpoints |
|------|-----------|
| Dashboard | `GET /dashboard` |
| Sales | `GET/POST /sales`, `GET /sales/{id}` |
| Inventory | `GET/POST /inventory`, `PUT /inventory/{id}`, `POST /inventory/{id}/adjust` |
| Expenses | CRUD `/expenses` |
| Reports | `GET /reports?period=daily\|weekly\|monthly\|yearly` |
| Analytics | `GET /analytics` |
| Flavors / Sizes | CRUD-lite `/flavors`, `/sizes` |
| Purchase orders | `/purchase-orders`, `POST .../receive` |
| Settings | `GET/PUT /settings` |
| Users | `GET/POST/PUT /users` (owner/admin) |

## Roles

`owner` · `admin` · `cashier`
