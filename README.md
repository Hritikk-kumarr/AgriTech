# 🌾 AgriTech

> **Transparent fertilizer distribution, powered by trust.**
> Farmers book stock with OTP-verified pickup, the public sees live retailer stock in real time, and a blockchain-backed audit trail keeps everyone honest.

![Made with React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| 🌍 | **Public Portal** | Anyone can check live fertilizer stock at nearby retailers — no login needed |
| 🧑‍🌾 | **Farmer Portal / Dashboard** | Aadhaar-based booking flow, with OTP verification at pickup |
| 🏪 | **Retailer Dashboard** | Manage stock levels, declare season-end leftovers |
| 🛡️ | **Admin Dashboard** | Review and resolve fraud flags raised by the system |
| ⛓️ | **Blockchain Audit Page** | Tamper-evident ledger of every stock/transaction event |
| 📊 | **Trust Gauge** | Visual retailer reliability/trust score |
| 📦 | **Stock Bar** | Live visual stock indicator |
| 🔐 | **OTP Modal** | Reusable popup for OTP verification at pickup |
| 🔑 | **Role-based Auth** | JWT login for Farmer / Retailer / Admin roles (`AuthContext`) |

---

## 🛠️ Tech Stack

- ⚛️ **Frontend:** React (Vite)
- 🟢 **Backend:** Node.js
- 🗄️ **Database:** SQLite (`backend/database.sqlite`)
- ⛓️ **Audit layer:** `blockchainService.js` — tamper-evident ledger logic

---

## 📁 Project Structure

```
AgriTech/
├── backend/
│   ├── blockchainService.js   ⛓️ Blockchain-style audit trail logic
│   ├── database.sqlite        🗄️ Local SQLite database
│   ├── db.js                  🔌 DB connection/query helpers
│   ├── index.js                🚀 Server entry point
│   ├── seed.js                  🌱 Seeds dummy/mock data
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

---

## 🚀 Getting Started

### 1️⃣ Backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
node index.js
```

> ⚠️ Keep this terminal open — the backend needs to stay running.

The SQLite database (`database.sqlite`) is used automatically. If dummy/seed data is needed, run:

```bash
node seed.js
```

### 2️⃣ Frontend

Open a **new** terminal (don't close the backend one!) and run:

```bash
cd frontend
npm install
npm run dev
```

### 3️⃣ Open the App 🎉

Head to the local URL shown in the frontend terminal — usually:

```
http://localhost:5173
```

---

## 📝 Notes

- 🔐 OTP is simulated/dummy for demo purposes (no real SMS gateway) unless configured otherwise.
- ⚙️ If the backend needs environment variables (JWT secret, port, etc.), create a `.env` file inside `backend/` — check `db.js` / `index.js` for exact variable names.
- ⛓️ The "blockchain" layer is a simulated tamper-evident audit trail for demo purposes, not a real distributed network, unless `blockchainService.js` says otherwise.

---

<p align="center">Built with 💚 for transparent, fraud-free fertilizer distribution</p>
