// API endpoint to export Notion properties as JSON files
import type { APIRoute } from 'astro';
import { getAllProperties } from '../../lib/notionData';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export const GET: APIRoute = async () => {
  try {
    // Create exports directory if it doesn't exist
    const exportDir = './notion-exports';
    if (!existsSync(exportDir)) {
      await mkdir(exportDir);
    }

    // Fetch all properties
    const properties = await getAllProperties();
    
    // Export each property as individual JSON file
    for (const property of properties) {
      const slug = property.slug || `property-${property.id}`;
      const filename = `${exportDir}/${slug}.json`;
      
      await writeFile(filename, JSON.stringify(property, null, 2));
    }

    // Create summary file
    const summary = {
      exportDate: new Date().toISOString(),
      totalProperties: properties.length,
      properties: properties.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.propertyName,
        status: p.status,
        hasRequiredFields: {
          name: !!p.propertyName?.trim(),
          slug: !!p.slug?.trim(),
          description: !!p.description?.trim(),
          images: (p.media?.images?.length || 0) > 0,
          pricing: !!(p.pricing?.minPrice && p.pricing.minPrice > 0)
        }
      }))
    };

    await writeFile(`${exportDir}/summary.json`, JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify({
      success: true,
      message: `✅ Exported ${properties.length} properties to ${exportDir}/`,
      summary
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};