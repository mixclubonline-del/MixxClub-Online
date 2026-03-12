

# Investor Pitch Deck — Implementation Plan

## What We're Building

A fullscreen, presentable investor pitch deck at `/investor-deck` with 12 slides rendered at 1920x1080, scaled to fit any viewport. Keyboard navigation (arrow keys), fullscreen mode, and slide thumbnails. Uses existing financial data from `projectionModels.ts` and Recharts for live charts embedded directly in slides.

## Slide Outline

1. **Title** — Mixxclub logo, tagline "From Bedroom to Billboard", founding year
2. **Problem** — Broken music industry economics ($1,200 avg mix, 3-6 week turnaround, gatekeeping)
3. **Solution** — The Atlanta Model: cyclical, non-extractive ecosystem connecting Artists, Engineers, Producers, Fans
4. **Market Size** — TAM/SAM/SOM with concentric circles visualization
5. **Business Model** — 13 revenue streams grouped by category (core, marketplace, economy, services, growth)
6. **Revenue Projections** — Interactive Recharts area chart pulled from `projectionModels.ts` (moderate scenario)
7. **Unit Economics** — ARPU, LTV, CAC, margins, payback — data from `unitEconomics()`
8. **Traction / Metrics** — Waitlist count, platform features built, streams shipped
9. **Go-to-Market** — Three-Wave Launch Strategy (Engineers → Artists → Producers/Fans)
10. **Competitive Landscape** — Positioning matrix vs SoundBetter, BeatStars, DistroKid, Splice
11. **Team** — Founder(s) + key roles
12. **The Ask** — Funding amount, use of funds breakdown, milestones

## File Structure

```text
src/pages/InvestorDeck.tsx                    ← Page wrapper
src/components/investor/
  ├── DeckShell.tsx                            ← Scaled 1920x1080 container, keyboard nav, slide state
  ├── SlideRenderer.tsx                        ← Renders current slide component
  ├── DeckControls.tsx                         ← Thumbnails strip, fullscreen toggle, slide counter
  └── slides/
      ├── TitleSlide.tsx
      ├── ProblemSlide.tsx
      ├── SolutionSlide.tsx
      ├── MarketSlide.tsx
      ├── BusinessModelSlide.tsx
      ├── RevenueSlide.tsx                     ← Uses Recharts + projectionModels
      ├── UnitEconomicsSlide.tsx               ← Uses unitEconomics()
      ├── TractionSlide.tsx
      ├── GoToMarketSlide.tsx
      ├── CompetitiveSlide.tsx
      ├── TeamSlide.tsx
      └── AskSlide.tsx
```

## Technical Approach

- **Scaling**: Fixed 1920x1080 div, CSS `transform: scale()` based on container size via `ResizeObserver`. Dark background, centered.
- **Navigation**: Arrow keys, click-to-advance, slide counter overlay. `useState` for current slide index.
- **Fullscreen**: Button triggers `document.documentElement.requestFullscreen()`.
- **Charts**: Recharts components rendered inline at 1920x1080 coordinates — no scaling issues since they're inside the scaled container.
- **Data**: Import `projectAll`, `unitEconomics`, `REVENUE_STREAMS` from existing `projectionModels.ts`. No new data models needed.
- **Styling**: Dark glassmorphic theme consistent with platform. Large typography (48-96px headings). Accent colors from brand palette.
- **Route**: Added to `appRoutes.tsx` wrapped in `AdminRoute` at `ROUTES.INVESTOR_DECK` (`/investor-deck`).

## Key Design Decisions

- Admin-only route (sensitive financial data)
- No database needed — all data from static projection models
- Keyboard-first navigation for live presentation use
- Each slide is a standalone component for easy editing

