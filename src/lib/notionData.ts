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
import { downloadImages } from './imageDownloader';
import type { MockupData } from '../data/types';

// Build-time cache to avoid redundant API calls
const buildCache = new Map<string, any>();

// Fallback data matching the existing mockup structure
const fallbackData: MockupData = {
  id: "fallback",
  propertyId: "PROP-000",
  slug: "fallback-property",
  propertyName: "Fallback Property",
  status: "for_sale",
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
    country: "México",
    mapsLink: "https://maps.google.com"
  },
  pricing: {
    minPrice: 1000000,
    maxPrice: 1500000,
    currency: "MXN",
    commissionPercentage: 3.00
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
          return { ...fallbackData, id: page.id, propertyId: `PROP-${page.id.substring(0, 8)}` };
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
    return { ...fallbackData, slug, propertyId: `PROP-${slug.toUpperCase()}` };
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
    });

    const scenes = await Promise.all(
      response.results.map(async (page: any, index: number) => {
        const props = page.properties;
        
        // Parse hotspots from JSON string if available
        let hotSpots = [];
        try {
          const hotspotsJson = extractPlainText(props.Hotspots?.rich_text || []);
          if (hotspotsJson) {
            hotSpots = JSON.parse(hotspotsJson);
          }
        } catch (error) {
          console.error('Error parsing hotspots JSON:', error);
        }

        // Download panorama and thumbnail images
        const panoramaUrls = extractFiles(props.PanoramaImage);
        const thumbnailUrls = extractFiles(props.ThumbnailImage);
        
        const panoramaImages = panoramaUrls.length > 0 
          ? await downloadImages(panoramaUrls, propertySlug, 'tour')
          : ["/images/img-placeholder.webp"];
          
        const thumbnailImages = thumbnailUrls.length > 0 
          ? await downloadImages(thumbnailUrls, propertySlug, 'tour')
          : ["/images/img-placeholder.webp"];

        // Find the title property (same approach as amenities)
        const titleProperty = Object.entries(props).find(([key, prop]: [string, any]) => 
          prop.type === 'title'
        );
        
        let title = 'Scene';
        if (titleProperty) {
          const [propertyName, propertyValue] = titleProperty;
          title = extractPlainText((propertyValue as any).title || []);
        }

        return {
          id: extractPlainText(props.SceneId?.rich_text || []),
          title,
          panoramaUrl: panoramaImages[0],
          thumbnailUrl: thumbnailImages[0],
          description: extractPlainText(props.Description?.rich_text || []),
          hotSpots
        };
      })
    );

    buildCache.set(cacheKey, scenes);
    return scenes;
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

  // Extract gallery images first to get URLs
  const galleryUrls = extractFiles(props.gallery || props.Media);

  // Download gallery images
  const galleryImages = galleryUrls.length > 0 
    ? await downloadImages(galleryUrls, propertySlug, 'gallery')
    : ["/images/img-placeholder.webp"];

  // Get related data (pass propertySlug for image downloading)
  const [amenities, nearbyLocations, virtualTourScenes] = await Promise.all([
    getPropertyAmenities(propertyId, propertySlug),
    getPropertyNearbyLocations(propertyId, propertySlug),
    getPropertyVirtualTourScenes(propertyId, propertySlug)
  ]);

  return {
    id: propertyId,
    propertyId: extractPlainText(props.ID?.rich_text || props['Property ID']?.rich_text || []),
    slug: propertySlug,
    propertyName: extractPlainText(props['Property Name']?.title || []),
    status: extractSelect(props.Status) || "for_sale",
    propertyType: extractSelect(props['Property Type']) || "departamento",
    developer: {
      name: extractPlainText(props['Developer Name']?.rich_text || []) || "Unknown Developer",
      logoUrl: extractFiles(props['Developer Logo URL'])[0] || "/images/img-placeholder.webp",
      imageUrl: extractFiles(props['Developer Image'])[0] || "/images/img-placeholder.webp",
      description: extractPlainText(props['Developer Description']?.rich_text || []) || ""
    },
    location: {
      address: extractPlainText(props.Address?.rich_text || []),
      neighborhood: extractPlainText(props.Neighborhood?.rich_text || []),
      city: extractPlainText(props.City?.rich_text || []) || "Ciudad de México",
      country: extractPlainText(props.Country?.rich_text || []) || "México",
      mapsLink: extractUrl(props['Maps Link']) || ""
    },
    pricing: {
      minPrice: extractNumber(props['Min Price']),
      maxPrice: extractNumber(props['Max Price']) || extractNumber(props['Min Price']),
      currency: extractSelect(props.Currency) || "MXN",
      commissionPercentage: extractNumber(props['Commission Percentage']) || 3.0
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
 * Clear build cache (useful for development)
 */
export function clearBuildCache(): void {
  buildCache.clear();
}