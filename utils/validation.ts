/**
 * Validation utilities for image uploads
 */

/**
 * Format file size from bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "5.2MB")
 */
export function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(1)}MB`;
}

/**
 * Validate image file size
 * @param file - File to validate
 * @param maxSizeBytes - Maximum allowed file size in bytes
 * @returns Validation result with error message and size if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeBytes: number
): { valid: boolean; error?: string; sizeMB?: number } {
  if (file.size > maxSizeBytes) {
    const sizeMB = file.size / (1024 * 1024);
    return {
      valid: false,
      error: `Image "${file.name}" exceeds ${formatFileSize(maxSizeBytes)} limit (${formatFileSize(file.size)})`,
      sizeMB,
    };
  }
  return { valid: true };
}

/**
 * Calculate remaining image slots available
 * @param existingCount - Number of existing images
 * @param newCount - Number of new images already selected
 * @param maxImages - Maximum images allowed
 * @returns Number of remaining slots
 */
export function calculateRemainingSlots(
  existingCount: number,
  newCount: number,
  maxImages: number
): number {
  return Math.max(0, maxImages - existingCount - newCount);
}
