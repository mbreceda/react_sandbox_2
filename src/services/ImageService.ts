/**
 * Utility to process images using Canvas
 */
export const ImageService = {
  /**
   * Applies an image watermark to a base64 image
   */
  applyWatermark: (
    base64Image: string,
    logoPath: string = "/assets/fred-breceda.png",
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const logo = new Image();

      let imagesLoaded = 0;
      const onImageLoad = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Set canvas size to image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw original image
          ctx.drawImage(img, 0, 0);

          // Calculate logo size (e.g., 20% of image width)
          const logoScale = 0.25;
          const logoWidth = img.width * logoScale;
          const logoHeight = (logo.height / logo.width) * logoWidth;

          // Calculate position (bottom right with 5% margin)
          const marginLeftRight = img.width * 0.05;
          const marginBottom = img.height * 0.05;
          const x = canvas.width - logoWidth - marginLeftRight;
          const y = canvas.height - logoHeight - marginBottom;

          // Draw logo
          ctx.globalAlpha = 0.8; // Slight transparency
          ctx.drawImage(logo, x, y, logoWidth, logoHeight);
          ctx.globalAlpha = 1.0;

          resolve(canvas.toDataURL("image/png"));
        }
      };

      img.crossOrigin = "anonymous";
      logo.crossOrigin = "anonymous";

      img.onload = onImageLoad;
      logo.onload = onImageLoad;

      img.onerror = reject;
      logo.onerror = reject;

      img.src = base64Image;
      logo.src = logoPath;
    });
  },
};
