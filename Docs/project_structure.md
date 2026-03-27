# Project Structure

```
[PROJE_ADI]/
├── CLAUDE.md              # Symlink to root CLAUDE.md
├── status.md              # Daily/session status
│
├── Docs/                  # Documentation
│   ├── PRD.md             # Product requirements
│   ├── Implementation.md  # Task checklist
│   ├── Decision_log.md    # Architectural decisions
│   ├── Bug_tracking.md    # Bug reports
│   ├── UI_UX_doc.md       # Design system
│   ├── project_structure.md # This file
│   └── cost_tracking.md   # API/infrastructure costs
│
├── src/                   # Source code
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   ├── globals.css    # Global styles
│   │   └── [routes]/      # Other routes
│   │
│   ├── components/        # React components
│   │   ├── ui/            # Atoms (Button, Badge, Input)
│   │   ├── shared/        # Molecules (Header, Footer)
│   │   └── features/      # Organisms (feature-specific)
│   │
│   ├── lib/               # Utilities
│   │   ├── api.ts         # API client
│   │   ├── utils.ts       # Helper functions
│   │   └── constants.ts   # App constants
│   │
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   └── styles/            # Additional CSS (optional)
│
├── public/                # Static assets
│   ├── images/
│   └── fonts/
│
├── tests/                 # Test files
│
├── config/                # Configuration
│   └── .env.example       # Environment template
│
├── assets/                # Design files, vectors
│
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── next.config.ts         # Next.js config
├── tailwind.config.ts     # Tailwind config
├── postcss.config.mjs     # PostCSS config
└── .gitignore             # Git ignore rules
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, metadata, fonts |
| `src/app/page.tsx` | Home page component |
| `src/lib/api.ts` | Centralized API calls |
| `src/types/index.ts` | Shared TypeScript types |

## Naming Conventions

- Files: `lowercase_with_underscores.ts`
- Components: `PascalCase.tsx`
- Hooks: `useHookName.ts`
- Types: `PascalCase` (interface/type)

---
**Son Guncelleme:** [TARIH]
