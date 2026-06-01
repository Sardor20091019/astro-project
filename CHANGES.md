# AstroSpectrum — Improvement Changelog

## New Features

### 1. Photo Categories
Photos can now be tagged with one of these categories:
- 🔭 Astrophotography
- 🌿 Nature  
- ☁️ Sky
- 🌙 Moon
- 🌅 Warm
- 🏙️ Street
- ◈ Abstract
- ◉ Other

### 2. Category Filter Bar
Both the **main gallery** (`/`) and the **explore grid** (`/explore`) now have a scrollable filter bar at the top. Clicking a category filters the grid instantly. The active filter shows a count badge. There's a "Clear filter" button when a filter is active.

### 3. Pagination — Show More (20 per page)
Both grids now show **20 images at a time**. A "Show more frames" button at the bottom loads the next 20. A count indicator shows how many are hidden.

### 4. Admin Improvements
- **AdminUploadForm**: Added category dropdown, improved layout with labeled fields, success state instead of alert(), loading spinner, drag-to-preview zone.
- **AdminPhotoList**: Added search bar (title/location), category filter dropdown, inline title editing (click ✏️ icon), bulk select + bulk delete, category badges on photos.
- **Admin page**: Cleaner two-column layout (sidebar + main), card-based sections with status indicators, user info in header.

### 5. Overall Feel
- Refined color palette (deeper blacks, tighter opacity steps)
- Subtle film-grain overlay on the entire page
- Smoother image hover animations
- Better grid density (4 columns on large screens in explore)
- Navigation arrows in the photo modal (prev/next)
- Close button on modal
- Frame counter in modal

## Database Migration
Run this SQL against your PostgreSQL database before deploying:

```sql
DO $$ BEGIN
  CREATE TYPE "PhotoCategory" AS ENUM (
    'ASTROPHOTOGRAPHY', 'NATURE', 'SKY', 'MOON', 'WARM', 'STREET', 'ABSTRACT', 'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Photo" ADD COLUMN IF NOT EXISTS "category" "PhotoCategory" NOT NULL DEFAULT 'OTHER';
```

Or use Prisma migrate:
```bash
npx prisma migrate dev --name add_category
```

## Files Changed
- `prisma/schema.prisma` — added `PhotoCategory` enum and `category` field on `Photo`
- `data/photos.ts` — added category assignments + exported `CATEGORIES` config
- `components/PhotoGrid.tsx` — category tabs, pagination, prev/next navigation
- `components/GallerySection.tsx` — NEW: client component for homepage gallery with filtering
- `components/AdminUploadForm.tsx` — category field, better UX, success state
- `components/AdminPhotoList.tsx` — search, bulk delete, inline edit, category filter
- `app/admin/page.tsx` — improved layout
- `app/page.tsx` — delegates to GallerySection
- `app/api/photos/[id]/route.ts` — added PATCH handler for title/category updates
- `app/api/photos/route.ts` — saves `category` field on upload
- `app/globals.css` — grain overlay, smoother animations, scrollbar-none utility
