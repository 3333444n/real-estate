#!/usr/bin/env node

/**
 * Quick utility to check which properties have virtual tours enabled
 */

import fs from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('🔍 Checking virtual tour availability from exported data...\n');
    
    const exportDir = './notion-exports';
    
    if (!fs.existsSync(exportDir)) {
      console.log('❌ No exported data found. Run "node export-properties.js" first.');
      return;
    }
    
    const files = fs.readdirSync(exportDir).filter(f => f.endsWith('.json') && f !== 'summary.json');
    
    console.log(`📊 Found ${files.length} property files\n`);
    
    const propertiesWithTours = [];
    
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(exportDir, file), 'utf8'));
      
      if (data.virtualTour && data.virtualTour.enabled && data.virtualTour.scenes.length > 0) {
        propertiesWithTours.push(data);
      }
    }
    
    console.log(`🎬 Properties with virtual tours: ${propertiesWithTours.length}\n`);
    
    if (propertiesWithTours.length > 0) {
      console.log('✅ Properties with virtual tours:');
      propertiesWithTours.forEach(property => {
        console.log(`  • ${property.propertyName} (${property.slug})`);
        console.log(`    Scenes: ${property.virtualTour.scenes.length}`);
        property.virtualTour.scenes.forEach((scene, index) => {
          console.log(`      ${index + 1}. ${scene.title} (${scene.id})`);
          console.log(`         Panorama: ${scene.panoramaUrl}`);
          console.log(`         Hotspots: ${scene.hotSpots.length}`);
        });
        console.log('');
      });
    } else {
      console.log('❌ No properties with virtual tours found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();