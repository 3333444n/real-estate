import { Client } from '@notionhq/client';

// Initialize Notion client
export const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
});

// Database IDs (to be provided separately)
export const DATABASE_IDS = {
  PROPERTIES: import.meta.env.NOTION_PROPERTIES_DB_ID || '',
  AMENITIES: import.meta.env.NOTION_AMENITIES_DB_ID || '',
  NEARBY_LOCATIONS: import.meta.env.NOTION_NEARBY_LOCATIONS_DB_ID || '',
  VIRTUAL_TOUR_SCENES: import.meta.env.NOTION_VIRTUAL_TOUR_SCENES_DB_ID || '',
} as const;

// Helper function to extract plain text from Notion rich text
export function extractPlainText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(text => text.plain_text).join('');
}

// Helper function to extract number from Notion number property
export function extractNumber(property: any): number {
  return property?.number || 0;
}

// Helper function to extract boolean from Notion checkbox property
export function extractBoolean(property: any): boolean {
  return property?.checkbox || false;
}

// Helper function to extract select value
export function extractSelect(property: any): string {
  return property?.select?.name || '';
}

// Helper function to extract multi-select values
export function extractMultiSelect(property: any): string[] {
  if (!property?.multi_select) return [];
  return property.multi_select.map((item: any) => item.name);
}

// Helper function to extract URL from Notion URL property
export function extractUrl(property: any): string {
  return property?.url || '';
}

// Helper function to extract email from Notion email property
export function extractEmail(property: any): string {
  return property?.email || '';
}

// Helper function to extract phone from Notion phone property
export function extractPhone(property: any): string {
  return property?.phone_number || '';
}

// Helper function to extract date
export function extractDate(property: any): string {
  return property?.date?.start || '';
}

// Helper function to extract files/images
export function extractFiles(property: any): string[] {
  if (!property?.files) return [];
  return property.files.map((file: any) => {
    if (file.type === 'external') {
      return file.external.url;
    } else if (file.type === 'file') {
      return file.file.url;
    }
    return '';
  }).filter((url: string) => url);
}

// Helper function to extract relation IDs
export function extractRelationIds(property: any): string[] {
  if (!property?.relation) return [];
  return property.relation.map((rel: any) => rel.id);
}