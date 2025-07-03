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

export interface MockupData {
  propertyName: string;
  propertyType: string;
  developer: Developer;
  location: any;
  pricing: any;
  dimensions: any;
  features: any;
  delivery: any;
  amenities: any[];
  nearbyLocations: any[];
  media: any;
  virtualTour: VirtualTour;
  contact: Contact;
  description: string;
} 