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
import type { MockupData } from '../data/types';

// Build-time cache to avoid redundant API calls
const buildCache = new Map<string, any>();

// Fallback data matching the existing mockup structure
const fallbackData: MockupData = {
  id: "fallback",
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
    videoUrl: ""
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
      database_id: DATABASE_IDS.PROPERTIES,
      sorts: [
        {
          property: 'Created',
          direction: 'descending'
        }
      ]
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
export async function getPropertyAmenities(propertyId: string): Promise<any[]> {
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

    const amenities = response.results.map((page: any) => ({
      title: extractPlainText(page.properties.Title?.title || []),
      description: extractPlainText(page.properties.Description?.rich_text || []),
      imageUrl: extractFiles(page.properties.Image)[0] || "/images/img-placeholder.webp"
    }));

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
export async function getPropertyNearbyLocations(propertyId: string): Promise<any[]> {
  const cacheKey = `nearby_${propertyId}`;
  
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

    const locations = response.results.map((page: any) => ({
      title: extractPlainText(page.properties.Title?.title || []),
      description: extractPlainText(page.properties.Description?.rich_text || []),
      imageUrl: extractFiles(page.properties.Image)[0] || "/images/img-placeholder.webp"
    }));

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
export async function getPropertyVirtualTourScenes(propertyId: string): Promise<any[]> {
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
          property: 'Order',
          direction: 'ascending'
        }
      ]
    });

    const scenes = response.results.map((page: any) => {
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

      return {
        id: extractPlainText(props.SceneId?.rich_text || []),
        title: extractPlainText(props.Title?.title || []),
        panoramaUrl: extractFiles(props.PanoramaImage)[0] || "/images/img-placeholder.webp",
        thumbnailUrl: extractFiles(props.ThumbnailImage)[0] || "/images/img-placeholder.webp",
        description: extractPlainText(props.Description?.rich_text || []),
        hotSpots
      };
    });

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

  // Get related data
  const [amenities, nearbyLocations, virtualTourScenes] = await Promise.all([
    getPropertyAmenities(propertyId),
    getPropertyNearbyLocations(propertyId),
    getPropertyVirtualTourScenes(propertyId)
  ]);

  // Extract media images
  const mediaImages = extractFiles(props.Images || props.Media);

  return {
    id: propertyId,
    slug: extractPlainText(props.Slug?.rich_text || []) || `property-${propertyId}`,
    propertyName: extractPlainText(props.Name?.title || props.PropertyName?.title || []),
    status: extractSelect(props.Status) || "for_sale",
    propertyType: extractSelect(props.Type) || "departamento",
    developer: {
      name: extractPlainText(props.DeveloperName?.rich_text || []) || "Unknown Developer",
      logoUrl: extractFiles(props.DeveloperLogo)[0] || "/images/img-placeholder.webp",
      imageUrl: extractFiles(props.DeveloperImage)[0] || "/images/img-placeholder.webp",
      description: extractPlainText(props.DeveloperDescription?.rich_text || []) || ""
    },
    location: {
      address: extractPlainText(props.Address?.rich_text || []),
      neighborhood: extractPlainText(props.Neighborhood?.rich_text || []),
      city: extractPlainText(props.City?.rich_text || []) || "Ciudad de México",
      country: extractPlainText(props.Country?.rich_text || []) || "México",
      mapsLink: extractUrl(props.MapsLink) || ""
    },
    pricing: {
      minPrice: extractNumber(props.MinPrice || props.Price),
      maxPrice: extractNumber(props.MaxPrice) || extractNumber(props.MinPrice || props.Price),
      currency: extractSelect(props.Currency) || "MXN",
      commissionPercentage: extractNumber(props.CommissionPercentage) || 3.0
    },
    dimensions: {
      minAreaM2: extractNumber(props.MinArea || props.Area),
      maxAreaM2: extractNumber(props.MaxArea) || extractNumber(props.MinArea || props.Area)
    },
    features: {
      bedrooms: extractNumber(props.Bedrooms) || 0,
      bathrooms: extractNumber(props.Bathrooms) || 0,
      parkingSpaces: extractNumber(props.ParkingSpaces) || 0,
      isFurnished: extractBoolean(props.IsFurnished)
    },
    delivery: {
      type: extractSelect(props.DeliveryType) || "entrega inmediata",
      yearBuilt: extractNumber(props.YearBuilt) || new Date().getFullYear()
    },
    amenities,
    nearbyLocations,
    media: {
      images: mediaImages.length > 0 ? mediaImages : ["/images/img-placeholder.webp"],
      virtualTourUrl: extractUrl(props.VirtualTourUrl) || "",
      videoUrl: extractUrl(props.VideoUrl) || ""
    },
    virtualTour: {
      enabled: virtualTourScenes.length > 0,
      scenes: virtualTourScenes
    },
    contact: {
      agentName: extractPlainText(props.AgentName?.rich_text || []) || "Agent",
      phone: extractPhone(props.AgentPhone) || extractPlainText(props.AgentPhone?.rich_text || []),
      email: extractEmail(props.AgentEmail) || extractPlainText(props.AgentEmail?.rich_text || []),
      website: extractUrl(props.AgentWebsite) || ""
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