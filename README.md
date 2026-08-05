<div align="center">

# 🎬 CineVault — IMDb Clone

A full-stack IMDb clone to browse movies & TV series, rate and review them, build watchlists, follow other users, and manage the platform from an admin panel.

**Next.js 16 · Express · Prisma · TypeScript · Tailwind CSS 4**

</div>

---

## ✨ Features

### Discover & Browse
- 🏠 Cinematic homepage — hero with featured backdrop, Trending Now, Top Rated, Trending TV Series, Coming Soon and Recommended sections
- 🔍 Powerful search — genre chips, year filter, sort by popularity/rating/release date, and a dedicated **People** directory tab
- 🎬 Rich detail pages — cinematic blurred backdrop, real posters, YouTube trailers (inline playback), cast & crew with real photos, seasons & episodes, photo gallery, and recommendations

### Engage
- ⭐ 10-point star ratings with per-user persistence
- ✍️ Reviews with title, content, **like / dislike voting** (toggleable), edit & delete, and paginated loading
- 🔖 Watchlist & ❤️ Favorites with one-click toggling and dedicated pages

### Social
- 👤 User profiles with avatars, bios, and filmography-activity
- ➕ Follow / unfollow, followers & following pages
- 🔔 Notifications (marked read on click) and a global **activity feed**
- 🧑🤝🧑 Review and rating history on every profile

### Admin Panel
- 📊 Dashboard with live stats (movies, series, people, users, reviews, ratings)
- 🎞️ Manage content — add & delete movies, series, and people; browse genres
- 👥 User management — promote/demote admins, activate/deactivate, delete users

