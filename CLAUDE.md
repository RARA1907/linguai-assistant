claude

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Kaptan Profile

- **Role:** Solo developer, full-stack learning journey
- **Focus:** MVP-driven development, rapid prototyping
- **Tech Level:** Intermediate (learning advanced patterns)
- **Priority:** Speed + Quality balance, ekonomik çözümler
- **Style:** Direct communication, no unnecessary explanations

## Workspace Overview

This is a multi-project AI development workspace managed under the **MAYK v2.0** system protocol. Communication is in **Turkish** with English technical terms. Always address the user as **"Kaptan"** (never "rara").

**Working directories:**

- Primary: `/Users/rara_macbook/raraprojects_mayk`
- Cloud sync: `/Users/rara_macbook/Library/CloudStorage/GoogleDrive-rara@raraprojects.com/Drive'ım/raraprojects_mayk`

## Build & Development Commands

### Next.js Projects (tfr-web, dersdeo_web)

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm start        # Production server
```

## Project Structure

```
00_aktif_proje/              # Active projects (main work area)
├── _PROJE_SABLONU/          # Project template - copy for new projects
├── _ANTIGRAVITY_META/       # Agent configs, workspace mappings
├── _rara_playground/        # Experimentation area
│
│ # AI & Tech Products
├── dersdeo_proje/           # AI exam prep engine (Next.js + FastAPI + Vertex AI)
├── tfr_app/                 # Football fact-check backend (n8n + Gemini + pgvector)
├── web_deneme/tfr-web/      # TFR web frontend (Next.js 16, React 19, Tailwind 4)
│
│ # Client & Side Projects
├── arsadrone/               # Drone services website
├── motofest/                # Motorcycle festival platform
├── marco-asensio/           # Football player website
├── esbau_eray_germany/      # German education services
├── fatih-serdaroglu-proje/  # Client project

00_ozel_kasa/                # SECURE FOLDER - NEVER transmit externally
01_genel_beyin/              # Knowledge base (kanon, protocols, inventory)
07_otomasyon_ve_db/          # n8n workflows, database configs
```

## Architecture & Tech Stack

**Primary stack:** Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript 5

**AI/Backend:** FastAPI + Vertex AI (Gemini Flash/Pro) + Supabase PostgreSQL + pgvector for RAG

**Automation:** n8n (self-hosted at n8n.raraprojects.com)

**MCP Integrations:** Firecrawl, Bright Data, Apify (5000+ Actors)

**Deployment:** Vercel (web), Hostinger VPS (self-hosted services)

## Workflow Protocol (MAYK v2.0)

### Before Starting Any Task

1. Read the project's `Docs/PRD.md` for requirements
2. Check `Docs/Implementation.md` for task progress (checkbox-based)
3. Review `Docs/project_structure.md` for file organization
4. Check `Docs/Decision_log.md` for architectural decisions

### Task Execution

1. Implementation.md → Which task are we on?
2. Bug_tracking.md → Similar error exists?
3. project_structure.md → Where does the file go?
4. UI_UX_doc.md → Design rules?
5. Implement → Test → Mark checkbox → Update status.md

### Document Updates

- `PRD.md` → On requirements change
- `Implementation.md` → After each task completion
- `Bug_tracking.md` → Format: `[HATA-001] Title` with Date, Status, Error, Cause, Solution, Prevention
- `Decision_log.md` → On every important decision
- `status.md` → Daily/session end

## Autonomy & Approvals

**Execute without asking:**

- Terminal commands, file edits, web research, error self-correction

**Require approval:**

- Paid API usage
- External data transmission
- Production deployment
- Critical file deletion

## Frontend Standards

**Stack:** Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript 5

**Typography:**

- Body: Inter font-family
- Headings: Outfit font-family (Dersdeo) / Inter (TFR)

**Colors:**

- Default accent: Yellow `#ffd500`
- Success: Green `#22C55E`
- Error: Red `#EF4444`
- Warning: Amber `#F59E0B`

**Component Architecture:**

```
src/components/
├── ui/           # Atoms (Button, Badge, Input)
├── shared/       # Molecules (Header, Footer, Card)
└── features/     # Organisms (QueryInput, ResultCard)
```

**State Management:**

- Simple: React Context
- Complex: Zustand (recommended)

**Forms:** React Hook Form + Zod validation

**Animations:** Framer Motion (TFR) / GSAP (Dersdeo)

## Backend Standards

**API Options:**

- Python: FastAPI (recommended for AI-heavy)
- Node: Next.js API routes (simple endpoints)

**Database:** Supabase (PostgreSQL + Auth + Realtime)

**AI Models:**
| Use Case | Model | Cost |
|----------|-------|------|
| Quick responses | Gemini 1.5 Flash | $0.075/1M |
| Complex analysis | Gemini 1.5 Pro | $1.25/1M |
| Embeddings | text-embedding-004 | $0.00025/1K |

**File Structure (Backend):**

```
src/backend/
├── app/
│   ├── main.py          # FastAPI entry
│   ├── routers/         # API endpoints
│   ├── services/        # Business logic
│   ├── models/          # Pydantic schemas
│   └── utils/           # Helpers
├── tests/
└── requirements.txt
```

## Key Conventions

- **Naming:** lowercase with underscores (no spaces, no Turkish chars)
- **Git:** Project-based only (no global root git)
- **Accent color:** Yellow (#ffd500) preferred
- **Environment:** Use `.env.local` for secrets (gitignored)
- **Path aliases:** `@/*` maps to project root in TypeScript

## Security

- `00_ozel_kasa/` content must NEVER be transmitted externally
- Never log or share API keys
- Always check `.gitignore` before commits
- Test before production deployment

## Optimization Standards (Ekonomik Mod)

**Her projede bu standartları otomatik uygula - Kaptan'a sormadan:**

### API & Token Optimization

- **Response Caching:** Benzer sorular için Supabase'de cache tablosu kullan
- **Prompt Caching:** System prompt'ları cache'le (Vertex AI, OpenAI destekler)
- **Request Batching:** Mümkünse API çağrılarını grupla
- **Model Selection:** Basit işler için ucuz model (Gemini Flash, Haiku), kompleks için Pro/Opus

### Caching Strategy (Zorunlu)

```
Cache Layer 1: Redis/Memory (hot data, 5-15 dk TTL)
├── User profiles, session data
├── API rate limit counters
└── Frequently accessed metadata

Cache Layer 2: Supabase (warm data, 1-24 saat TTL)
├── AI response cache (question hash → answer)
├── External API results (Google CSE, etc.)
└── Computed/aggregated data

Cache Layer 3: CDN/Static (cold data)
├── Static assets, images
└── Rarely changing content
```

### Database Optimization

- **Indexler:** Sık sorgulanan kolonlara index ekle
- **Connection Pooling:** Supabase için connection pool kullan
- **Query Optimization:** N+1 query'lerden kaçın, batch fetch kullan

### Cost Tracking

- Her projede `/Docs/cost_tracking.md` dosyası oluştur
- API kullanımlarını logla ve analiz et
- Aylık maliyet tahmini yap

### Performance Targets

| Metrik                 | Hedef     |
| ---------------------- | --------- |
| API Response Cache Hit | >60%      |
| Average Latency        | <2 saniye |
| Token Waste            | <%20      |
| Monthly Cost Growth    | <%10      |

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
