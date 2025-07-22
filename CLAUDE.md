# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `node export-properties.js` | Export Notion data to JSON files for testing |
| `node check-virtual-tours.js` | Check which properties have virtual tours and hotspot data |

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
  - `HeroSection.astro` - Property hero with dynamic hero image, pricing and details
  - `Gallery.astro` - Property image gallery
  - `Tour.astro` - Virtual tour embed component
  - `CardsSection.astro` - Generic card grid layout
  - `Map.astro` - Location map integration
  - `Navbar.astro` - Navigation with smooth scrolling to sections

### Data Management

- `src/data/mockup.json` - Central data source for all property information
- `src/data/types.ts` - TypeScript interfaces for data structures
- Data includes: property details, pricing, developer info, hero images, virtual tour configuration, amenities, and contact information

### Virtual Tour Implementation

The virtual tour system integrates Notion CMS with Pannellum.js for dynamic 360° experiences:

**Frontend Components:**
- `src/pages/tour.astro` - Standalone 360° virtual tour page using Pannellum.js
- `src/components/Tour.astro` - Virtual tour embed component (iframe wrapper)
- Scene-based navigation with hotspots
- Thumbnail strip for scene switching  
- Mobile gyroscope support with orientation-based toggling
- Iframe embed detection for removing navbar when embedded

**Notion Database Integration:**
- **Virtual Tour Scenes Database** stores individual scenes per property
- Each scene has unique 360° panorama image, title, and scene order
- Hotspots defined as JSON text field supporting multiple navigation points per scene
- Automatic image downloading creates unique filenames: `{property-slug}-tour-{scene-id}-1.webp`

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

**Virtual Tour Scenes Database Structure:**
- **Scene Title** (Title) - Display name for the scene (e.g., "Comedor", "Sala")
- **360-img** (Files) - 360° panorama image for the scene
- **Scene Order** (Number) - Display order for scene navigation
- **Property** (Relation) - Links scene to main property
- **Hotspots** (Text) - JSON array containing navigation hotspots:
  ```json
  [
    {
      "pitch": -2.5,
      "yaw": 135,
      "type": "scene",
      "text": "Ir a la Cocina",
      "sceneId": "cocina"
    }
  ]
  ```

**Recent Updates (2025-01):**
- Removed `country` property (Mexico assumed for all properties)
- Removed `status` property (no longer needed in database)
- Removed `propertyId` field (using Notion's internal UUID as primary identifier)
- Removed `commissionPercentage` property (not used in current database)
- Updated developer media handling: now uses `Developer Logo` and `Developer Image` media properties instead of URL fields
- All developer images are automatically downloaded during build process like gallery images
- **Added hero image support**: Properties now have a `hero-image` field that displays as the main background in HeroSection component
- **Hero image downloading**: Hero images are automatically downloaded to `{property-slug}-hero-1.webp` format
- **Amenities database structure**: Added `amenity` select field to capture amenity types (e.g., "Area de Tendido")
- **Nearby Locations database structure**: Added `category` select field and `distance` text field for better location categorization
- **Image handling improvements**: Each amenity and nearby location now gets uniquely named images to prevent conflicts

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
4. Verify virtual tours: `node check-virtual-tours.js`

The export script creates:
- Individual JSON files for each property (`{slug}.json`)
- Summary file with data quality analysis (`summary.json`) 
- Downloaded images in `public/images/notion/` directory
- Console output showing missing fields and data issues

**Virtual Tour Testing:**
The `check-virtual-tours.js` utility provides:
- List of properties with virtual tour scenes
- Scene details (ID, title, panorama URL, hotspot count)
- Quick overview for debugging tour functionality

**Data Flow:**
1. `[slug].astro` calls `getAllProperties()` during `getStaticPaths()`
2. `notionData.ts` fetches from Notion databases and transforms data
3. `imageDownloader.ts` downloads all Notion images to local storage during build
4. **Hero images** downloaded from `hero-image` field with `{property-slug}-hero-1.webp` naming
5. Relation data (amenities, nearby locations, virtual tour scenes) fetched with page titles
6. **Virtual tour scenes** downloaded with unique filenames per scene
7. **Hotspot JSON parsing** converts text fields to JavaScript objects
8. Build cache prevents redundant API calls
9. Fallback data ensures site works if Notion is unavailable

### Image Handling System

The application automatically downloads and manages images from Notion with unique naming conventions to prevent conflicts:

**Image Types and Naming Patterns:**
- **Gallery Images**: `{property-slug}-gallery-{index}.webp`
- **Hero Images**: `{property-slug}-hero-{index}.webp`  
- **Developer Images**: `{property-slug}-developer-{index}.webp`
- **Amenity Images**: `{property-slug}-amenity-{amenity-slug}-{index}.webp`
- **Nearby Location Images**: `{property-slug}-nearby-{location-slug}-{index}.webp`
- **Virtual Tour Scenes**: `{property-slug}-tour-{scene-slug}-{index}.webp`

**Key Features:**
- **Unique Naming**: Each amenity and nearby location generates a unique slug from its title to ensure separate image files
- **Automatic Downloads**: All images are downloaded during build time to `public/images/notion/`
- **Cache Management**: Nearby locations cache is cleared on each build to fetch new images automatically
- **Fallback Support**: Missing images fall back to `/images/img-placeholder.webp`

**Adding New Images:**
1. Upload images to the appropriate Notion database (Amenities, Nearby Locations, etc.)
2. Run `npm run build` - new images will be automatically downloaded with unique filenames
3. No manual cache clearing required for nearby locations and amenities due to debug cache clearing

**Image Processing Functions:**
- `downloadImages()` - General image downloading with basic naming
- `downloadAmenityImages()` - Downloads amenity images with unique amenity-based naming
- `downloadNearbyImages()` - Downloads nearby location images with unique location-based naming  
- `downloadSceneImages()` - Downloads virtual tour scene images with scene-specific naming

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