

## Replace MixxCoin Images with New Uploaded Assets

The uploaded images are high-quality 3D renders of the MixxCoinz — earned (purple/cyan waveform), purchased (gold crown), and dual (both together). These should replace the current placeholder coin images across the entire platform.

### Changes

**1. Copy uploaded images to `public/assets/economy/`** (overwrite existing)

| Upload | Destination | Usage |
|--------|-------------|-------|
| `IMG_0548.PNG` (purple waveform coin) | `public/assets/economy/coin-earned.png` | Earned MixxCoin everywhere |
| `IMG_0549.PNG` (gold crown coin) | `public/assets/economy/coin-purchased.png` | Purchased MixxCoin everywhere |
| `IMG_0550.PNG` (dual coins together) | `public/assets/economy/coin-hero-dual.png` | Hero/showcase displays |

No code changes needed for the `MixxCoin` component — it already references these exact paths via `LOCAL_ASSETS`. Every component using `<MixxCoin>` (economy pages, CoinScene3D fallback, wallet displays, pricing callouts) will automatically pick up the new images.

**2. Update ProofScene to use coin images instead of icons for the MixxCoinz feature card**

In `src/components/promo/scenes/ProofScene.tsx`, also copy the dual coin image to `src/assets/promo/` and import it as the thumbnail for the "MixxCoinz Economy" feature card (replacing the Coins lucide icon with the actual coin-hero-dual image). The other three feature cards keep their Lucide icons since they don't have dedicated artwork yet.

### Files
1. Copy 3 uploaded images to `public/assets/economy/` (overwrite)
2. Copy dual coin to `src/assets/promo/mixxcoinz-hero.png` for ProofScene import
3. `src/components/promo/scenes/ProofScene.tsx` — swap MixxCoinz card icon for the real coin image thumbnail

