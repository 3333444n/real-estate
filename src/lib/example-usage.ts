// Example usage of Notion integration
// This file demonstrates how to use the Notion data fetching functions

import { getAllProperties, getPropertyBySlug } from './notionData';

// Example: Get all properties at build time
export async function getStaticProps() {
  try {
    // Fetch all properties from Notion
    const properties = await getAllProperties();
    
    return {
      props: {
        properties
      }
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    
    // Return fallback data if Notion is unavailable
    return {
      props: {
        properties: []
      }
    };
  }
}

// Example: Get a specific property by slug
export async function getPropertyData(slug: string) {
  try {
    const property = await getPropertyBySlug(slug);
    
    if (!property) {
      throw new Error(`Property with slug "${slug}" not found`);
    }
    
    return property;
  } catch (error) {
    console.error(`Error fetching property ${slug}:`, error);
    throw error;
  }
}

// Example: Integration in Astro pages
/*
In your Astro pages (.astro files), you can use these functions like this:

---
// src/pages/index.astro
import { getAllProperties } from '../lib/notionData';

// This runs at build time
const properties = await getAllProperties();
---

<html>
  <body>
    {properties.map(property => (
      <div key={property.id}>
        <h2>{property.propertyName}</h2>
        <p>{property.description}</p>
      </div>
    ))}
  </body>
</html>

Or for dynamic routes:

---
// src/pages/property/[slug].astro
import { getPropertyBySlug, getAllProperties } from '../../lib/notionData';

export async function getStaticPaths() {
  const properties = await getAllProperties();
  
  return properties.map(property => ({
    params: { slug: property.slug },
    props: { property }
  }));
}

const { property } = Astro.props;
---

<html>
  <body>
    <h1>{property.propertyName}</h1>
    <p>{property.description}</p>
  </body>
</html>
*/