# Quick Start Guide

## Prerequisites

- Node.js (16+)
- pnpm (recommended) or npm

## Installation

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd technical-assignment
   pnpm install
   ```

2. **Create `.env` file for the API:**
   The `.env` file is required for database configuration. Create it by copying the template:
   ```bash
   # Windows (PowerShell)
   copy apps/api/.env.example apps/api/.env
   
   # Mac/Linux
   cp apps/api/.env.example apps/api/.env
   ```
   
   The file should contain:
   ```
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="dev-secret-key-change-in-production"
   PORT=4000
   ```

3. **Initialize database:**
   ```bash
   # Run migrations to create schema
   pnpm -C apps/api db:migrate

   # Seed with demo data
   pnpm -C apps/api db:seed
   ```

3. **Start development servers:**
   ```bash
   pnpm dev
   ```

   This starts:
   - **API:** http://localhost:4000
   - **Web:** http://localhost:5173

## First Time Using the App

1. Go to http://localhost:5173
2. Click "Login"
3. Use demo credentials:
   - **Email:** demo@example.com
   - **Password:** password123
4. You'll see a pre-populated board with tasks in different columns

## What You Can Do

- **Create a board:** Click "Create New Board" on the list page
- **Create a task:** Click the "+" button at the bottom of any column
- **Move a task:** Drag it between columns
- **View task details:** Click "Open" on any task card
- **Add a comment:** In the task detail modal, type in "Add a comment..." and click submit
- **Delete a task:** Click the "X" button on a task card

## Available Commands

```bash
# Development
pnpm dev              # Start both API and Web servers
pnpm -C apps/api dev  # API only
pnpm -C apps/web dev  # Web only

# Testing
pnpm test             # Run all tests
pnpm -C apps/api test # API tests only

# Code quality
pnpm lint             # Check linting
pnpm typecheck        # Check TypeScript
pnpm build            # Build for production

# Database
pnpm -C apps/api db:migrate  # Run migrations
pnpm -C apps/api db:seed     # Reset and seed demo data
pnpm -C apps/api db:reset    # Reset database completely
```

## Project Structure

```
.
├── apps/
│   ├── api/              # Node.js + Express backend
│   │   ├── src/
│   │   │   ├── index.ts  # Main app
│   │   │   ├── auth.ts   # Auth utilities
│   │   │   ├── db.ts     # Prisma client
│   │   │   └── routes/   # API endpoints
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Seed script
│   │   └── test/         # API tests
│   │
│   └── web/              # React + Vite frontend
│       ├── src/
│       │   ├── main.tsx  # Entry point
│       │   ├── context/  # Auth context
│       │   ├── lib/      # API client
│       │   ├── pages/    # Page components
│       │   ├── components/ # UI components
│       │   └── ui/       # Main App component
│       └── test/         # Frontend tests
│
├── README.md            # This file
├── IMPLEMENTATION.md    # Technical details
└── SETUP.md            # This setup guide
```

## Troubleshooting

### "Environment variable not found: DATABASE_URL" error
This means the `.env` file is missing or not in the right location. Fix it:
```bash
# Make sure you're in the project root, then:
copy apps/api/.env.example apps/api/.env  # Windows
cp apps/api/.env.example apps/api/.env     # Mac/Linux

# Verify the .env file exists
ls apps/api/.env       # Mac/Linux
dir apps/api\.env      # Windows

# Then try migrations again
pnpm -C apps/api db:migrate
```

### "Cannot find module" errors
```bash
pnpm install
```

### Database errors
```bash
# Reset database completely
pnpm -C apps/api db:reset

# Re-seed with demo data
pnpm -C apps/api db:seed
```

### Port already in use
- API uses port 4000 (change with `PORT=5000 pnpm -C apps/api dev`)
- Web uses port 5173 (Vite handles this automatically)

### Authentication issues
- Make sure you're logged in (check localStorage in DevTools)
- Try logging out and back in
- Clear localStorage and refresh: `localStorage.clear()` in DevTools console

## Next Steps

- Read [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
- Check test files for API contract examples
- Explore the component structure in `apps/web/src/components/`

## Support

If you encounter issues:
1. Check the API logs in the terminal running `pnpm dev`
2. Check browser DevTools console for frontend errors
3. Verify the database exists: `ls apps/api/dev.db`
