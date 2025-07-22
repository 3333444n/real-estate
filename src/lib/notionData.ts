import { 
  notion, 
  DATABASE_IDS, 
  extractPlainText, 
  extractNumber, 
  extractBoolean, 
  extractSelect, 
  extractUrl, 
  extractEmail, 
  extractPhone, 
  extractFiles 
} from './notion';
import { downloadImages, downloadSceneImages } from './imageDownloader';
import type { MockupData } from '../data/types';

// Build-time cache to avoid redundant API calls
const buildCache = new Map<string, any>();

// Fallback data matching the existing mockup structure
const fallbackData: MockupData = {
  id: "fallback",
  slug: "fallback-property",
  propertyName: "Fallback Property",
  propertyType: "departamento",
  developer: {
    name: "Default Developer",
    logoUrl: "/images/img-placeholder.webp",
    imageUrl: "/images/img-placeholder.webp",
    description: "Default developer description"
  },
  location: {
    address: "Default Address",
    neighborhood: "Default Neighborhood",
    city: "Ciudad de México",
    mapsLink: "https://maps.google.com"
  },
  pricing: {
    minPrice: 1000000,
    maxPrice: 1500000,
    currency: "MXN"
  },
  dimensions: {
    minAreaM2: 50.00,
    maxAreaM2: 100.00
  },
  features: {
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    isFurnished: false
  },
  delivery: {
    type: "entrega inmediata",
    yearBuilt: 2024
  },
  amenities: [],
  nearbyLocations: [],
  media: {
    heroImage: "/images/img-placeholder.webp",
    images: ["/images/img-placeholder.webp"],
    virtualTourUrl: "",
    videoUrl: "",
    threeSixtyImages: []
  },
  virtualTour: {
    enabled: false,
    scenes: []
  },
  contact: {
    agentName: "Default Agent",
    phone: "+52 55 0000 0000",
    email: "info@example.com",
    website: ""
  },
  description: "Default property description"
};

/**
 * Get all properties from Notion Real Estate Properties database
 */
export async function getAllProperties(): Promise<MockupData[]> {
  const cacheKey = 'all_properties';
  
  if (buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey);
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.PROPERTIES
    });

    const properties = await Promise.all(
      response.results.map(async (page: any) => {
        try {
          return await transformPropertyData(page);
        } catch (error) {
          console.error(`Error transforming property ${page.id}:`, error);
          return { ...fallbackData, id: page.id };
        }
      })
    );

    buildCache.set(cacheKey, properties);
    return properties;
  } catch (error) {
    console.error('Error fetching all properties:', error);
    return [fallbackData];
  }
}

/**
 * Get a single property by slug
 */
export async function getPropertyBySlug(slug: string): Promise<MockupData | null> {
  const cacheKey = `property_${slug}`;
  
  if (buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey);
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.PROPERTIES,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slug
        }
      }
    });

    if (response.results.length === 0) {
      return null;
    }

    const property = await transformPropertyData(response.results[0]);
    buildCache.set(cacheKey, property);
    return property;
  } catch (error) {
    console.error(`Error fetching property by slug ${slug}:`, error);
    return { ...fallbackData, slug };
  }
}

/**
 * Get amenities for a property
 */
export async function getPropertyAmenities(propertyId: string, propertySlug: string): Promise<any[]> {
  const cacheKey = `amenities_${propertyId}`;
  
  
  if (buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey);
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.AMENITIES,
      filter: {
        property: 'Property',
        relation: {
          contains: propertyId
        }
      }
    });

    const amenities = await Promise.all(
      response.results.map(async (page: any, index: number) => {
        const imageUrls = extractFiles(page.properties.Image);
        const localImages = imageUrls.length > 0 
          ? await downloadImages(imageUrls, propertySlug, 'amenity')
          : ["/images/img-placeholder.webp"];

        // Find the title property (in Notion, there's usually one property with type "title")
        const titleProperty = Object.entries(page.properties).find(([key, prop]: [string, any]) => 
          prop.type === 'title'
        );
        
        let title = 'Amenity';
        if (titleProperty) {
          const [propertyName, propertyValue] = titleProperty;
          title = extractPlainText((propertyValue as any).title || []);
        }
        
        return {
          title,
          description: extractPlainText(page.properties.Description?.rich_text || []),
          amenity: extractSelect(page.properties.Amenity) || '',
          imageUrl: localImages[0]
        };
      })
    );

    buildCache.set(cacheKey, amenities);
    return amenities;
  } catch (error) {
    console.error(`Error fetching amenities for property ${propertyId}:`, error);
    return [];
  }
}

/**
 * Get nearby locations for a property
 */
