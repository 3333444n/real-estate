# Real Estate Property Showcase

A modern real estate website built with Astro featuring dynamic property listings, 360° virtual tours, and Notion CMS integration.

## ✨ Features

- **Dynamic Property Listings**: Properties fetched from Notion databases with fallback support
- **360° Virtual Tours**: Interactive panoramic tours using Pannellum.js with hotspots
- **Responsive Design**: Mobile-first approach with TailwindCSS v4
- **SEO Optimized**: Dynamic meta tags and structured data for each property
- **Notion Integration**: Full CMS capabilities with multiple databases for properties, amenities, and locations
- **Image Gallery**: Optimized WebP images with responsive layouts
- **Interactive Maps**: Location integration with Google Maps
- **Contact Forms**: Built-in contact system for each property

## 🏗️ Project Structure

```text
/
├── public/
│   ├── images/           # Optimized property images (WebP)
│   └── fonts/           # PPMori font family
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── HeroSection.astro
│   │   ├── Gallery.astro
│   │   ├── Tour.astro
│   │   └── ...
│   ├── data/
│   │   ├── types.ts     # TypeScript interfaces
│   │   └── mockup.json  # Fallback data
│   ├── layouts/
│   │   └── Layout.astro # Base layout with navbar/footer
│   ├── lib/
│   │   ├── notion.ts    # Notion client and helpers
│   │   └── notionData.ts # Data fetching and transformation
│   └── pages/
│       ├── index.astro  # Property search/listing page
│       ├── [slug].astro # Dynamic property pages
│       └── api/         # API endpoints
├── notion-exports/      # Exported JSON files from Notion
└── export-properties.js # Property export utility
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Notion account with integration token

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd real-estate
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   # Notion Integration Token
   NOTION_TOKEN=your_notion_integration_token
   
   # Notion Database IDs
   NOTION_PROPERTIES_DB_ID=your_properties_database_id
   NOTION_AMENITIES_DB_ID=your_amenities_database_id
   NOTION_NEARBY_LOCATIONS_DB_ID=your_nearby_locations_database_id
   NOTION_VIRTUAL_TOUR_SCENES_DB_ID=your_virtual_tour_scenes_database_id
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:4321](http://localhost:4321) in your browser.

## 🗃️ Notion Database Setup

The project uses four interconnected Notion databases:

### Properties Database (Main)
- **Property Name** (Title)
- **Slug** (Rich Text) - URL-friendly identifier
- **Property Type** (Select) - departamento, casa, etc.
- **Developer Name** (Rich Text)
- **Developer Logo** (Files) - SVG/PNG logo (automatically downloaded during build)
- **Developer Image** (Files) - Developer main image (automatically downloaded during build)
- **Developer Description** (Rich Text)
- **Address** (Rich Text)
- **Neighborhood** (Rich Text)
- **City** (Rich Text)
- **Maps Link** (Rich Text) - Google Maps iframe embed code
- **Min Price** (Number)
- **Max Price** (Number)
- **Currency** (Select)
- **Min Area M2** (Number)
- **Max Area M2** (Number)
- **Bedrooms** (Number)
- **Bathrooms** (Number)
- **Parking Spaces** (Number)
- **Is Furnished** (Checkbox)
- **Delivery Type** (Select)
- **Year** (Number) - Year built/delivered
- **gallery** (Files) - Property images (automatically downloaded during build)
- **360** (Files) - 360° tour images
- **Virtual Tour URL** (URL)
- **Video URL** (URL)
- **Agent Name** (Rich Text)
- **Agent Phone** (Phone)
- **Agent Email** (Email)
- **Agent Website** (URL)
- **Description** (Rich Text)

### ⚠️ **Database Changes (January 2025)**
The following properties have been **removed** from the Notion database structure:
- ~~**ID** (Rich Text)~~ - No longer used (Notion's internal UUID is used instead)
- ~~**Status** (Select)~~ - All properties assumed to be "for_sale"
- ~~**Country** (Rich Text)~~ - Mexico assumed for all properties
- ~~**Commission Percentage** (Number)~~ - Not needed in current implementation
- ~~**Developer Logo URL** (Files)~~ - Replaced with **Developer Logo** media property

### Related Databases
- **Amenities**: Connected via Property relation (page titles auto-fetched)
- **Nearby Locations**: Connected via Property relation (page titles auto-fetched)
- **Virtual Tour Scenes**: Connected via Property relation with hotspot JSON data (page titles auto-fetched)

### 📸 **Automatic Image Management**
The integration automatically downloads all images from Notion during build time:
- **Gallery images** → `public/images/notion/{slug}-gallery-{index}.webp`
- **Developer images** → `public/images/notion/{slug}-developer-{index}.{ext}` (SVG/WebP)
- **Amenity images** → `public/images/notion/{slug}-amenity-{index}.webp`
- **Nearby location images** → `public/images/notion/{slug}-nearby-{index}.webp`
- **Virtual tour images** → `public/images/notion/{slug}-tour-{index}.webp`

This ensures all images are locally hosted and won't break due to Notion URL expiration.

## 🧞 Commands

| Command | Action |
|:--------|:-------|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `node export-properties.js` | Export Notion data to JSON files |

## 🔍 Testing Notion Integration

To verify your Notion integration and export property data:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Export property data:**
   ```bash
   node export-properties.js
   ```

This will:
- Fetch all properties from your Notion databases
- Download all images locally to `public/images/notion/`
- Create individual JSON files for each property in `notion-exports/`
- Generate a summary with data quality analysis
- Show which properties have missing required fields

### Export Output

The export creates:
- `notion-exports/{slug}.json` - Individual property files
- `notion-exports/summary.json` - Export summary and data quality report

Example summary structure:
```json
{
  "exportDate": "2025-07-22T00:01:37.218Z",
  "totalProperties": 2,
  "properties": [
    {
      "id": "...",
      "slug": "vitea-gardens",
      "name": "Vitea Gardens",
      "status": "for_sale",
      "hasRequiredFields": {
        "name": true,
        "slug": true,
        "description": true,
        "images": true,
        "pricing": true
      }
    }
  ]
}
```

## 🎨 Technology Stack

- **Framework**: [Astro](https://astro.build) - Static site generator with islands architecture
- **Styling**: [TailwindCSS v4](https://tailwindcss.com) - Utility-first CSS framework
- **CMS**: [Notion](https://notion.so) - Headless CMS via API
- **Virtual Tours**: [Pannellum.js](https://pannellum.org) - 360° panorama viewer
- **TypeScript**: Full type safety with strict mode
- **Fonts**: PPMori font family (extralight, regular, semibold)

## 🏠 Property Page Structure

Each property page (`/[slug]`) includes:

1. **Hero Section** - Property name, pricing, developer info, location
2. **Features Section** - Pricing, dimensions, features, delivery info
3. **Gallery** - Property images with lightbox
4. **Amenities** - Property amenities (if available)
5. **Virtual Tour** - 360° tour with scene navigation (if available)
6. **Nearby Locations** - Points of interest (if available)
7. **Map** - Interactive location map
8. **Developer Info** - Developer details and contact
9. **CTA** - Contact form and agent information

## 🔧 Development Notes

- Properties are generated at build time using `getStaticPaths()`
- Fallback data ensures site works even if Notion is unavailable
- Build cache prevents redundant API calls during development
- All images should be optimized to WebP format
- Virtual tour scenes support JSON hotspot configuration
- Mobile-first responsive design with smooth scrolling

## 📝 Contributing

1. Follow the existing code style and component patterns
2. Test Notion integration with `node export-properties.js`
3. Ensure all new components are responsive
4. Add TypeScript types for new data structures
5. Optimize images to WebP format

## 🚀 Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform

3. **Deploy the `dist/` folder** to your hosting service

## 📞 Support

For questions about the codebase, check the `CLAUDE.md` file for additional development guidance and architecture details.