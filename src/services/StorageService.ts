import { uploadData, getUrl } from 'aws-amplify/storage';

/**
 * Converts a Base64 string to a Blob
 */
const base64ToBlob = async (base64: string): Promise<Blob> => {
  const response = await fetch(base64);
  const blob = await response.blob();
  return blob;
};

export const StorageService = {
  /**
   * Uploads the Original and Generated images to S3.
   * Returns the paths or URLs of the uploaded files.
   */
  async saveSessionImages(originalBase64: string, generatedBase64: string) {
    const timestamp = Date.now();
    const sessionId = `session_${timestamp}`;

    try {
      // 1. Convert Base64 to Blobs
      const originalBlob = await base64ToBlob(originalBase64);
      const generatedBlob = await base64ToBlob(generatedBase64);

      // 2. Define operational paths
      const date = new Date();
      const pathPrefix = `uploads/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${sessionId}`;

      const originalPath = `${pathPrefix}/original.png`;
      const generatedPath = `${pathPrefix}/generated.png`;

      // 3. Upload
      const uploadOriginal = uploadData({
        path: originalPath,
        data: originalBlob,
        options: {
          contentType: 'image/png'
        }
      }).result;

      const uploadGenerated = uploadData({
        path: generatedPath,
        data: generatedBlob,
        options: {
          contentType: 'image/png'
        }
      }).result;

      // Wait for both
      await Promise.all([uploadOriginal, uploadGenerated]);

      console.log(`[StorageService] Successfully uploaded images to ${pathPrefix}`);

      return {
        success: true,
        sessionId,
        originalPath,
        generatedPath
      };

    } catch (error) {
      console.error("[StorageService] Upload failed:", error);
      return { success: false, error };
    }
  },

  /**
   * Gets a signed URL for an image key
   */
  async getImageUrl(path: string): Promise<string> {
    try {
      const result = await getUrl({
        path,
        options: {
          validateObjectExistence: true,
          expiresIn: 3600 // 1 hour
        }
      });
      return result.url.toString();
    } catch (error) {
      console.error("[StorageService] Error getting URL:", error);
      return "";
    }
  }
};
