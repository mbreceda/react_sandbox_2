import { useState, useEffect } from "react";
import { useWizard } from "../../context/WizardContext";
import {
  transformToToddlerCaricature,
  getApiKey,
} from "../../services/geminiService";
import "./TransformationStep.css";

export function TransformationStep() {
  const {
    originalImage,
    setGeneratedImage,
    goNext,
    goBack,
    isProcessing,
    setIsProcessing,
  } = useWizard();

  const envApiKey = getApiKey();
  const [error, setError] = useState<string | null>(null);
  const [localApiKey, setLocalApiKey] = useState("");
  const [loadingPhrase, setLoadingPhrase] = useState("Trazando líneas...");

  useEffect(() => {
    if (isProcessing) {
      const phrases = [
        "Afilando el lápiz...",
        "Buscando mi goma de borrar...",
        "¡Qué perfil tan interesante!",
        "Mmm... esa nariz es un reto...",
        "Añadiendo un poco de magia...",
        "¡No te muevas!",
        "Capturando tu esencia (o intentándolo)...",
        "Dibujando como Picasso en un mal día...",
        "¡Casi termino! Solo falta el bigote...",
      ];

      let index = 0;
      // Initial phrase
      setLoadingPhrase(phrases[0]);

      const interval = setInterval(() => {
        index = (index + 1) % phrases.length;
        setLoadingPhrase(phrases[index]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleTransform = async () => {
    const keyToUse = envApiKey || localApiKey.trim();

    if (!keyToUse) {
      setError("Por favor ingresa tu API Key de Gemini");
      return;
    }

    if (!originalImage) {
      setError("No hay imagen para transformar");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const result = await transformToToddlerCaricature(
        originalImage,
        keyToUse,
      );
      setGeneratedImage(result);
      goNext();
    } catch (err) {
      console.error("Transformation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al generar la caricatura. Verifica tu API Key e intenta de nuevo.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const hasApiKey = !!envApiKey;

  return (
    <div className="transformation-step">
      <div className="step-header">
        <span className="step-number">2</span>
        <div className="step-info">
          <h2>Estudio de Dibujo</h2>
          <p>Convierte tu rostro en un retrato a lápiz</p>
        </div>
      </div>

      <div className="transformation-content">
        <div className="preview-section">
          {originalImage && (
            <img
              src={originalImage}
              alt="Tu foto"
              className="transformation-preview"
            />
          )}
        </div>

        <div className="transformation-info">
          {!hasApiKey && (
            <div className="api-key-section">
              <label htmlFor="api-key">Llave del Estudio (API Key)</label>
              <input
                id="api-key"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Ingresa tu llave..."
                className="api-key-input"
                disabled={isProcessing}
              />
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="api-key-link"
              >
                ¿No tienes llave? Consíguela gratis →
              </a>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      <div className="step-actions">
        <button
          className="action-btn secondary-btn icon-only-btn"
          onClick={goBack}
          disabled={isProcessing}
          title="Regresar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          className="action-btn primary-btn transform-btn icon-only-btn"
          onClick={handleTransform}
          disabled={isProcessing || (!hasApiKey && !localApiKey.trim())}
          title="Generar Retrato"
        >
          {isProcessing ? (
            <span className="spinner-small"></span>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="btn-icon"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          )}
        </button>
      </div>

      {isProcessing && <p className="loading-phrase">{loadingPhrase}</p>}
    </div>
  );
}
