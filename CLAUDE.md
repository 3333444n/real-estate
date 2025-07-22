# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `node export-properties.js` | Export Notion data to JSON files for testing |

## Project Architecture

This is an Astro-based real estate property showcase application with integrated 360° virtual tours. The application follows a component-based architecture with TypeScript support.

### Key Components Structure

**Main Pages:**
- `src/pages/index.astro` - Main property listing page with sections for hero, amenities, gallery, virtual tour, and contact
- `src/pages/tour.astro` - Standalone 360° virtual tour page using Pannellum.js

**Core Layout:**
- `src/layouts/Layout.astro` - Base layout with Navbar and Footer, includes global CSS imports

**Component Organization:**
- `src/components/` - Reusable UI components for different sections
  - `HeroSection.astro` - Property hero with pricing and details
  - `Gallery.astro` - Property image gallery
  - `Tour.astro` - Virtual tour embed component
  - `CardsSection.astro` - Generic card grid layout
  - `Map.astro` - Location map integration
  - `Navbar.astro` - Navigation with smooth scrolling to sections

### Data Management

- `src/data/mockup.json` - Central data source for all property information
- `src/data/types.ts` - TypeScript interfaces for data structures
- Data includes: property details, pricing, developer info, virtual tour configuration, amenities, and contact information

### Virtual Tour Implementation

The virtual tour uses Pannellum.js library with custom configuration:
- Scene-based navigation with hotspots
- Thumbnail strip for scene switching
- Mobile gyroscope support with orientation-based toggling
- Iframe embed detection for removing navbar when embedded

### Styling

- **TailwindCSS v4** with Vite integration
- Custom font: "Mori" font family with multiple weights (extralight, regular, semibold)
- Smooth scrolling behavior enabled globally
- Responsive design with mobile-first approach

### Notion Integration

The application integrates with Notion as a headless CMS using four databases:

- **Properties Database** (main) - Contains all property information
- **Amenities Database** - Property amenities linked via relation
- **Nearby Locations Database** - Points of interest linked via relation
- **Virtual Tour Scenes Database** - 360° tour scenes with hotspot JSON data

**Key Files:**
- `src/lib/notion.ts` - Notion client setup and helper functions
- `src/lib/notionData.ts` - Data fetching, transformation, and caching with automatic image downloads
- `src/lib/imageDownloader.ts` - Handles downloading Notion images to local storage
- `src/pages/api/export-properties.ts` - API endpoint for data export

**Testing Notion Data:**
To verify and inspect Notion integration:

1. Start development server: `npm run dev`
2. Run export script: `node export-properties.js`
3. Check exported files in `notion-exports/` directory

The export script creates:
- Individual JSON files for each property (`{slug}.json`)
- Summary file with data quality analysis (`summary.json`)
- Downloaded images in `public/images/notion/` directory
- Console output showing missing fields and data issues

**Data Flow:**
1. `[slug].astro` calls `getAllProperties()` during `getStaticPaths()`
2. `notionData.ts` fetches from Notion databases and transforms data
3. `imageDownloader.ts` downloads all Notion images to local storage during build
4. Relation data (amenities, nearby locations, virtual tour scenes) fetched with page titles
5. Build cache prevents redundant API calls
6. Fallback data ensures site works if Notion is unavailable

### Key Technical Notes

- Uses Astro's island architecture for performance
- TypeScript strict mode enabled
- Virtual tour scenes are dynamically loaded from JSON data
- Navbar hides when tour page is embedded in iframe
- All images optimized with WebP format in `public/images/`
- **Notion images automatically downloaded** to `public/images/notion/` during build
- **Smart relation title detection** - automatically finds and extracts page titles from related databases
- Properties generated at build time with static paths
- Notion API calls are cached during build process
- **Maps Link supports iframe embeds** - fetches full Google Maps embed codes from Notion