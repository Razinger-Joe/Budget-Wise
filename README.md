# 💰 Budget-Wise — Smart Personal Finance & Wealth Platform

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://budget-wise-ycii.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **Live Application**: [https://budget-wise-ycii.vercel.app/](https://budget-wise-ycii.vercel.app/)

**Budget-Wise** is a modern, full-stack personal finance application built to automate wealth creation using the **50/15/15/20 Allocation Strategy**, interactive vault locking rules, **AI Financial Insights** powered by Anthropic, and gamified **Legacy Score** metrics tailored for KSH currency.

---

## 🌟 Key Features

### 🏦 1. 50/15/15/20 Automated Income Engine
Every income entry is automatically calculated and split into four dedicated wealth buckets:
- 🔵 **Basic Needs (50%)**: Rent, Groceries, Utilities, Transport
- 🟣 **Emergency Vault (15%)**: Locked safety-net savings for financial resilience
- 🟡 **Personal Savings (15%)**: Flexible funds for leisure, dining, and hobbies
- 🔷 **Investment Fund (20%)**: Wealth-building assets, stocks, and growth ventures

### 📊 2. Recharts Analytics & Trends
- **Income vs Expense Bar Chart**: Visual comparison across monthly trends.
- **Category Spending Pie Chart**: Breakdown of expenses across Rent, Food, Utilities, Transport, and Entertainment.

### 🤖 3. AI Financial Advisor (Anthropic Claude Integration)
- Analyzes real-time user financial context (monthly income, spending velocity, emergency coverage months, savings rate).
- Generates contextual, non-technical advice and warnings in JSON format with actionable suggestions.

### 🛡️ 4. Vault Locking & Savings Automation Rules
- **Emergency Vault Locking**: Prevents accidental withdraws from emergency funds with warning alerts.
- **Automated Rules**: Configurable savings rules (Round-up transactions, Percentage income boosts, Fixed monthly top-ups).

### 🏆 5. Legacy Score Gamification
- Gamified financial health score (0–100) calculated using savings rate, emergency fund coverage, and budget discipline.

---

## 🛠️ Technology Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 16 (App Router + Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React Icons, Shadcn UI / Base UI
- **Charts**: Recharts (`BarChart`, `PieChart`, `ResponsiveContainer`)
- **HTTP Client**: Axios with JWT Interceptors & Auto-refresh

### Backend (`/legacy-backend`)
- **Framework**: FastAPI (Async Python)
- **Database**: PostgreSQL (via `asyncpg` & SQLAlchemy 2.0 Async Session)
- **Migrations**: Alembic
- **Security**: OAuth2 Password Flow, JWT Tokens (`python-jose`), Password Hashing (`passlib`/`bcrypt`)
- **AI Service**: Anthropic SDK (`AsyncAnthropic`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v20+` & `npm`
- Python `3.11+`
- PostgreSQL Database (or SQLite for local testing)

---

### 1. Backend Setup

```bash
# Navigate to backend folder
cd legacy-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (create .env file)
cp .env.example .env

# Run Alembic DB migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

*Backend API docs available at `http://localhost:8000/docs`.*

---

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

*Frontend web app available at `http://localhost:3000`.*

---

## 📂 Project Directory Structure

```text
Budget-Wise/
├── frontend/                     # Next.js 16 React Web Application
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── (dashboard)/      # Dashboard, Income, Expenses, Vaults, Analytics
│   │   │   ├── login/            # Sign in page
│   │   │   └── register/         # Sign up page
│   │   ├── components/           # UI & Dashboard layout components
│   │   └── lib/                  # Axios API client & utility functions
│   ├── package.json
│   └── tsconfig.json
├── legacy-backend/               # Python FastAPI REST API Backend
│   ├── app/
│   │   ├── api/v1/               # Auth, Income, Expense, Bucket, Analytics, Insight routers
│   │   ├── core/                 # Database, Security, Logging
│   │   ├── models/               # SQLAlchemy ORM Models
│   │   ├── repositories/         # Database persistence layers
│   │   ├── schemas/              # Pydantic v2 validation schemas
│   │   └── services/             # Business logic & AI advisor service
│   ├── tests/                    # Pytest test suite
│   ├── requirements.txt
│   └── alembic.ini
└── README.md
```

---

## 🌐 Live Deployment & Inspection Report

### 🔗 Live URL: [https://budget-wise-ycii.vercel.app/](https://budget-wise-ycii.vercel.app/)

### 📝 Deployment Inspection & Recommendations

1. **Next.js App Router vs Root Static Landing**:
   - The live deployment at `https://budget-wise-ycii.vercel.app/` serves the initial static dashboard prototype.
   - **Recommendation**: In Vercel Project Settings → **General**, set **Root Directory** to `frontend` so Vercel builds and serves the modern Next.js 16 App Router application (`/dashboard`, `/expenses`, `/income`, `/vaults`, `/analytics`).

2. **Environment Variable Configuration**:
   - In Vercel Project Settings → **Environment Variables**, set `NEXT_PUBLIC_API_URL` to point to your live FastAPI backend endpoint (e.g. `https://your-backend.onrender.com/api/v1`).

3. **Production Backend Hosting**:
   - Host the `legacy-backend` on **Render**, **Railway**, or **Fly.io** with a free managed PostgreSQL instance.
   - Set `ALLOWED_ORIGINS` in `legacy-backend/.env` to include `https://budget-wise-ycii.vercel.app`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
