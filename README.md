# Blog

A blogging platform built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and
PostgreSQL in production. Local development uses SQLite.

## Product preview

![A quick tour of the Blog home feed, a published story, and its comments](./public/demo.gif)

### Home feed

![Blog home page showing the story feed and search](./public/screenshots/home.png)

### Reading experience

![Published story page with Markdown content and reader actions](./public/screenshots/story.png)

## Prerequisites

- Node.js 18 or later
- npm

## Getting started

Copy `.env.example` to `.env`, then install dependencies and start the development
server:

```bash
npm ci
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command                | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run dev`          | Start the development server                                           |
| `npm run build`        | Create a production build                                              |
| `npm run vercel-build` | Generate the PostgreSQL client, apply migrations, and build for Vercel |
| `npm run start`        | Start the production server                                            |
| `npm run lint`         | Run ESLint                                                             |
| `npm test`             | Run utility unit tests                                                 |
| `npm run test:e2e`     | Run the Playwright flow tests                                          |

## Tech stack

- Next.js 14 with the App Router
- TypeScript
- Tailwind CSS
- Prisma (SQLite locally, PostgreSQL in production)
- NextAuth, Zod, React Markdown, and Framer Motion

## Project structure

Application routes and global styles are in `src/app/`. Shared components are in
`src/components/`, and Prisma schemas and migrations are in `prisma/`.

## Vercel deployment

Import the repository into Vercel and configure these variables for each
environment:

| Variable               | Value                                                          |
| ---------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL pooled connection string for application queries    |
| `DIRECT_URL`           | Direct, non-pooled PostgreSQL connection string for migrations |
| `NEXTAUTH_SECRET`      | A unique, securely generated secret                            |
| `NEXTAUTH_URL`         | The canonical deployed site URL, including `https://`          |
| `NEXT_PUBLIC_SITE_URL` | The same canonical site URL, used for SEO metadata             |

`vercel.json` selects the `vercel-build` command. It generates Prisma Client from
the PostgreSQL schema, applies the PostgreSQL migrations, and builds the Next.js
application. Use a separate database for Preview deployments so preview
migrations cannot modify production data.

The SQLite schema and database remain the default for local development. The
PostgreSQL production schema and its independent migration history live in
`prisma/postgresql/`.

## Development

Run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build` before
submitting changes. Run `npm run test:e2e` for the register, login, and publish
flow.

GitHub Actions runs formatting, lint, unit tests, Prisma validation, production
builds, and Playwright end-to-end tests on pushes to `main`.
