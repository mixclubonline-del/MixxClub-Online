
# Audit & Replace All `/choose-path` References with `/how-it-works`

## Scope

9 files contain `/choose-path` references. All navigation links pointing to `/choose-path` will be updated to `/how-it-works`. The route constant itself will be updated, and stale entries will be cleaned up.

## Changes by File

### 1. `src/config/routes.ts` (line 36)
Update the route constant value:
```
CHOOSE_PATH: '/choose-path'  -->  CHOOSE_PATH: '/how-it-works'
```
This ensures any future code using `ROUTES.CHOOSE_PATH` points to the correct destination.

### 2. `src/components/home/HomeOverlayNav.tsx` (line 72)
Change the "Get Started" button link:
```
<Link to="/choose-path">  -->  <Link to="/how-it-works">
```

### 3. `src/components/home/HomeHeroSection.tsx` (line 134)
Change the hero CTA link:
```
<Link to="/choose-path">  -->  <Link to="/how-it-works">
```

### 4. `src/components/layout/PublicPageLayout.tsx` (line 81)
Change the "Get Started" button link:
```
<Link to="/choose-path">  -->  <Link to="/how-it-works">
```

### 5. `src/components/layouts/PublicFooter.tsx` (lines 15, 159)
- Line 15: Update footer nav item path from `/choose-path` to `/how-it-works`
- Line 159: Update "Get Started" link from `/choose-path` to `/how-it-works`

### 6. `src/components/navigation/BackButton.tsx` (lines 32-36)
Update the parent route fallback map:
- `/for-artists`, `/for-engineers`, `/for-producers`, `/for-fans` all point to `/how-it-works` instead of `/choose-path`
- Remove the `/choose-path` entry (no longer a valid route)

### 7. `src/config/immersiveRoutes.ts` (line 11)
Update the immersive route entry:
```
'/choose-path'  -->  '/how-it-works'
```

### 8. `src/pages/Sitemap.tsx` (line 21)
Update the sitemap URL entry:
```
{ url: '/choose-path', ... }  -->  { url: '/how-it-works', ... }
```

### 9. `src/pages/MixClubHome.tsx` (line 17)
Update the comment only (no functional change):
```
Navigation begins at Choose Your Path (/choose-path)
-->
Navigation begins at How It Works (/how-it-works)
```

## Summary
- **8 functional changes** across navigation links, route constants, fallback maps, sitemap, and immersive route config
- **1 comment update** for accuracy
- Zero new files, zero new dependencies
