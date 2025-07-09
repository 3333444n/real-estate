# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |

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

### Key Technical Notes

- Uses Astro's island architecture for performance
- TypeScript strict mode enabled
- Virtual tour scenes are dynamically loaded from JSON data
- Navbar hides when tour page is embedded in iframe
- All images optimized with WebP format in `public/images/`