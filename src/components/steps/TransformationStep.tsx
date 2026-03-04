import { useState, useEffect } from "react";
import { useWizard } from "../../context/WizardContext";
import {
  transformToToddlerCaricature,
  getApiKey,
} from "../../services/geminiService";
import { ImageService } from "../../services/ImageService";
import { useSettings } from "../../context/SettingsContext";
import "./TransformationStep.css";

export function TransformationStep() {
  const {
    originalImage,
    setGeneratedImage,
    setGenerationMetadata,
    toddlerIntensity,
    setToddlerIntensity,
    goNext,
    goBack,
    isProcessing,
    setIsProcessing,
  } = useWizard();

  const { showIntensitySlider, showWatermark, applySilkscreenFilter } = useSettings();

  const envApiKey = getApiKey();
  const [error, setError] = useState<string | null>(null);
  const [localApiKey, setLocalApiKey] = useState("");
  const [loadingPhrase, setLoadingPhrase] = useState("Trazando líneas...");

  useEffect(() => {
    if (isProcessing) {
      const phrases = [
        "Esto toma ~30 segundos, aguanta...",
        "Afilando el lápiz... ✏️",
        "Buscando mi goma de borrar...",
        "¡Qué buen perfil! 😏",
        "Esa nariz está cañona de dibujar...",
        "Echándole una chispita de magia...",
        "¡No te muevas! 📸",
        "Capturando tu esencia (o eso intento)...",
        "Dibujando como Picasso en lunes...",
        "¡Ya mero! Solo falta el bigote... 🥸",
      ];

      let index = 0;
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
      // REAL API CALL — now returns GenerationResult object
      const result = await transformToToddlerCaricature(
        originalImage,
        keyToUse,
        toddlerIntensity,
        applySilkscreenFilter,
      );

      // Apply watermark if enabled
      const finalImage = showWatermark
        ? await ImageService.applyWatermark(result.imageDataUrl)
        : result.imageDataUrl;
      setGeneratedImage(finalImage);

      // Store generation metadata in context for feedback
      setGenerationMetadata({
        detectedFeatures: result.detectedFeatures,
        detectedGender: result.detectedGender,
        promptVersion: result.promptVersion,
        modelUsed: result.modelUsed,
      });

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
          <div
            style={{ width: "100%", display: "flex", flexDirection: "column" }}
          >
            {originalImage && (
              <img
                src={originalImage}
                alt="Tu foto"
                className="transformation-preview"
              />
            )}

            {showIntensitySlider && (
              <div className="intensity-slider-section">
                <label htmlFor="toddler-slider">Nivel de Filtro</label>
                <div className="slider-control">
                  <span className="slider-label">
                    0%
                    <br />
                    <small>(Adulto)</small>
                  </span>
                  <input
                    id="toddler-slider"
                    type="range"
                    min="0"
                    max="100"
                    step="25"
                    value={toddlerIntensity}
                    onChange={(e) => setToddlerIntensity(Number(e.target.value))}
                    disabled={isProcessing}
                    className="toddler-slider"
                  />
                  <span className="slider-label">
                    100%
                    <br />
                    <small>(Bebé)</small>
                  </span>
                </div>
                <p className="intensity-description">
                  {toddlerIntensity === 100 &&
                    "Bebé original ✨ (Cachetones, ojitos tiernos — el que te latió)."}
                  {toddlerIntensity === 75 &&
                    "Suave (Más parecido a la persona, toque juvenil sutil)."}
                  {toddlerIntensity === 50 &&
                    "Caricatura (Rasgos exagerados, sin filtro bebé)."}
                  {toddlerIntensity === 25 &&
                    "Adulto fiel (Igualito, sin suavizar nada)."}
                  {toddlerIntensity === 0 &&
                    "Transferencia directa (Tu cara exacta sobre el cuerpo)."}
                </p>
              </div>
            )}
          </div>
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

      {isProcessing && (
        <div className="processing-overlay">
          <div className="rocket-container">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="rocket-svg"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.48-.56.95-1.12 1.43-1.68" />
              <path d="M12 15l-3 3" />
              <path d="M15 12l-3 3" />
              <path d="M16.5 4.5l3 3" />
              <path
                d="M20.5 3.5a1 1 0 0 0-1-1c-5 0-10 6-10 10 0 4 6 10 10 10a1 1 0 0 0 1-1c0-5-6-10-10-10"
                fill="white"
              />
            </svg>
          </div>
          <div className="smoke-trail">
            {/* Simple static smoke particles for effect */}
            <div
              className="smoke-particle"
              style={{
                left: "20%",
                top: "80%",
                width: 50,
                height: 50,
                animationDelay: "0.2s",
              }}
            ></div>
            <div
              className="smoke-particle"
              style={{
                left: "50%",
                top: "50%",
                width: 80,
                height: 80,
                animationDelay: "1.2s",
              }}
            ></div>
            <div
              className="smoke-particle"
              style={{
                left: "80%",
                top: "20%",
                width: 60,
                height: 60,
                animationDelay: "2.2s",
              }}
            ></div>
          </div>
          <p className="loading-phrase">{loadingPhrase}</p>
        </div>
      )}

      {!isProcessing && error && <div className="error-message">{error}</div>}
    </div>
  );
}
