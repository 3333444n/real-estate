export interface Developer {
  name: string;
  logoUrl: string;
  imageUrl?: string;
  description: string;
}

export interface Contact {
  agentName: string;
  phone: string;
  email: string;
  website: string;
}

export interface HotSpot {
  pitch: number;
  yaw: number;
  type: string;
  text: string;
  sceneId: string;
}

export interface VirtualTourScene {
  id: string;
  title: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  description: string;
  hotSpots: HotSpot[];
}

export interface VirtualTour {
  enabled: boolean;
  scenes: VirtualTourScene[];
}

export interface Location {
  address: string;
  neighborhood: string;
  city: string;
  mapsLink: string;
}

export interface Pricing {
  minPrice: number;
  maxPrice: number;
  currency: string;
}

export interface Dimensions {
  minAreaM2: number;
  maxAreaM2: number;
}

export interface Features {
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  isFurnished: boolean;
}

export interface Delivery {
  type: string;
  yearBuilt: number;
}

export interface Amenity {
  title: string;
  description: string;
  amenity: string;
  imageUrl: string;
}

export interface NearbyLocation {
  title: string;
  description: string;
  category: string;
  distance: string;
  imageUrl: string;
}

export interface Media {
  images: string[];
  virtualTourUrl: string;
  videoUrl: string;
  threeSixtyImages: string[];
}

export interface MockupData {
  id: string;
  slug: string;
  propertyName: string;
  propertyType: string;
  developer: Developer;
  location: Location;
  pricing: Pricing;
  dimensions: Dimensions;
  features: Features;
  delivery: Delivery;
  amenities: Amenity[];
  nearbyLocations: NearbyLocation[];
  media: Media;
  virtualTour: VirtualTour;
  contact: Contact;
  description: string;
} 