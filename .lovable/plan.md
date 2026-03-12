

## Add Background Audio to `/go` Promo Funnel

The move: auto-load **mixxclub_go.mp3** into the Universal Media Player when users land on `/go`, so the funnel has a cinematic soundtrack playing as they swipe through scenes.

### Changes

1. **Copy `mixxclub_go.mp3`** to `public/audio/mixxclub_go.mp3`

2. **`src/pages/PromoFunnel.tsx`** — Use `useGlobalPlayer` to call `play()` on mount with the funnel soundtrack:
   - Track title: something like "Mixxclub" / artist: "The Sound"
   - Auto-play on land, low-key — the audio sets the mood while scenes scroll
   - Only trigger if nothing is already playing (don't interrupt)

3. **Remove the dev-only test track auto-load** from `GlobalPlayerContext.tsx` (the `import.meta.env.DEV` block) — this funnel track replaces it as the real use case.

### What stays the same
- All 6 scene components, navigation, swipe, tracking
- Player UI, ticker, cookie banner offset logic

