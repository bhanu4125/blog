# Blog — Stories Worth Sharing

A blogging platform built with Next.js, TypeScript, Tailwind CSS, Prisma, and
MongoDB.

---

## 📸 Product Preview

![A quick tour of the Blog home feed, a published story, and its comments](./public/demo.gif)

### Home Feed & Discovery

![Blog home page showing the story feed and search](./public/screenshots/home.png)

### Reading & Discussion Experience

![Published story page with Markdown content and reader actions](./public/screenshots/story.png)

---

## ✨ Features

- **3-Column Medium-style Layout:** Left navigation sidebar, center infinite-scroll feed with category tabs, and right-hand discovery panel with trending tags.
- **Rich Markdown Workspace:** Live split-pane writing environment with syntax highlighting (`rehype-highlight`), GFM support (`remark-gfm`), word counting, and local draft autosave.
- **Nested Comments & Discussions:** Multi-level comment and reply threads with optimistic UI updates.
- **Engagement System:** One-click story liking with floating particle animations and a personal reading list (bookmarks).
- **Instant Search:** Debounced full-text search across story titles, excerpts, content, tags, and authors with case-insensitive matching.
- **Reading Comfort:** Estimated read time calculations, top navigation progress bar, and system-aware dark/light theme switching.
- **Author Profiles & Story Dashboard:** Dedicated author pages, story draft/publish state management, and profile customization.
- **Robust Security & Data Integrity:** Bcrypt password hashing, session-based JWT authentication via NextAuth.js, and Zod runtime schema validation.

---

## 🛠️ Tech Stack

| Category           | Technology                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers)                    |
| **Language**       | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode)                                         |
| **Styling**        | [Tailwind CSS 3](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)          |
| **Database & ORM** | [MongoDB](https://www.mongodb.com/) via [Prisma 6](https://www.prisma.io/)                            |
| **Authentication** | [NextAuth.js 4](https://next-auth.js.org/) (Credentials Provider, JWT Strategy)                       |
| **Validation**     | [Zod 3](https://zod.dev/)                                                                             |
| **Markdown**       | [React Markdown](https://github.com/remarkjs/react-markdown), `rehype-highlight`, `remark-gfm`        |
| **Testing**        | [Vitest](https://vitest.dev/) (Unit/Integration) & [Playwright](https://playwright.dev/) (End-to-End) |
| **Code Quality**   | ESLint, Prettier, Husky, lint-staged                                                                  |

---

## 📁 Project Structure

```text
├── prisma/
│   ├── schema.prisma       # Prisma schema configured for MongoDB
│   └── seed.ts             # Database seeding script for sample authors and stories
├── public/
│   ├── demo.gif            # Product demo recording
│   └── screenshots/        # Application UI screenshots
├── src/
│   ├── app/                # Next.js App Router (pages and API endpoints)
│   │   ├── api/            # REST API endpoints (posts, comments, likes, search, profile)
│   │   ├── authors/[id]/   # Author profile and stories view
│   │   ├── bookmarks/      # Saved reading list page
│   │   ├── dashboard/      # Writer's workspace & story management
│   │   ├── posts/[slug]/   # Individual story reading experience
│   │   ├── tags/           # Tag exploration & tag detail pages
│   │   ├── write/          # Markdown story creator and editor
│   │   └── page.tsx        # Homepage feed & discovery
│   ├── components/         # Reusable React components
│   │   ├── animation/      # Framer Motion transitions & scroll reveal
│   │   ├── comments/       # Comment list, forms, and nested replies
│   │   ├── editor/         # Markdown workspace, toolbar, and preview
│   │   ├── home/           # FeedSidebar, DiscoverySidebar, and HeroSection
│   │   ├── layout/         # Navbar, Footer, and Theme providers
│   │   ├── posts/          # Post cards, feeds, like & bookmark buttons
│   │   └── ui/             # Core accessible UI primitives
│   ├── lib/                # Shared utilities, validations, and database client
│   │   ├── validations/    # Zod validation schemas (auth, post, comment, profile)
│   │   ├── auth.ts         # NextAuth configuration
│   │   └── prisma.ts       # Singleton PrismaClient instance
│   └── types/              # TypeScript declarations and NextAuth augmentations
└── tests/                  # End-to-end tests
    └── e2e/                # Playwright flow specifications and global setup
```

---

## 📋 Prerequisites

Before running the project locally, ensure you have:

- Node.js 18 or later
- npm
- MongoDB instance or replica set (e.g. MongoDB Atlas or local mongod)

---

Copy `.env.example` to `.env`, configure your MongoDB `DATABASE_URL`, then install dependencies and push the database schema:

```bash
git clone https://github.com/bhanu4125/blog.git
cd blog
npm ci
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

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

---

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Prisma with MongoDB
- NextAuth, Zod, React Markdown, and Framer Motion

## Development

Run `npm run format:check`, `npm run lint`, `npm test`, and `npm run build` before
submitting changes. Run `npm run test:e2e` for the register, login, and publish
flow.
