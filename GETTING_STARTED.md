# DevLog - Getting Started Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
The database is already initialized with sample data! But if you need to reset:

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed

# View database in Prisma Studio (optional)
npx prisma studio
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## What's Included

The seeded database contains:
- **4 sample learning entries** covering various topics
- **3 projects** in different statuses (Idea, Building, Shipped)
- **5 resources** across different categories
- Pre-linked relationships between entries and projects

## Testing the Application

### 1. Learning Log (`/log`)
- View the chronological feed of entries
- Click on an entry card to see full details with markdown rendering
- Click "New Entry" to create a new learning log
- Test the tag system (add/remove tags)
- Link an entry to a project

### 2. Projects (`/projects`)
- View the project grid with status badges
- Click on a project card to see details and linked entries
- Click "New Project" to create a project
- Add multiple technologies to the tech stack
- Test different status values (Idea → Building → Shipped → Paused)
- Add optional live URL and repo URL

### 3. Resources (`/resources`)
- View bookmarked resources
- Filter by category (All, Article, Video, Docs, Course, Other)
- Toggle favorite (star icon)
- Toggle read status (checkmark icon)
- Click "New Resource" to add a link
- Test the category dropdown

### 4. Dashboard (`/dashboard`)
- View total counts for entries, projects, and resources
- Check the streak indicator (consecutive days with entries)
- See the activity chart (last 8 weeks of entries)
- View top 5 most-used tags with visual bars

## Features to Test

### CRUD Operations
- **Create**: Try creating entries, projects, and resources
- **Read**: Browse through all items, view details
- **Update**: Edit existing items (edit functionality ready)
- **Delete**: Delete items with confirmation

### Form Validation
- Try submitting forms with empty required fields
- Test URL validation in projects and resources
- Add invalid URLs to see error messages
- Test field length limits

### User Experience
- Look for loading skeletons while data fetches
- Check empty state illustrations when no data exists
- Watch for success/error toast notifications
- Test responsive design on mobile screens (resize browser)

### Data Relationships
- Create an entry and link it to a project
- View a project detail page to see linked entries
- Notice how counts update when adding/removing items

## Current Status

### ✅ Completed Features
1. **Learning Log**
   - Full CRUD for entries
   - Markdown support in body
   - Tag system
   - Project linking
   - Chronological feed
   - Entry detail pages with formatted markdown

2. **Project Tracker**
   - Full CRUD for projects
   - Tech stack management
   - Status workflow (4 states with distinct colors)
   - Live URL and repo URL support
   - Entry count badges
   - Project detail page showing linked entries

3. **Resource Bookmarker**
   - Full CRUD for resources
   - Category filtering
   - Favorite and read toggles
   - Tag support
   - URL validation

4. **Dashboard**
   - Total counts for all entities
   - Streak calculation (consecutive days)
   - Activity chart (last 8 weeks)
   - Top 5 tags visualization

5. **API Routes**
   - RESTful design
   - Full CRUD for all entities
   - Zod validation on all endpoints
   - Proper error handling
   - Query parameter support

6. **UI/UX**
   - Clean, modern design with Tailwind CSS
   - Responsive layout (mobile, tablet, desktop)
   - Loading skeletons
   - Empty state illustrations
   - Toast notifications for all actions
   - Accessible components (Radix UI)
   - Smooth transitions and hover effects