export async function getPropertyNearbyLocations(propertyId: string, propertySlug: string): Promise<any[]> {
  const cacheKey = `nearby_${propertyId}`;
  
  // Clear cache for debugging  
  buildCache.delete(cacheKey);
  
  if (buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey);
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.NEARBY_LOCATIONS,
      filter: {
        property: 'Property',
        relation: {
          contains: propertyId
        }
      }
    });

    const locations = await Promise.all(
      response.results.map(async (page: any, index: number) => {
        const imageUrls = extractFiles(page.properties.Image);
        const localImages = imageUrls.length > 0 
          ? await downloadImages(imageUrls, propertySlug, 'nearby')
          : ["/images/img-placeholder.webp"];

        // Find the title property (same approach as amenities)
        const titleProperty = Object.entries(page.properties).find(([key, prop]: [string, any]) => 
          prop.type === 'title'
        );
        
        let title = 'Location';
        if (titleProperty) {
          const [propertyName, propertyValue] = titleProperty;
          title = extractPlainText((propertyValue as any).title || []);
        }
        
        return {
          title,
          description: extractPlainText(page.properties.Description?.rich_text || []),
          category: extractSelect(page.properties.Category) || '',
          distance: extractPlainText(page.properties.Distance?.rich_text || []),
          imageUrl: localImages[0]
        };
      })
    );

    buildCache.set(cacheKey, locations);
    return locations;
  } catch (error) {
    console.error(`Error fetching nearby locations for property ${propertyId}:`, error);
    return [];
  }
}

/**
 * Get virtual tour scenes for a property
 */
export async function getPropertyVirtualTourScenes(propertyId: string, propertySlug: string): Promise<any[]> {
  const cacheKey = `scenes_${propertyId}`;
  
  if (buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey);
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_IDS.VIRTUAL_TOUR_SCENES,
      filter: {
        property: 'Property',
        relation: {
          contains: propertyId
        }
      },
      sorts: [
        {
          property: 'Scene Order',
          direction: 'ascending'
        }
      ]
    });

    const scenes = await Promise.all(
      response.results.map(async (page: any, index: number) => {
        const props = page.properties;
        
        // Parse hotspots from JSON text field
        let hotSpots = [];
        try {
          const hotspotsJson = extractPlainText(props.Hotspots?.rich_text || []);
          if (hotspotsJson && hotspotsJson.trim()) {
            hotSpots = JSON.parse(hotspotsJson);
          }
        } catch (error) {
          console.error(`Error parsing hotspots JSON for scene ${page.id}:`, error);
          hotSpots = [];
        }

        // Get the scene title for unique filename
        const titleProperty = Object.entries(props).find(([key, prop]: [string, any]) => 
          prop.type === 'title'
        );
        
        let title = 'Scene';
        let sceneIdFromTitle = 'scene';
        if (titleProperty) {
          const [propertyName, propertyValue] = titleProperty;
          title = extractPlainText((propertyValue as any).title || []);
          // Generate scene ID from title for unique filenames
          sceneIdFromTitle = title.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }

        // Download 360-img with scene-specific filename
        const panoramaUrls = extractFiles(props['360-img']);
        
        const panoramaImages = panoramaUrls.length > 0 
          ? await downloadSceneImages(panoramaUrls, propertySlug, sceneIdFromTitle)
          : ["/images/img-placeholder.webp"];

        // Use the ID from Notion or generate from title
        const finalSceneId = extractPlainText(props['Scene ID']?.rich_text || []) || sceneIdFromTitle;

        return {
          id: finalSceneId,
          title,
          panoramaUrl: panoramaImages[0],
          thumbnailUrl: panoramaImages[0], // Use same image as both panorama and thumbnail
          description: extractPlainText(props.Description?.rich_text || []) || '',
          hotSpots
        };
      })
    );

    // Filter out scenes without valid panorama images
    const validScenes = scenes.filter(scene => scene.panoramaUrl !== "/images/img-placeholder.webp");

    buildCache.set(cacheKey, validScenes);
    return validScenes;
  } catch (error) {
    console.error(`Error fetching virtual tour scenes for property ${propertyId}:`, error);
    return [];
  }
}

/**
 * Transform Notion property data to match existing structure
 */
