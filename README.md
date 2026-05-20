# EVE — Personal Operating System

A premium, minimal personal operating system for discipline, evolution, and focused living.

## Modules

| Module | Description |
|--------|-------------|
| **Command Center** | Dynamic greeting, clock, daily progress, streaks, motivational quotes, Bible verses |
| **Habits** | Daily/weekly habits, streaks, consistency tracking, XP & levels |
| **Focus** | Pomodoro timer, custom durations, fullscreen mode, session history |
| **Reading** | Book tracking, page progress, notes, excerpts, library |
| **Studies** | Customizable study areas & subjects, session logging, GitHub-style heatmap |
| **Workout** | Full workout logbook — sets, reps, weight, RPE, performance tracking |
| **Devotional** | Bible verses, reflections, gratitude, prayer journal |
| **Goals** | Short/medium/long term goals, subtasks, progress tracking |
| **Journal** | Quick capture, notes, tags, search, pinned entries |

## Tech Stack

- **React 19** + **Next.js 16** (App Router)
- **Tailwind CSS v4** (new `@theme inline` syntax)
- **Framer Motion** (animations)
- **Zustand** (state management with localStorage persistence)
- **Lucide React** (icons)
- **date-fns** (date utilities)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to GitHub Pages

1. Build the static export:
```bash
npm run build
```

2. The `out/` directory contains the static site. Deploy it to GitHub Pages:
   - Go to your repo's Settings > Pages
   - Set source to "Deploy from a branch"
   - Select the `gh-pages` branch or use GitHub Actions

### GitHub Actions (recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Design system & theme
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main app shell
├── components/
│   ├── Sidebar.tsx       # Navigation sidebar
│   └── ui/               # Reusable UI components
│       ├── Button.tsx
│       ├── GlassCard.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Progress.tsx
│       └── ProgressRing.tsx
├── data/
│   └── verses.ts         # Bible verses & quotes
├── lib/
│   └── utils.ts          # Utility functions
├── modules/
│   ├── home/             # Command Center
│   ├── habits/           # Habit tracking
│   ├── focus/            # Focus timer
│   ├── reading/          # Book tracking
│   ├── studies/          # Study logging
│   ├── workout/          # Workout logbook
│   ├── devotional/       # Spiritual journal
│   ├── goals/            # Goal management
│   └── journal/          # Notes & journal
└── store/
    └── index.ts          # Zustand store (localStorage)
```

## Design Philosophy

- **Dark mode** with deep blacks and subtle blue undertones
- **Glassmorphism** with backdrop blur and subtle borders
- **Gold accents** for premium feel
- **Minimalist** — every element earns its place
- **Fluid animations** — smooth, never distracting
- **Single-user** — designed for personal depth, not multi-user breadth

## Future Roadmap

- Supabase/Firebase sync
- AI integration
- Google Calendar sync
- Gmail integration
- Cloud backup
- Custom themes
- Widget system
- Mobile PWA
