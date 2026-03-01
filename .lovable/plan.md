

# Integrate Prime AI into Mastering Results (Talk Through Your Master)

## The Gap

`GlobalPrimeChat` floats on `/go` but has no knowledge of the mastering session. It sends generic page context (`{ currentPage: "/go" }`) to `prime-chat`. There is no mastering-aware Prime experience in the results phase.

## What This Adds

After mastering completes, a **Prime insight card** appears in the results phase with:
1. A one-line AI-generated mastering summary seeded with the actual analysis data (genre, LUFS before/after, improvement tags)
2. A "Talk to Prime about this master" button that opens an inline chat pre-loaded with mastering context
3. Prime can answer questions like "Why did you boost the highs?" or "How would this sound on Spotify?" because the conversation includes the full mastering metadata

## Architecture

### No new edge function needed
The existing `prime-chat` edge function already accepts a `context` object and appends it to the system prompt. We just need to send richer context from TryItScene.

### File 1: `src/components/promo/MasteringPrimeChat.tsx` (New, ~120 lines)

A self-contained inline chat component for the mastering results phase:

- Props: `genre`, `originalLUFS`, `masteredLUFS`, `improvements` (the analysis data)
- On mount, auto-generates a one-line mastering insight by calling `prime-chat` with a short prompt seeded with the analysis (e.g., "Give a one-sentence summary of mastering a trap beat from -22 LUFS to -14 LUFS with 808 punch enhanced, hi-hat clarity")
- Renders Prime's avatar + insight as a compact card
- "Ask Prime" button expands an inline chat (same pattern as GlobalPrimeChat but embedded, not floating)
- All messages sent to `prime-chat` include mastering context:
  ```json
  {
    "currentPage": "/go",
    "masteringSession": {
      "genre": "trap",
      "originalLUFS": -22.3,
      "masteredLUFS": -14.0,
      "improvements": ["808 punch enhanced", "Hi-hat clarity"],
      "engine": "Velvet Curve"
    }
  }
  ```
- Uses non-streaming `supabase.functions.invoke` for the initial insight (simpler), streaming for follow-up chat messages
- Handles rate limit (429) and credit (402) errors with toast fallbacks

### File 2: `src/components/promo/scenes/TryItScene.tsx` (Modify, ~5 lines)

- Import `MasteringPrimeChat`
- Add it to the results phase, between the waveform comparison and the audio players
- Pass `genre`, `analysis.originalLUFS`, `analysis.masteredLUFS`, `analysis.improvements`

## Visual Layout (Results Phase, top to bottom)

```text
LUFS Before -> After
Waveform Comparison (Before / After)
+-----------------------------------------+
|  [Prime avatar]  "Your trap beat jumped  |
|  +8.3 dB — 808s hit harder, highs cut   |
|  through. Streaming-ready."             |
|                                          |
|  [ Ask Prime about this master ]         |
+-----------------------------------------+
   (expands into inline chat on tap)
Original Player
Mastered Player
Improvement Tags
CTA Button
```

## Technical Notes

- The initial insight uses a focused prompt to keep the response short (1-2 sentences max via system instruction)
- Chat messages include full conversation history + mastering context for continuity
- Component is lazy — no AI call until the results phase renders
- GlobalPrimeChat remains unchanged (still available as fallback on other pages)
- Mobile-safe: the inline chat uses the same max-width constraints as the parent card

## File Summary

| Action | File | Change |
|--------|------|--------|
| Create | `src/components/promo/MasteringPrimeChat.tsx` | Inline Prime chat with mastering context |
| Modify | `src/components/promo/scenes/TryItScene.tsx` | Add MasteringPrimeChat to results phase |

