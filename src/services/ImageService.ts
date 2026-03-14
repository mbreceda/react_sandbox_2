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

          // Add 15% padding as a permanent white frame (passepartout)
          const paddingX = img.width * 0.15;
          const paddingY = img.height * 0.15;

          // Set canvas size to image size + padding
          canvas.width = img.width + paddingX * 2;
          canvas.height = img.height + paddingY * 2;

          // Fill canvas background with perfect white
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw original image centered
          ctx.drawImage(img, paddingX, paddingY, img.width, img.height);

          // Calculate logo size (e.g., 20% of image width)
          const logoScale = 0.25;
          const logoWidth = img.width * logoScale;
          const logoHeight = (logo.height / logo.width) * logoWidth;

          // Calculate position (bottom right with less margin to push it to the right)
          const marginLeftRight = img.width * 0.02;
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
