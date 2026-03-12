

## Reorder Funnel Scenes — Culture Before TryIt

Swap scenes 4 and 5 so the emotional "For Us, By Us" manifesto builds conviction *before* the interactive demo. Users hear the story, feel it, then hear the difference right before signup. No broken flow.

### New Arc
1. **Hook** — "87% of your music will never leave your hard drive."
2. **Broken System** — Pain points ($1,500, 3-6 weeks, 73%)
3. **The Connection** — Upload → Match → Release
4. **For Us, By Us** — The manifesto (currently CultureScene)
5. **Hear the Difference** — TryIt interactive demo (with inline signup in results)
6. **CTA / Signup** — Final conversion

### Change

**`src/components/promo/PromoFunnelController.tsx`** — One line change:
```typescript
// Before
const SCENES: PromoSceneId[] = ['hook', 'answer', 'proof', 'tryit', 'culture', 'cta'];

// After
const SCENES: PromoSceneId[] = ['hook', 'answer', 'proof', 'culture', 'tryit', 'cta'];
```

That's it. All scene components, assets, and IDs stay the same — just the order flips. The `tryit` pause logic still works because it checks by scene ID, not index.

### Also included
- Rewrite `CultureScene.tsx` as the "For Us, By Us" manifesto (as previously planned)
- Add inline signup to `TryItScene.tsx` results phase (as previously planned)

### Files
1. `src/components/promo/PromoFunnelController.tsx` — swap scene order
2. `src/components/promo/scenes/CultureScene.tsx` — rewrite as manifesto
3. `src/components/promo/scenes/TryItScene.tsx` — add inline signup to results

