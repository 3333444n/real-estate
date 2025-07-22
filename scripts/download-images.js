#!/usr/bin/env node

/**
 * Pre-build script to ensure all Notion images are downloaded before the main build
 * This runs during Vercel's build process to guarantee images are available
 */

import { getAllProperties } from '../src/lib/notionData.js';

console.log('🚀 Pre-build: Downloading all Notion images...');

async function downloadAllImages() {
  try {
    // This will trigger all image downloads through the existing logic
    const properties = await getAllProperties();
    
    console.log(`✅ Successfully processed ${properties.length} properties`);
    console.log('📥 All images have been downloaded to public/images/notion/');
    
    // Log image counts for verification
    let totalImages = 0;
    properties.forEach(property => {
      const imageCount = property.media.images.length + 
                        (property.media.heroImage ? 1 : 0) + 
                        property.amenities.length + 
                        property.nearbyLocations.length + 
                        property.virtualTour.scenes.length;
      totalImages += imageCount;
      console.log(`  ${property.slug}: ${imageCount} images`);
    });
    
    console.log(`📊 Total images processed: ${totalImages}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error downloading images:', error);
    process.exit(1);
  }
}

downloadAllImages();