async function transformPropertyData(page: any): Promise<MockupData> {
  const props = page.properties;
  const propertyId = page.id;
  const propertySlug = extractPlainText(props.Slug?.rich_text || []) || `property-${propertyId}`;

  // Extract hero image
  const heroImageUrls = extractFiles(props['hero-image']);
  const heroImages = heroImageUrls.length > 0 
    ? await downloadImages(heroImageUrls, propertySlug, 'hero')
    : ["/images/img-placeholder.webp"];

  // Extract gallery images
  const galleryUrls = extractFiles(props.gallery || props.Media);

  // Download gallery images
  const galleryImages = galleryUrls.length > 0 
    ? await downloadImages(galleryUrls, propertySlug, 'gallery')
    : ["/images/img-placeholder.webp"];

  // Extract and download developer images
  const developerLogoUrls = extractFiles(props['Developer Logo']);
  const developerImageUrls = extractFiles(props['Developer Image']);
  
  const developerLogoImages = developerLogoUrls.length > 0 
    ? await downloadImages(developerLogoUrls, propertySlug, 'developer')
    : ["/images/img-placeholder.webp"];
    
  const developerMainImages = developerImageUrls.length > 0 
    ? await downloadImages(developerImageUrls, propertySlug, 'developer')
    : ["/images/img-placeholder.webp"];

  // Get related data (pass propertySlug for image downloading)
  const [amenities, nearbyLocations, virtualTourScenes] = await Promise.all([
    getPropertyAmenities(propertyId, propertySlug),
    getPropertyNearbyLocations(propertyId, propertySlug),
    getPropertyVirtualTourScenes(propertyId, propertySlug)
  ]);

  return {
    id: propertyId,
    slug: propertySlug,
    propertyName: extractPlainText(props['Property Name']?.title || []),
    propertyType: extractSelect(props['Property Type']) || "departamento",
    developer: {
      name: extractPlainText(props['Developer Name']?.rich_text || []) || "Unknown Developer",
      logoUrl: developerLogoImages[0],
      imageUrl: developerMainImages[0],
      description: extractPlainText(props['Developer Description']?.rich_text || []) || ""
    },
    location: {
      address: extractPlainText(props.Address?.rich_text || []),
      neighborhood: extractPlainText(props.Neighborhood?.rich_text || []),
      city: extractPlainText(props.City?.rich_text || []) || "Ciudad de México",
      mapsLink: extractPlainText(props['Maps Link']?.rich_text || []) || extractUrl(props['Maps Link']) || ""
    },
    pricing: {
      minPrice: extractNumber(props['Min Price']),
      maxPrice: extractNumber(props['Max Price']) || extractNumber(props['Min Price']),
      currency: extractSelect(props.Currency) || "MXN"
    },
    dimensions: {
      minAreaM2: extractNumber(props['Min Area M2']),
      maxAreaM2: extractNumber(props['Max Area M2']) || extractNumber(props['Min Area M2'])
    },
    features: {
      bedrooms: extractNumber(props.Bedrooms) || 0,
      bathrooms: extractNumber(props.Bathrooms) || 0,
      parkingSpaces: extractNumber(props['Parking Spaces']) || 0,
      isFurnished: extractBoolean(props['Is Furnished'])
    },
    delivery: {
      type: extractSelect(props['Delivery Type']) || "entrega inmediata",
      yearBuilt: extractNumber(props.Year || props['Year Built']) || new Date().getFullYear()
    },
    amenities,
    nearbyLocations,
    media: {
      heroImage: heroImages[0],
      images: galleryImages.length > 0 ? galleryImages : ["/images/img-placeholder.webp"],
      virtualTourUrl: extractUrl(props['Virtual Tour URL']) || "",
      videoUrl: extractUrl(props['Video URL']) || "",
      threeSixtyImages: extractFiles(props['360'] || props['360 Images'])
    },
    virtualTour: {
      enabled: virtualTourScenes.length > 0,
      scenes: virtualTourScenes
    },
    contact: {
      agentName: extractPlainText(props['Agent Name']?.rich_text || []) || "Agent",
      phone: extractPhone(props['Agent Phone']) || extractPlainText(props['Agent Phone']?.rich_text || []),
      email: extractEmail(props['Agent Email']) || extractPlainText(props['Agent Email']?.rich_text || []),
      website: extractUrl(props['Agent Website']) || ""
    },
    description: extractPlainText(props.Description?.rich_text || []) || ""
  };
}

/**
 * Get all properties that have virtual tour scenes
 */
export async function getPropertiesWithVirtualTours(): Promise<MockupData[]> {
  const cacheKey = 'properties_with_tours';
  
  if (buildCache.has(cacheKey)) {
    return buildCache.get(cacheKey);
  }

  try {
    const allProperties = await getAllProperties();
    const propertiesWithTours = allProperties.filter(property => 
      property.virtualTour.enabled && property.virtualTour.scenes.length > 0
    );

    buildCache.set(cacheKey, propertiesWithTours);
    return propertiesWithTours;
  } catch (error) {
    console.error('Error fetching properties with virtual tours:', error);
    return [];
  }
}

/**
 * Clear build cache (useful for development)
 */
export function clearBuildCache(): void {
  buildCache.clear();
}