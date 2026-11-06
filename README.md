# Blog

A blogging platform built with Next.js, TypeScript, Tailwind CSS, Prisma, and
MongoDB.

## Product preview

![A quick tour of the Blog home feed, a published story, and its comments](./public/demo.gif)

### Home feed

![Blog home page showing the story feed and search](./public/screenshots/home.png)

### Reading experience

![Published story page with Markdown content and reader actions](./public/screenshots/story.png)

## Prerequisites

- Node.js 18 or later
- npm
- MongoDB instance or replica set (e.g. MongoDB Atlas or local mongod)

## Getting started

Copy `.env.example` to `.env`, configure your MongoDB `DATABASE_URL`, then install dependencies and push the database schema:

```bash
npm ci
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Start the development server               |
| `npm run build`    | Create a production build                  |
| `npm run start`    | Start the production server                |
| `npm run lint`     | Run ESLint                                 |
| `npm test`         | Run utility unit tests                     |
| `npm run db:push`  | Push Prisma schema to MongoDB              |
| `npm run db:seed`  | Seed the database with initial sample data |
| `npm run test:e2e` | Run the Playwright flow tests              |

## Tech stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Prisma with MongoDB
- NextAuth, Zod, React Markdown, and Framer Motion

## Development

Run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build` before
submitting changes. Run `npm run test:e2e` for the register, login, and publish
flow.
