import { uploadData } from 'aws-amplify/storage';

/*
 * USAGE INSTRUCTIONS:
 * 1. Ensure you have configured Amplify in your project root (e.g., in main.tsx or App.tsx):
 *    import { Amplify } from 'aws-amplify';
 *    import outputs from '../amplify_outputs.json'; // or aws-exports.js
 *    Amplify.configure(outputs);
 * 
 * 2. Ensure your backend has Storage enabled with guest/auth access.
 */

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
      // Structure: public/year/month/day/session_id/
      const date = new Date();
      const pathPrefix = `uploads/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${sessionId}`;

      const originalPath = `${pathPrefix}/original.png`;
      const generatedPath = `${pathPrefix}/generated.png`;

      // 3. Upload Original (Parallel execution if desired, but we'll await for safety)
      /* 
       * NOTE: Assuming 'guest' access or authenticated access is configured.
       * 'options' can be customized.
       */
      const uploadOriginal = uploadData({
        path: originalPath,
        data: originalBlob,
        options: {
          contentType: 'image/png',
          // accessLevel: 'guest' // Deprecated in Gen2, controlled by resource policy
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
      // We don't want to block the user flow if backup fails, so we return false but strictly log it.
      return { success: false, error };
    }
  }
};
