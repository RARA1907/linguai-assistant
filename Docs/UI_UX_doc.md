# UI/UX Documentation

## Design System

### Colors

```css
/* Primary */
--color-primary: #ffd500;      /* Yellow accent */
--color-primary-hover: #e6c000;

/* Semantic */
--color-success: #22C55E;
--color-error: #EF4444;
--color-warning: #F59E0B;
--color-info: #3B82F6;

/* Neutrals */
--color-background: #FFFFFF;   /* Light mode */
--color-background-dark: #0A0A0A; /* Dark mode */
--color-text: #1F2937;
--color-text-muted: #6B7280;
```

### Typography

```css
/* Font Family */
--font-body: 'Inter', sans-serif;
--font-heading: 'Outfit', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing

```css
/* Tailwind default scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;  /* Pill shape */
```

## Components

### Buttons

| Variant | Usage |
|---------|-------|
| Primary | Ana aksiyonlar |
| Secondary | Ikincil aksiyonlar |
| Ghost | Minimal butonlar |
| Destructive | Silme, iptal |

### Cards

- Border radius: `rounded-2xl`
- Shadow: `shadow-lg`
- Padding: `p-6`

## Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large |

## Animations

- Duration: 200-300ms
- Easing: `ease-out` (default)
- Use Framer Motion or GSAP

---
**Son Guncelleme:** [TARIH]
