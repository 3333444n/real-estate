import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get the project root directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const imagesDir = path.join(projectRoot, 'public/images/notion');

// Ensure the images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Download an image from a URL and save it locally
 */
export async function downloadImage(url: string, filename: string, forceDownload: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const localPath = path.join(imagesDir, filename);
    
    // Skip if already downloaded and force download is not requested
    if (!forceDownload && fs.existsSync(localPath)) {
      resolve(`/images/notion/${filename}`);
      return;
    }

    console.log(`📥 Downloading image: ${filename}`);
    
    const file = fs.createWriteStream(localPath);
    
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        fs.unlink(localPath, () => {}); // Delete the file on error
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(`/images/notion/${filename}`);
      });
    });

    request.on('error', (err) => {
      fs.unlink(localPath, () => {}); // Delete the file on error
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(localPath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

/**
 * Generate a filename from a URL
 */
export function generateFilename(url: string, propertySlug: string, type: 'gallery' | 'tour' | 'amenity' | 'nearby' | 'developer' | 'hero', index: number): string {
  const extension = path.extname(new URL(url).pathname) || '.webp';
  return `${propertySlug}-${type}-${index}${extension}`;
}

/**
 * Download multiple images and return local paths
 */
export async function downloadImages(urls: string[], propertySlug: string, type: 'gallery' | 'tour' | 'amenity' | 'nearby' | 'developer' | 'hero', forceDownload: boolean = false): Promise<string[]> {
  const localPaths: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const filename = generateFilename(urls[i], propertySlug, type, i + 1);
      const localPath = await downloadImage(urls[i], filename, forceDownload);
      localPaths.push(localPath);
    } catch (error) {
      console.error(`❌ Failed to download image ${i + 1}:`, error);
      localPaths.push('/images/img-placeholder.webp'); // Fallback
    }
  }
  
  return localPaths;
}

/**
 * Download scene-specific images with unique filenames per scene
 */
export async function downloadSceneImages(urls: string[], propertySlug: string, sceneId: string): Promise<string[]> {
  const localPaths: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const extension = path.extname(new URL(urls[i]).pathname) || '.webp';
      const filename = `${propertySlug}-tour-${sceneId}-${i + 1}${extension}`;
      const localPath = await downloadImage(urls[i], filename);
      localPaths.push(localPath);
    } catch (error) {
      console.error(`❌ Failed to download scene image ${i + 1} for ${sceneId}:`, error);
      localPaths.push('/images/img-placeholder.webp'); // Fallback
    }
  }
  
  return localPaths;
}

/**
 * Download nearby location images with unique filenames per location
 */
export async function downloadNearbyImages(urls: string[], propertySlug: string, locationSlug: string, locationIndex: number, forceDownload: boolean = false): Promise<string[]> {
  const localPaths: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const extension = path.extname(new URL(urls[i]).pathname) || '.webp';
      const filename = `${propertySlug}-nearby-${locationSlug}-${i + 1}${extension}`;
      const localPath = await downloadImage(urls[i], filename, forceDownload);
      localPaths.push(localPath);
    } catch (error) {
      console.error(`❌ Failed to download nearby image ${i + 1} for ${locationSlug}:`, error);
      localPaths.push('/images/img-placeholder.webp'); // Fallback
    }
  }
  
  return localPaths;
}

/**
 * Download amenity images with unique filenames per amenity
 */
export async function downloadAmenityImages(urls: string[], propertySlug: string, amenitySlug: string, amenityIndex: number): Promise<string[]> {
  const localPaths: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const extension = path.extname(new URL(urls[i]).pathname) || '.webp';
      const filename = `${propertySlug}-amenity-${amenitySlug}-${i + 1}${extension}`;
      const localPath = await downloadImage(urls[i], filename);
      localPaths.push(localPath);
    } catch (error) {
      console.error(`❌ Failed to download amenity image ${i + 1} for ${amenitySlug}:`, error);
      localPaths.push('/images/img-placeholder.webp'); // Fallback
    }
  }
  
  return localPaths;
}