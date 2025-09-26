/**
 * URL Fixer Utility
 * Replaces problematic placeholder URLs with reliable alternatives
 */
import { generatePlaceholderUrl } from './avatarUtils';

/**
 * Fix problematic placeholder URLs
 */
export const fixPlaceholderUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Check if it's a via.placeholder.com URL
  if (url.includes('via.placeholder.com')) {
    console.warn('Replacing problematic via.placeholder.com URL:', url);
    
    // Extract parameters from the URL
    const urlParts = url.split('/');
    const sizeAndColors = urlParts[urlParts.length - 1];
    
    // Parse size (e.g., "200x200")
    const sizeMatch = sizeAndColors.match(/(\d+)x(\d+)/);
    const size = sizeMatch ? parseInt(sizeMatch[1]) : 200;
    
    // Parse background color (e.g., "2563EB")
    const bgColorMatch = sizeAndColors.match(/\/(\w{6})\//);
    const bgColor = bgColorMatch ? bgColorMatch[1] : '2563EB';
    
    // Parse text color (e.g., "FFFFFF")
    const textColorMatch = sizeAndColors.match(/\/(\w{6})\?/);
    const textColor = textColorMatch ? textColorMatch[1] : 'FFFFFF';
    
    // Parse text (e.g., "text=OA")
    const textMatch = url.match(/text=([^&]*)/);
    const text = textMatch ? decodeURIComponent(textMatch[1]) : 'U';
    
    // Generate replacement URL
    return generatePlaceholderUrl(text, bgColor, textColor, size);
  }

  return url;
};

/**
 * Fix URLs in an object recursively
 */
export const fixUrlsInObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(fixUrlsInObject);
  }

  const fixed = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && (key.includes('url') || key.includes('src') || key.includes('avatar'))) {
      fixed[key] = fixPlaceholderUrl(value);
    } else if (typeof value === 'object') {
      fixed[key] = fixUrlsInObject(value);
    } else {
      fixed[key] = value;
    }
  }

  return fixed;
};

/**
 * Fix URLs in API response
 */
export const fixApiResponse = (response) => {
  if (!response || !response.data) {
    return response;
  }

  return {
    ...response,
    data: fixUrlsInObject(response.data)
  };
};

export default {
  fixPlaceholderUrl,
  fixUrlsInObject,
  fixApiResponse
};
