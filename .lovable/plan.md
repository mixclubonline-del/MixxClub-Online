

## Admin Site Editor — Feasibility & Plan

### What You Already Have
Your admin panel can already manage **branding** (colors, logo, name), **feature flags**, **content moderation** (audio/beats), **brand assets** (images for districts/sections), and **platform config** (launch mode, settings). These are effectively CMS-lite capabilities.

### What "Edit the Actual Site" Could Mean

There are several levels of site editing from the admin panel, ranging from practical to ambitious:

#### Level 1: Page Content CMS (Recommended Starting Point)
Allow admins to edit text, images, and layout of key pages (homepage hero, about section, district descriptions, community plaza copy) without touching code.

- Create a `page_content` table storing editable blocks (key, title, body, image_url, section, page)
- Build a WYSIWYG or structured-form editor in the admin panel
- Frontend components read from this table instead of hardcoded strings
- **Effort**: Medium — requires migrating static text to database-driven content

#### Level 2: Navigation & Menu Editor
Admin control over nav items, menu ordering, and link visibility.

- Store nav structure in `platform_config` or a dedicated `nav_items` table
- Admin UI to reorder, add, hide menu items
- **Effort**: Low-medium

#### Level 3: Landing Page Builder
Drag-and-drop block-based page builder (hero, features grid, testimonials, CTA sections).

- Predefined block types with configurable props stored as JSON
- Admin assembles pages from blocks
- **Effort**: High — essentially building a mini website builder

#### Level 4: Full Visual Editor
Live preview editing similar to Webflow/Squarespace — this would be extremely complex and is not recommended for an in-app solution.

### Recommended Plan: Level 1 + Level 2

**Step 1 — Database: `page_content` table**
- Columns: `id`, `page_slug`, `section_key`, `content_type` (text/image/rich_text), `content`, `metadata` (JSON), `updated_by`, `updated_at`
- RLS: public read, admin-only write

**Step 2 — Admin Content Editor page**
- List all editable sections grouped by page
- Inline editing with rich text (bold/italic/links) for text blocks
- Image upload via storage for image blocks
- Live preview link to see changes

**Step 3 — Frontend `usePageContent` hook**
- Fetches content by page slug + section key
- Falls back to hardcoded defaults if no DB entry exists
- Cached with react-query (stale time ~5 min)

**Step 4 — Migrate key sections**
- Homepage hero title, subtitle, CTA text
- District descriptions and images
- Community Plaza copy
- Footer links and text

### Technical Details
- New migration: `page_content` table with RLS policies using existing `has_role` function
- New hook: `src/hooks/usePageContent.ts`
- New admin component: `src/components/admin/AdminPageEditor.tsx`
- Integrate into existing admin CRM panel navigation
- ~4-5 files modified, ~3 new files

