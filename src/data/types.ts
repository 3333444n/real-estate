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
  contact: Contact;
  description: string;
} 