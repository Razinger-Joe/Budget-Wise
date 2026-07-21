# Budget-Wise Frontend (Next.js 16)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)](https://budget-wise-ycii.vercel.app/)

Modern Next.js 16 (App Router + Turbopack) frontend application for **Budget-Wise**.

## 🌐 Live URL
[https://budget-wise-ycii.vercel.app/](https://budget-wise-ycii.vercel.app/)

## 🛠️ Features
- **App Router Pages**: `/`, `/login`, `/register`, `/income`, `/expenses`, `/vaults`, `/analytics`
- **Recharts Integration**: Interactive Bar & Pie charts for income/expense trends and category spending
- **Tailwind CSS v4 & Lucide Icons**: Responsive dark mode design with glassmorphism and smooth animations
- **Axios API Client**: Auto-attaches JWT bearer token from `localStorage`

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## ⚙️ Environment Variables

Set `NEXT_PUBLIC_API_URL` in `.env.local` or Vercel settings:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
