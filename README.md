# SipTrack Business Suite

Beverage / milk tea ERP for sales, inventory, expenses, reports, and analytics.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS, TanStack Query, Zustand, Recharts, React Hook Form |
| Backend | Laravel 12 API, Laravel Sanctum |
| Database | SQLite (default) or MySQL |

## Project structure

```
siptrack-business-suite/
├── client/          # React app
├── server/          # Laravel API
├── docs/
├── database/
└── README.md
```

## Quick start

### 1. API

```bash
cd server
composer install
cp .env.example .env   # if needed
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

API: http://localhost:8000/api

### 2. Client

```bash
cd client
npm install
npm run dev
```

App: http://localhost:5173

### Demo login

- **Owner:** `owner@siptrack.test` / `password`
- **Cashier:** `cashier@siptrack.test` / `password`

The seeder creates login accounts, flavors, cup sizes, inventory, settings, suppliers, sample expenses, ~2 weeks of sales, and purchase orders.

## Features

- **Dashboard** — today's/monthly sales, profit, expenses, top flavor/size, sales chart
- **Sales** — new sale form with auto revenue / cost / profit; inventory deduction
- **Inventory** — powder, cups, lids, straws, ice, sugar, water, syrups + stock adjust
- **Expenses** — rent, electricity, ice, transport, supplies, misc
- **Reports** — daily / weekly / monthly / yearly P&L
- **Analytics** — revenue, profit, bestsellers, slow movers
- **Purchase orders** — supplier, item, qty, price, status, receive into stock
- **Settings** — business name, tax, flavor/size prices, user roles

## MySQL (optional)

In `server/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=siptrack
DB_USERNAME=root
DB_PASSWORD=
```

Then:

```bash
php artisan migrate:fresh --seed
```

## Future

- QR payments (GCash / Maya)
- Receipt printing
- Barcode scanning
- Multi-branch
- Offline mode
- AI sales forecasting
- Loyalty points
