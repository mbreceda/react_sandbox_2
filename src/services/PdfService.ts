import jsPDF from "jspdf";
import "svg2pdf.js";
import ImageTracer from "imagetracerjs";

export const PdfService = {
  /**
   * Converts a base64 image PNG/JPG into an SVG footprint and builds a PDF
   * with the vector embedded. Wait, jsPDF only natively supports a few SVG
   * functions or requires the svg2pdf.js module.
   * If jsPDF doesn't render the SVG string perfectly, we can embed the high
   * resolution PNG into the PDF instead, but since true vectors were requested,
   * we provide the SVG directly or attempt to let jsPDF render the SVG.
   * Let's try jsPDF's `addSvgAsImage` if it supports it, or just use `svg2pdf` trick
   * or a simple workaround: generating the SVG file.
   */
  async generateVectorizedPdf(
    base64Image: string,
    onProgress?: (msg: string) => void,
  ): Promise<void> {
    try {
      if (onProgress) onProgress("Trazando vectores...");

      // We wrap the callback-based API in a promise
      const svgString = await new Promise<string>((resolve) => {
        // ImageTracer takes an image URL and a callback that returns the SVG string
        ImageTracer.imageToSVG(
          base64Image,
          (svg: string) => {
            resolve(svg);
          },
          // options (optimized for black and white high contrast like silkscreen)
          {
            ltres: 0.1, // Linear error threshold (smaller = more detailed)
            qtres: 1.0, // Quadratic splines error threshold
            pathomit: 8, // Ignore very small paths (noise)
            pal: [
              { r: 0, g: 0, b: 0, a: 255 },
              { r: 255, g: 255, b: 255, a: 255 },
            ], // Black and White only
            colorquantcycles: 1, // Only two colors, no need to quantize long
          },
        );
      });

      if (onProgress) onProgress("Armando el PDF...");

      // Now create the PDF Document
      // We will create an A4 size PDF and draw the image/svg
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Let's draw the vector inside the PDF full page. A4 is 210 x 297 mm.
      const pageWidth = 210;
      const pageHeight = 297;

      // Calculate height to keep AR
      const img = new Image();
      img.src = base64Image;
      await new Promise((res) => {
        img.onload = res;
      });
      const imgRatio = img.height / img.width;

      // Calculate max width and height fitting in the page
      let targetWidth = pageWidth;
      let targetHeight = targetWidth * imgRatio;

      if (targetHeight > pageHeight) {
        targetHeight = pageHeight;
        targetWidth = targetHeight / imgRatio;
      }

      // Center the image
      const x = (pageWidth - targetWidth) / 2;
      const y = (pageHeight - targetHeight) / 2;

      if (onProgress) onProgress("Incrustando vectores al PDF...");

      // Parse current SVG string to a real DOM Element
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      // Fix SVG dimensions for svg2pdf scaling
      const rawWidth = svgElement.getAttribute("width") || img.width.toString();
      const rawHeight =
        svgElement.getAttribute("height") || img.height.toString();

      // Eliminate hard dimensions that prevent CSS/Native scaling
      svgElement.removeAttribute("width");
      svgElement.removeAttribute("height");
      // Force absolute viewBox so the PDF renderer knows how to shrink it
      svgElement.setAttribute(
        "viewBox",
        `0 0 ${parseInt(rawWidth)} ${parseInt(rawHeight)}`,
      );

      // Render the pure vector paths directly into the PDF
      await doc.svg(svgElement, {
        x,
        y,
        width: targetWidth,
        height: targetHeight,
      });

      doc.save(`caricatura-vectorial-${Date.now()}.pdf`);

      if (onProgress) onProgress("¡Listo!");
    } catch (err) {
      console.error("Vectorization failed:", err);
      throw err;
    }
  },
};
