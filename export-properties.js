#!/usr/bin/env node

// Simple script to export Notion properties as JSON files
// Make sure dev server is running: npm run dev
// Then run: node export-properties.js

async function exportProperties() {
  console.log('🔍 Exporting Notion properties...\n');

  try {
    const response = await fetch('http://localhost:4321/api/export-properties');
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(result.message);
      console.log(`\n📊 Summary:`);
      console.log(`Total properties: ${result.summary.totalProperties}`);
      console.log(`Export date: ${result.summary.exportDate}`);
      
      console.log(`\n📋 Properties exported:`);
      result.summary.properties.forEach((prop, index) => {
        const status = prop.hasRequiredFields;
        const issues = [];
        if (!status.name) issues.push('missing name');
        if (!status.slug) issues.push('missing slug');
        if (!status.description) issues.push('missing description');
        if (!status.images) issues.push('no images');
        if (!status.pricing) issues.push('invalid pricing');
        
        console.log(`${index + 1}. ${prop.name || 'Unnamed'} (${prop.slug})`);
        if (issues.length > 0) {
          console.log(`   ⚠️  Issues: ${issues.join(', ')}`);
        }
      });
      
      console.log(`\n✅ All files saved to ./notion-exports/`);
      console.log(`💡 Check individual JSON files for detailed property data`);
    } else {
      console.error('❌ Export failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error('\n💡 Make sure the dev server is running: npm run dev');
    console.error('💡 Then run this script: node export-properties.js');
  }
}

exportProperties();