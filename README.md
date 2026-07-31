# AgriTech

A fertilizer allocation transparency & fraud-prevention platform — farmers book stock with OTP-verified
pickup, the public can check live retailer stock, and an admin dashboard tracks flagged discrepancies
with a blockchain-backed audit trail.

## Features

- **Public Portal** — anyone can check live fertilizer stock at nearby retailers, no login required.
- **Farmer Portal / Dashboard** — Aadhaar-based booking flow with OTP verification at pickup.
- **Retailer Dashboard** — manage stock, declare season-end leftovers.
- **Admin Dashboard** — view and manage fraud flags raised by the system.
- **Blockchain Audit Page** — immutable audit trail of stock/transaction events for tamper-evident record-keeping.
- **Trust Gauge** — visual indicator of a retailer's reliability/trust score.
- **Stock Bar** — visual live-stock indicator component.
- **OTP Modal** — reusable OTP verification popup used during pickup confirmation.
- **Role-based Auth** — JWT-based login with Farmer / Retailer / Admin roles (via `AuthContext`).

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js
- **Database:** SQLite (local file: `backend/database.sqlite`)
- **Blockchain layer:** `blockchainService.js` — handles audit-trail/ledger logic

## Project Structure

```
AgriTech/
├── backend/
│   ├── blockchainService.js   Blockchain-style audit trail logic
│   ├── database.sqlite        Local SQLite database file (auto-created/used)
│   ├── db.js                  Database connection/query helpers
│   ├── index.js                Server entry point
│   ├── seed.js                 Seeds dummy/mock data into the database
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── BlockchainBadge.jsx
    │   │   ├── Header.jsx
    │   │   ├── OTPModal.jsx
    │   │   ├── StockBar.jsx
    │   │   └── TrustGauge.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── BlockchainAuditPage.jsx
    │   │   ├── FarmerDashboard.jsx
    │   │   ├── FarmerPortal.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── PublicPortal.jsx
    │   │   └── RetailerDashboard.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Setup & Running Locally

### 1. Backend

Open a terminal in the project root folder and run:

```bash
cd backend
npm install
node index.js
```

Keep this terminal running — the backend server stays active here. The SQLite database file
(`database.sqlite`) is used automatically; if it needs seed/dummy data, run `node seed.js` once
before or after starting the server (check with the team member who built `seed.js` for exact usage).

### 2. Frontend

Open a **new** terminal (keep the backend terminal running) and run:

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the app

Open the local URL shown in the frontend terminal — typically:

```
http://localhost:5173
```

## Notes

- OTP is expected to be simulated/dummy for demo purposes (no real SMS gateway) unless configured otherwise.
- If the backend needs environment variables (e.g. a JWT secret, port number), create a `.env` file
  inside `backend/` — check `db.js` / `index.js` for which variables they expect.
- The blockchain layer here is a simulated audit-trail mechanism for demo/tamper-evidence purposes,
  not a real distributed blockchain network, unless `blockchainService.js` says otherwise.

---
*This README was generated from the project's folder structure and the provided run instructions.
If any section doesn't match the actual code (e.g. required env variables, exact seed command), let
me know and I'll correct it.*
