/**
 * Cloudinary Image Optimization Utility
 * 
 * Automatically transforms Cloudinary image URLs to optimize for mobile loading
 * and responsive display across different viewport sizes.
 */

/**
 * Checks if a URL is a Cloudinary URL
 */
function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Gets responsive image width based on viewport
 * Mobile-first approach with breakpoints
 */
function getResponsiveWidth(): number {
  if (typeof window === 'undefined') {
    return 600; // Default for SSR
  }

  const viewportWidth = window.innerWidth;
  
  // Mobile: ≤768px
  if (viewportWidth <= 768) {
    return 400;
  }
  // Tablet: 769px - 1024px
  else if (viewportWidth <= 1024) {
    return 500;
  }
  // Desktop: >1024px
  else {
    return 600;
  }
}

/**
 * Optimizes a Cloudinary image URL for mobile and responsive display
 * 
 * Adds Cloudinary transformations:
 * - c_fill: Crop to fill (ensures image fills frame completely)
 * - g_auto: Automatic gravity (smart cropping)
 * - f_auto: Automatic format selection (WebP, AVIF, etc.)
 * - q_auto: Automatic quality optimization
 * - w_auto: Responsive width (Cloudinary auto-detects viewport)
 * 
 * @param imageUrl - Original Cloudinary URL
 * @returns Optimized Cloudinary URL with transformations
 */
export function optimizeCloudinaryUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  // If not a Cloudinary URL, return as-is
  if (!isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  // Find the '/image/upload/' part in the URL
  const uploadIndex = imageUrl.indexOf('/image/upload/');
  
  if (uploadIndex === -1) {
    // Not a standard Cloudinary URL format, return as-is
    return imageUrl;
  }

  // Get the part before '/image/upload/' and after
  const beforeUpload = imageUrl.substring(0, uploadIndex + '/image/upload/'.length);
  const afterUpload = imageUrl.substring(uploadIndex + '/image/upload/'.length);
  
  // Required transformations for fill behavior
  // c_fill: crop to fill, g_auto: auto gravity, w_auto: responsive width
  // f_auto: format auto, q_auto: quality auto
  const transformations = `c_fill,g_auto,w_auto,f_auto,q_auto`;
  
  // Check if URL already has our core transformations
  if (imageUrl.includes('c_fill') && imageUrl.includes('g_auto')) {
    // Update w_auto if it exists, otherwise add it
    if (imageUrl.match(/w_(auto|\d+)/)) {
      // Replace existing width with w_auto
      return imageUrl.replace(/w_(auto|\d+)/, 'w_auto');
    } else {
      // Add w_auto to existing transformations
      // Insert after g_auto
      return imageUrl.replace(/g_auto/, 'g_auto,w_auto');
    }
  }
  
  // No existing transformations, add ours
  // Insert transformations before the public_id or version
  return `${beforeUpload}${transformations}/${afterUpload}`;
}

/**
 * Optimizes Cloudinary URL with specific width
 * Useful for cases where you need a specific size
 */
export function optimizeCloudinaryUrlWithWidth(imageUrl: string | undefined, width: number): string | undefined {
  if (!imageUrl) {
    return undefined;
  }

  if (!isCloudinaryUrl(imageUrl)) {
    return imageUrl;
  }

  const uploadIndex = imageUrl.indexOf('/image/upload/');
  
  if (uploadIndex === -1) {
    return imageUrl;
  }

  const insertIndex = imageUrl.indexOf('/image/upload/') + '/image/upload/'.length;
  const afterUpload = imageUrl.substring(insertIndex);
  
  // Check if transformations exist
  const hasTransformations = !afterUpload.match(/^v\d+\//);
  
  if (hasTransformations) {
    // Update or add width
    if (imageUrl.includes('w_')) {
      return imageUrl.replace(/w_\d+/, `w_${width}`);
    } else {
      // Add width to existing transformations
      return imageUrl.slice(0, insertIndex) + `w_${width}/` + imageUrl.slice(insertIndex);
    }
  } else {
    // Add transformations with width
    return imageUrl.slice(0, insertIndex) + `f_auto,q_auto,w_${width}/` + imageUrl.slice(insertIndex);
  }
}

