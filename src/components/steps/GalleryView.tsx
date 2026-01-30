import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import { StorageService } from "../../services/StorageService";
import "./GalleryView.css";

const client = generateClient<Schema>();

interface GalleryItem {
  id: string;
  generatedUrl: string;
  createdAt: string;
}

interface GalleryViewProps {
  onBack: () => void;
}

export function GalleryView({ onBack }: GalleryViewProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data: logs } = await client.models.GenerationLog.list({
        limit: 50 // Increased limit for better scrolling experience
      });

      // Sort by creation date (newest first)
      const sortedLogs = [...logs].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Get signed URLs for all images
      const itemsWithUrls = await Promise.all(
        sortedLogs.map(async (log) => {
          const url = await StorageService.getImageUrl(log.generatedImageKey);
          return {
            id: log.id,
            generatedUrl: url,
            createdAt: log.createdAt
          };
        })
      );

      setItems(itemsWithUrls.filter(item => item.generatedUrl));
    } catch (err) {
      console.error("Error fetching gallery:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `caricatura-hall-of-fame-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "caricatura-fred-breceda.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Hall of Fame - Fred Breceda",
          text: "¡Mira esta caricatura en el Hall of Fame!",
        });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("¡Imagen copiada al portapapeles!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="gallery-view animate-in">
      <div className="gallery-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h2>Hall of Fame</h2>
        <p>Las últimas creaciones del estudio</p>
      </div>

      <div className="gallery-content custom-scrollbar">
        {loading ? (
          <div className="gallery-loading">
            <div className="loading-spinner"></div>
            <p>Curando la exposición...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="gallery-empty">
            <div className="empty-icon">🎨</div>
            <p>Aún no hay obras en la galería.</p>
            <p>¡Sé el primero en crear una!</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {items.map((item) => (
              <div
                key={item.id}
                className="gallery-card"
                onClick={() => setSelectedItem(item)}
              >
                <div className="card-frame">
                  <img src={item.generatedUrl} alt="Caricatura" loading="lazy" />
                </div>
                <div className="card-date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="gallery-footer">
        <p>✨ Total Obras: {items.length} ✨</p>
      </div>

      {/* Lightbox / Expanded View */}
      {selectedItem && (
        <div className="lightbox-overlay" onClick={() => setSelectedItem(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedItem(null)}>&times;</button>
            <div className="expanded-frame">
              <img src={selectedItem.generatedUrl} alt="Caricatura expandida" />
            </div>

            <div className="expanded-actions">
              <button className="action-btn share-btn icon-only-btn" onClick={() => handleShare(selectedItem.generatedUrl)} title="Compartir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>

              <button className="action-btn primary-btn download-btn icon-only-btn" onClick={() => handleDownload(selectedItem.generatedUrl)} title="Descargar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>

            <div className="expanded-info">
              <span>Publicado el {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