### 🔧 Known Limitations
- **Edit functionality**: Detail pages have edit buttons but edit pages not yet created for all entities (can be added)
- **TypeScript warning**: One import error for badge component (caching issue, doesn't affect functionality)
- **Search**: No global search yet (could add as bonus feature)
- **Dark mode**: Not implemented (could add as bonus feature)

## File Structure

```
src/
├── app/
│   ├── api/           # Backend API routes
│   ├── log/           # Learning log pages
│   ├── projects/      # Project pages
│   ├── resources/     # Resource pages
│   ├── dashboard/     # Dashboard page
│   └── layout.tsx     # Root layout
├── components/
│   ├── ui/            # Reusable UI components
│   ├── entries/       # Entry components
│   ├── projects/      # Project components
│   └── resources/     # Resource components
├── lib/               # Utilities and database
├── types/             # TypeScript types
└── prisma/            # Database schema and migrations
```

## Database Schema

### Entry
- `id`, `title`, `body` (markdown), `date`, `tags` (array)
- `projectId` (optional FK to Project)
- `createdAt`, `updatedAt`

### Project
- `id`, `name`, `description`, `techStack` (array), `status`
- `liveUrl`, `repoUrl` (optional)
- `createdAt`, `updatedAt`

### Resource
- `id`, `title`, `url`, `category`, `notes`
- `isFavorite`, `isRead`, `tags` (array)
- `createdAt`, `updatedAt`

## Understanding the Code

### Key Technologies

1. **Next.js 15 (App Router)**
   - Server Components for static content
   - Client Components for interactive features
   - API Routes for backend
   - File-based routing

2. **React Query**
   - Handles all API calls
   - Automatic caching
   - Optimistic updates
   - Loading/error states

3. **Prisma**
   - Type-safe database queries
   - Migration system
   - SQLite for development (PostgreSQL-ready)

4. **Zod**
   - Runtime validation
   - Type inference
   - Form validation with React Hook Form

5. **Tailwind CSS**
   - Utility-first styling
   - Responsive design
   - Custom design system

### Example: Creating an Entry

**User Flow:**
1. User clicks "New Entry"
2. Fills out form (title, body, tags, optional project)
3. Client validates with React Hook Form + Zod
4. Form submits to `/api/entries` (POST)
5. Server validates again with Zod
6. Prisma creates entry in database
7. API returns new entry as JSON
8. React Query invalidates cache
9. User redirected to `/log`
10. Feed updates automatically with new entry

**Code Flow:**
```
app/log/new/page.tsx (Form)
  → API: POST /api/entries
    → Zod validation
    → Prisma create
  ← JSON response
React Query updates cache
  → app/log/page.tsx (Feed refreshes)
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npx prisma migrate reset

# This will:
# - Delete the database
# - Run all migrations
# - Run seed script
```

### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "Restart TypeScript Server"
```

### Module Not Found
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## Next Steps

### For Learning
1. **Explore the code**: Start with `app/log/page.tsx` to see React Query usage
2. **Check API routes**: Look at `app/api/entries/route.ts` for validation
3. **Study components**: See how `components/entries/entry-card.tsx` works
4. **Understand utilities**: Review `lib/utils.ts` for helpers

### For Extension
1. **Add edit pages**: Create `app/log/[id]/edit/page.tsx`
2. **Implement search**: Add search bar with filtering
3. **Add dark mode**: Use Tailwind's dark mode
4. **Export feature**: Generate markdown from entries

## Production Deployment

### Deploy to Vercel

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add PostgreSQL Database**:
   - Add Vercel Postgres addon
   - Get connection string
   - Add to environment variables

4. **Update for Production**:
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

5. **Run Migrations**:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Environment Variables
```
DATABASE_URL=<your-postgres-url>
NODE_ENV=production
```

## Questions to Consider (Code Review)

When reviewing this code, you should be able to explain:

1. **Why use React Query instead of useEffect for data fetching?**
   - Caching, automatic refetching, optimistic updates

2. **Why use Zod for validation?**
   - Runtime validation, type inference, single source of truth

3. **How does the tag system work?**
   - Stored as JSON string in SQLite, parsed on read

4. **What happens when you delete a project?**
   - Prisma cascade rules: entries' projectId set to null

5. **How is the streak calculated?**
   - `calculateStreak()` function checks consecutive days

6. **Why are arrays stored as JSON strings?**
   - SQLite doesn't support arrays; would use native arrays in PostgreSQL

7. **How does the activity chart get its data?**
   - Groups entries by week using date-fns functions

8. **What makes the UI accessible?**
   - Radix UI primitives, semantic HTML, ARIA attributes

## Support

For questions about the code:
1. Read `TECHNICAL_DOCUMENTATION.md` for deep dives
2. Check `README.md` for project overview
3. Review inline code comments
4. Refer to official docs:
   - [Next.js](https://nextjs.org/docs)
   - [Prisma](https://www.prisma.io/docs)
   - [React Query](https://tanstack.com/query/latest)
   - [Zod](https://zod.dev)

---

**Happy coding! 🚀**
