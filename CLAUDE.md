# Tools Hub - AI Context

## What is this project?
A centralized dashboard for internal web agency tools. Each tool is a self-contained
module that plugs into the main dashboard via a registry system.

## Architecture
- **Frontend & Backend:** Next.js 16 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Database:** PostgreSQL + Prisma v5
- **Deployment:** Docker (standalone) on Easypanel

## Key Directories
- `core/` - Dashboard core (NEVER modify when adding tools)
- `tools/` - All tool implementations (one folder per tool)
- `app/(dashboard)/` - Route group for the dashboard shell
- `app/(dashboard)/tools/[slug]/` - Route pages for each tool
- `core/registry/tools.registry.ts` - Tool registration file

## How to Add a Tool
See CONTRIBUTING.md for the full guide. Summary:
1. Create `tools/[slug]/` with `manifest.ts`, `index.ts`, `components/`
2. Create `app/(dashboard)/tools/[slug]/page.tsx`
3. Add 2 lines to `core/registry/tools.registry.ts` (import + array entry)

## Rules
- Tool slugs must match in: folder name, manifest.ts slug, and route folder
- Never import between tools (promote shared code to `core/lib/`)
- Prisma models must be prefixed: `[ToolName][ModelName]`
- All tool state stays inside the tool (no global stores)

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npx prisma migrate dev` - Run DB migrations
- `npx prisma generate` - Generate Prisma client
- `docker compose up` - Start local PostgreSQL
