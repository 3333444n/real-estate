#!/usr/bin/env node

/**
 * Pre-build script to ensure all Notion images are downloaded before the main build
 * This runs during Vercel's build process to guarantee images are available
 */

import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { downloadImages, downloadAmenityImages, downloadNearbyImages, downloadSceneImages, downloadDeveloperImages } from '../src/lib/imageDownloader.ts';

// Load environment variables
dotenv.config();

// Initialize Notion client for Node.js
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_IDS = {
  PROPERTIES: process.env.NOTION_PROPERTIES_DB_ID || '',
  AMENITIES: process.env.NOTION_AMENITIES_DB_ID || '',
  NEARBY_LOCATIONS: process.env.NOTION_NEARBY_LOCATIONS_DB_ID || '',
  VIRTUAL_TOUR_SCENES: process.env.NOTION_VIRTUAL_TOUR_SCENES_DB_ID || '',
};

// Helper functions (copied from notion.ts)
function extractPlainText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(text => text.plain_text).join('');
}

function extractFiles(property) {
  if (!property?.files) return [];
  return property.files.map((file) => {
    if (file.type === 'external') {
      return file.external.url;
    } else if (file.type === 'file') {
      return file.file.url;
    }
    return '';
  }).filter((url) => url);
}

async function downloadAllImages() {
  try {
    console.log('🔍 Fetching properties from Notion...');
    
    // Get all properties
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.PROPERTIES
    });

    console.log(`📋 Found ${response.results.length} properties`);

    for (const page of response.results) {
      try {
        const props = page.properties;
        const propertySlug = extractPlainText(props.Slug?.rich_text || []) || `property-${page.id}`;
        
        console.log(`📥 Processing: ${propertySlug}`);

        // Download hero images
        const heroImageUrls = extractFiles(props['hero-image']);
        if (heroImageUrls.length > 0) {
          await downloadImages(heroImageUrls, propertySlug, 'hero');
        }

        // Download gallery images
        const galleryUrls = extractFiles(props.gallery || props.Media);
        if (galleryUrls.length > 0) {
          await downloadImages(galleryUrls, propertySlug, 'gallery');
        }

        // Download developer images
        const developerLogoUrls = extractFiles(props['Developer Logo']);
        const developerImageUrls = extractFiles(props['Developer Image']);
        
        if (developerLogoUrls.length > 0) {
          await downloadDeveloperImages(developerLogoUrls, propertySlug, 'logo');
        }
        if (developerImageUrls.length > 0) {
          await downloadDeveloperImages(developerImageUrls, propertySlug, 'image');
        }

        console.log(`✅ Completed: ${propertySlug}`);
      } catch (error) {
        console.error(`❌ Error processing property ${page.id}:`, error.message);
      }
    }

    console.log('🎉 All property images downloaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

downloadAllImages();