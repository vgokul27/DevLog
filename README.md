# DevLog - Developer Learning Journal & Project Tracker

A full-stack application for developers to document their learning journey, track projects, and organize resources.

## Tech Stack

- **Next.js 15** - App Router with Server Components
- **TypeScript** - Strict mode with proper type definitions
- **Tailwind CSS** - Utility-first styling with custom design system
- **Prisma** - Type-safe ORM with SQLite database
- **Zod** - Runtime validation for API requests and forms
- **React Query** - Server state management
- **Recharts** - Data visualization for dashboard
- **React Hook Form** - Form handling with validation
- **Radix UI** - Accessible component primitives

## Features

### 1. Learning Log
- Create, edit, and delete log entries with title, date, markdown notes, and tags
- Chronological feed with card previews showing date and tag chips
- Full detail view for each entry
- Tag-based organization

### 2. Project Tracker
- Manage projects with name, description, tech stack, and status
- Status workflow: Idea → Building → Shipped → Paused
- Link log entries to projects
- Optional live URL and repository links
- Visual status badges with distinct colors

### 3. Resource Bookmarker
- Save external links with title, URL, category, and notes
- Categories: Article, Video, Docs, Course, Other
- Filter by category and tag
- Mark as read/unread and favorite
- Attach resources to log entries or projects

### 4. Dashboard
- Total counts: entries logged, projects tracked, resources saved
- Streak indicator for consecutive days with log entries
- Activity chart showing entries per week (last 8 weeks)
- Top 5 most-used tags visualization

## Getting Started

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Setup Database

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data (optional)
npx prisma db seed
\`\`\`

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
src/
├── app/
│   ├── page.tsx              # Landing page (redirects to /log)
│   ├── layout.tsx            # Root layout with providers
│   ├── dashboard/            # Stats dashboard
│   ├── log/                  # Learning log pages
│   ├── projects/             # Project tracker pages
│   ├── resources/            # Resource bookmarker
│   └── api/                  # API routes (CRUD operations)
├── components/
│   ├── entries/              # Entry-related components
│   ├── projects/             # Project-related components
│   ├── resources/            # Resource-related components
│   ├── dashboard/            # Dashboard components
│   └── ui/                   # Reusable UI primitives
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   ├── validations.ts        # Zod schemas
│   └── utils.ts              # Helper functions
├── types/
│   └── index.ts              # Shared TypeScript types
└── prisma/
    ├── schema.prisma         # Database schema
    ├── seed.ts               # Seed script
    └── migrations/           # Migration history
\`\`\`

## API Routes

All data is persisted through Next.js API routes following RESTful conventions:

- **Entries**: \`/api/entries\`, \`/api/entries/[id]\`
- **Projects**: \`/api/projects\`, \`/api/projects/[id]\`
- **Resources**: \`/api/resources\`, \`/api/resources/[id]\`

Each route supports full CRUD operations (GET, POST, PUT, DELETE) with Zod validation.

## Database Schema

### Entry (Learning Log)
- id, title, body (markdown), date, tags (string array), createdAt, updatedAt
- Relations: linked to projects and resources

### Project
- id, name, description, techStack (array), status (enum), liveUrl, repoUrl, createdAt, updatedAt
- Relations: has many entries and resources

### Resource
- id, title, url, category (enum), notes, isFavorite, isRead, tags, createdAt, updatedAt
- Relations: can be linked to entries or projects

## Production Considerations

### Database Migration
Currently using SQLite for local development. To use PostgreSQL in production:

1. Update \`prisma/schema.prisma\`:
\`\`\`prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
\`\`\`

2. Set \`DATABASE_URL\` environment variable to your PostgreSQL connection string
3. Run \`npx prisma migrate deploy\` for production migrations

### Environment Variables
\`\`\`env
DATABASE_URL="file:./dev.db"  # SQLite for dev
# DATABASE_URL="postgresql://..."  # PostgreSQL for prod
\`\`\`

## Design Decisions

### Why Prisma over Drizzle?
Prisma provides excellent TypeScript support, automatic migrations, and a robust client generation system. The declarative schema is easier to maintain and understand for this use case.

### Why React Query?
React Query eliminates manual useEffect data fetching, provides built-in caching, automatic refetching, and optimistic updates. This significantly simplifies server state management.

### Why Recharts?
Recharts offers a simple, composable API for building charts with React. It's well-documented and provides all the visualization needs for the dashboard without excessive complexity.

## Development Notes

- All components use proper TypeScript types - no \`any\` types
- API routes validate request bodies with Zod schemas
- Forms use React Hook Form with Zod resolvers for validation
- Loading states and empty states are implemented throughout
- Responsive design for mobile, tablet, and desktop
- Toast notifications for all create/update/delete actions

## License

MIT
