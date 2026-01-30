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

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const { data: logs } = await client.models.GenerationLog.list({
        limit: 20
      });

      // Sort by creation date (newest first) - Gen2 models have createdAt by default
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

      <div className="gallery-content">
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
              <div key={item.id} className="gallery-card">
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
    </div>
  );
}