### Platform
- 🔐 JWT authentication with role-based access (`USER` / `ADMIN`), optional-auth endpoints
- 🛡️ API rate limiting and input validation (zod)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript, Tailwind CSS 4, Heroicons, Framer Motion, Headless UI |
| Backend | Node.js, [Express](https://expressjs.com), [Prisma ORM](https://prisma.io), JWT, bcryptjs, express-rate-limit, multer + sharp, zod |
| Database | SQLite (development) · PostgreSQL (production) |

---

## 📁 Project Structure

```
imdb-clone/
├── backend/            # Express + Prisma REST API (port 4000)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js             # Full seed: content, people, users, reviews…
│   │   └── series-episodes.js  # Real Season 1 episode data
│   └── src/
│       ├── index.js            # App entry + route mounting
│       ├── middleware/auth.js  # JWT auth, roles, optional auth
│       └── routes/             # 20+ REST resource routes
└── frontend/           # Next.js app (port 3000)
    ├── public/
    │   ├── posters/            # Movie & series poster images
    │   ├── people/             # Actor/director photos
    │   └── avatars/            # Generated user avatars
    └── src/
        ├── app/                # App Router pages (movie, series, person, search,
        │                       #  user, admin, auth, notifications, activities…)
        ├── components/         # MediaCard, Navbar, StarRating, FollowButton…
        └── lib/                # API client, auth context
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** and npm
- (Optional but nice) Git, and a code editor

### 1. Backend API

```bash
cd backend
npm install

# Create the database from the Prisma schema (SQLite)
npx prisma db push

# Seed rich demo content (movies, series, episodes, people, users, reviews)
npm run prisma:seed

# Configure environment
cp .env.example .env
#   → set a strong JWT_SECRET

# Start the API (http://localhost:4000)
npm run dev
```

Verify: `curl http://localhost:4000/api/health` → `{ "status": "ok", ... }`

### 2. Frontend

```bash
cd frontend
npm install

cp .env.example .env.local
#   → NEXT_PUBLIC_API_URL=http://localhost:4000/api (default if unset)

npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** 🎉

### Demo Accounts

| Role  | Email                  | Password     |
|-------|------------------------|--------------|
| Admin | `admin@imdbclone.com`  | `admin123`   |
| User  | `john@example.com`     | `password123`|

---

## 🔐 Environment Variables

### `backend/.env`

| Variable          | Description                                        | Default            |
|-------------------|----------------------------------------------------|--------------------|
| `PORT`            | API port                                           | `4000`             |
| `JWT_SECRET`      | Secret used to sign auth tokens (**set a strong one**) | —               |
| `JWT_EXPIRES_IN`  | Token lifetime                                     | `7d`               |
| `UPLOAD_DIR`      | Directory for uploaded media                       | `uploads`          |
| `MAX_FILE_SIZE`   | Max upload size in bytes                           | `10485760` (10 MB) |
| `FRONTEND_URL`    | Allowed CORS origin (your frontend URL)            | `http://localhost:3000` |
| `DATABASE_URL`    | Only needed for **PostgreSQL** in production       | —                  |

### `frontend/.env.local`

| Variable              | Description                       | Default                    |
|-----------------------|-----------------------------------|----------------------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API       | `http://localhost:4000/api` |

---

## 🗄️ Database Notes

- **Development** uses SQLite (`backend/prisma/dev.db`, `provider = "sqlite"`). No external DB needed.
- Run `npx prisma db push` to sync schema changes, or `npm run prisma:seed` to (re)seed everything.
- The seed includes: **13 movies, 5 TV series with full Season 1 episode lists, 77 actors/directors with real photos and bios, demo users, ratings, reviews, follows and notifications**.
- **Production** should use PostgreSQL — see [Deployment](#deployment) below.

---

## 🌐 Deployment

### 1. Push to GitHub

The repo ships with a root `.gitignore` — secrets (`.env`), `node_modules/`, the SQLite DB and build artifacts are already excluded.

```bash
git init
git add .
git commit -m "Initial commit: CineVault IMDb clone"
git branch -M main
git remote add origin https://github.com/<your-username>/imdb-clone.git
git push -u origin main
```

### 2. Deploy the frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and **Import** your GitHub repository
2. In project settings set:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected)
3. Add the environment variable:
   - `NEXT_PUBLIC_API_URL` → `https://<your-api-domain>/api`
4. **Deploy** ✅

### 3. Host the backend API

The Express API needs an always-on Node host (e.g. Railway, Render, or Fly.io) — it is a standalone server, not a Vercel serverless function:

1. Create a new Node service from the `backend/` directory
2. Provision a **PostgreSQL** database and copy its connection string
3. Update `backend/prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. Set environment variables on the host:
   - `DATABASE_URL` → your Postgres connection string
   - `JWT_SECRET` → a strong random secret
   - `FRONTEND_URL` → `https://<your-app>.vercel.app`
5. Run once: `npx prisma db push && npm run prisma:seed`

> **Note:** Run `npx prisma generate` after changing the datasource provider.

### 4. Point them at each other

- Frontend env `NEXT_PUBLIC_API_URL` = `https://<your-api-domain>/api`
- Backend env `FRONTEND_URL` = `https://<your-app>.vercel.app` (CORS allowlist)
- Done 🎉 — your IMDb clone is live!

---

## 📡 API Overview

Base path: `/api`

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Content | `GET/POST /movies`, `GET /movies/:slug`, `GET/POST /series`, `GET /series/:slug`, `GET /people`, `GET /people/:slug`, `GET /genres` |
| Search | `GET /search?q=&type=&genre=&year=&sort=` |
| Engagement | `POST /ratings`, `GET /ratings/status`, `POST /reviews`, `PUT/DELETE /reviews/:id`, `POST /reviews/:id/vote`, `GET/DELETE /watchlist`, `GET/DELETE /favorites` |
| Social | `GET/POST/DELETE /follows`, `GET /notifications`, `POST /notifications/:id/read`, `GET /activities` |
| Admin | `GET /admin/dashboard`, `GET /admin/users`, `PATCH /admin/users/:id`, `GET/POST/DELETE /movies`, `GET/POST/DELETE /series`, `GET/POST/DELETE /people` |
| Misc | `GET /recommendations`, `GET /media`, `GET /categories`, `GET /countries`, `GET /languages`, `GET /companies`, `GET /health` |

Authenticated routes expect `Authorization: Bearer <token>`.

---

## 🧪 Seed Data Highlights

- **13 movies** — Inception, The Dark Knight, Interstellar, Dune I & II, Barbie, Oppenheimer, Parasite, EEAAO, Pulp Fiction, The Batman + 2 original upcoming titles — each with poster, trailer, budget/box office and **correct real-world cast & crew**
- **5 TV series** — Breaking Bad, Stranger Things, The Crown, The Last of Us, Succession — each with real poster, trailer and **full Season 1 episode lists** (titles, synopses, runtimes, air dates, ratings)
- **77 people** — actors & directors with real photos, bios and known-for credits
- **Demo community** — 5 users, ratings, reviews (with like counts), watchlists, favorites, follows, notifications & activities

---

## 📄 License

This project is for educational/demo purposes. Movie posters and people photos are used for demonstration; all content belongs to its respective owners.
