# FindMyAI

A full-stack AI Finder website.

## Tech Stack

- **Backend:** Node.js, Fastify, TypeScript, Prisma, PostgreSQL
- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Monorepo:** npm workspaces

## Prerequisites

- Node.js (v18+)
- npm (v9+)
- PostgreSQL

## Setup

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Environment Variables:**

    Create a `.env` file in `backend/` based on your configuration:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/findmyai?schema=public"
    ```

3.  **Database Migration:**

    ```bash
    npm run migrate --workspace=backend
    ```

## Development

Start both backend and frontend in development mode:

```bash
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

## Build

Build both workspaces:

```bash
npm run build
```
