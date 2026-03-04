import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useWizard } from "../../context/WizardContext";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import { StorageService } from "../../services/StorageService";
import { useSettings } from "../../context/SettingsContext";
import "./ResultView.css";

const client = generateClient<Schema>();

const FEEDBACK_TAGS = [
  { id: "good_likeness", label: "¡Me reconocen! 😄" },
  { id: "good_style", label: "Estilo chido 🎨" },
  { id: "good_pose", label: "La pose quedó bien 🤙" },
  { id: "wrong_likeness", label: "No me parezco 🤔" },
  { id: "wrong_style", label: "Estilo incorrecto ✏️" },
  { id: "wrong_pose", label: "Pose incorrecta 🙅" },
  { id: "too_much_shading", label: "Mucha sombra 🌑" },
  { id: "missing_features", label: "Le falta algo 🧐" },
];

export function ResultView() {
  const {
    originalImage,
    generatedImage,
    generationMetadata,
    toddlerIntensity,
    dbRecordId,
    setDbRecordId,
    reset,
    regenerate,
    setCurrentStep,
  } = useWizard();

  const { showFeedback } = useSettings();

  const [showHomeConfirm, setShowHomeConfirm] = useState(false);

  // Feedback state
  const [rating, setRating] = useState<"thumbs_up" | "thumbs_down" | null>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Track if the DB log has been created yet
  const dbLogCreated = useRef(false);
  // Store feedback submitted before the DB record ID was ready
  const pendingFeedback = useRef<{ rating: string; tags: string[] } | null>(
    null,
  );

  useEffect(() => {
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Save to S3 + DynamoDB on mount (once)
  useEffect(() => {
    if (originalImage && generatedImage && !dbLogCreated.current) {
      dbLogCreated.current = true;
      StorageService.saveSessionImages(originalImage, generatedImage).then(
        (res) => {
          if (res.success && res.originalPath && res.generatedPath) {
            console.log("Backup complete:", res.sessionId);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (client.models.GenerationLog.create as any)({
              sessionId: res.sessionId,
              originalImageKey: res.originalPath,
              generatedImageKey: res.generatedPath,
              promptVersion: generationMetadata?.promptVersion ?? "",
              modelUsed: generationMetadata?.modelUsed ?? "",
              metadata: JSON.stringify({
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                timestamp: new Date().toISOString(),
                detectedFeatures: generationMetadata?.detectedFeatures ?? "",
                toddlerIntensity: toddlerIntensity,
              }),
            })
              .then((dbRes) => {
                if (dbRes?.data?.id) {
                  const newId = dbRes.data.id;
                  setDbRecordId(newId);
                  console.log("DB record created:", newId);

                  // Flush any feedback that was submitted before the ID was ready
                  if (pendingFeedback.current) {
                    const { rating: pr, tags: pt } = pendingFeedback.current;
                    pendingFeedback.current = null;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (client.models.GenerationLog.update as any)({
                      id: newId,
                      rating: pr,
                      feedbackTags: JSON.stringify(pt),
                    })
                      .then(() => {
                        console.log("Pending feedback flushed:", { pr, pt });
                        setFeedbackSaved(true);
                        setFeedbackSaving(false);
                      })
                      .catch((err) => {
                        console.error("Pending feedback flush failed:", err);
                        setFeedbackSaving(false);
                      });
                  }
                }
              })
              .catch((dbErr) => console.error("Database log failed:", dbErr));
          }
        },
      );
    }
  }, [originalImage, generatedImage]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  const handleRating = (newRating: "thumbs_up" | "thumbs_down") => {
    setRating(newRating);
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!rating) return;

    setFeedbackSaving(true);

    // If the DB record isn't ready yet, queue the feedback and close immediately
    if (!dbRecordId) {
      pendingFeedback.current = { rating, tags: selectedTags };
      setFeedbackSaved(true);
      setShowFeedbackModal(false);
      setFeedbackSaving(false);
      console.log("Feedback queued (DB not ready yet)");
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (client.models.GenerationLog.update as any)({
        id: dbRecordId,
        rating,
        feedbackTags: JSON.stringify(selectedTags),
      });
      console.log("Feedback saved:", { rating, tags: selectedTags });
    } catch (err) {
      console.error("Feedback save failed:", err);
    } finally {
      // Always close modal and show thanks regardless of success/error
      setFeedbackSaved(true);
      setShowFeedbackModal(false);
      setFeedbackSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `caricatura-toddler-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const file = new File([blob], "caricatura-toddler.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Mi Caricatura Toddler",
          text: "¡Mira mi caricatura estilo toddler!",
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

  const handleNewPhoto = () => reset();

  return (
    <div className="result-view">
      <div className="step-header">
        <span className="step-number success">✓</span>
        <div className="step-info">
          <h2>¡Tu Retrato está Listo!</h2>
          <p>Una obra maestra digna de galería</p>
        </div>
      </div>

      <div className="result-content">
        <div className="hero-container">
          {generatedImage && (
            <div className="comparison-item hero-item">
              <span className="comparison-label hero-label">Obra Final</span>
              <img
                src={generatedImage}
                alt="Caricatura generada"
                className="comparison-image hero-image"
              />
              {originalImage && (
                <div className="reference-thumbnail">
                  <span className="comparison-label thumb-label">Modelo</span>
                  <img
                    src={originalImage}
                    alt="Original"
                    className="comparison-image thumb-image"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── FEEDBACK SECTION — hidden after submit or if disabled ── */}
      {showFeedback && !feedbackSaved && (
        <div className="feedback-section">
          <p className="feedback-prompt">¿Qué onda con el resultado?</p>
          <div className="feedback-rating-row">
            <button
              id="feedback-thumbs-up"
              className={`feedback-thumb-btn ${rating === "thumbs_up" ? "active-up" : ""}`}
              onClick={() => handleRating("thumbs_up")}
              title="Buen resultado"
            >
              👍
            </button>
            <button
              id="feedback-thumbs-down"
              className={`feedback-thumb-btn ${rating === "thumbs_down" ? "active-down" : ""}`}
              onClick={() => handleRating("thumbs_down")}
              title="Mal resultado"
            >
              👎
            </button>
          </div>
        </div>
      )}

      {/* ── FEEDBACK MODAL ── */}
      {showFeedbackModal && rating && (
        <div
          className="modal-overlay"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="modal-content feedback-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="feedback-modal-title">
              {rating === "thumbs_up"
                ? "¡Qué chido! ¿Qué quedó bien?"
                : "Uy 😅 ¿Qué salió mal?"}
            </p>
            <div className="feedback-tags">
              {FEEDBACK_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  id={`feedback-tag-${tag.id}`}
                  className={`feedback-tag-btn ${selectedTags.includes(tag.id) ? "selected" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            <div className="feedback-modal-actions">
              <button
                className="feedback-modal-skip"
                onClick={handleSubmitFeedback}
                disabled={feedbackSaving}
              >
                Omitir
              </button>
              <button
                id="feedback-submit"
                className="feedback-submit-btn"
                onClick={handleSubmitFeedback}
                disabled={feedbackSaving}
              >
                {feedbackSaving ? "Guardando..." : "Enviar →"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="result-actions">
        <button
          className="action-btn secondary-btn icon-only-btn"
          onClick={() => setShowHomeConfirm(true)}
          title="Volver al Inicio"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        <button
          className="action-btn share-btn icon-only-btn"
          onClick={handleShare}
          title="Compartir"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        <button
          className="action-btn primary-btn download-btn icon-only-btn"
          onClick={handleDownload}
          title="Descargar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <button
          className="action-btn primary-btn icon-only-btn"
          onClick={regenerate}
          title="Regenerar con la misma foto"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 2v6h6" />
            <path d="M2.66 15.57a10 10 0 1 0 .57-8.38" />
          </svg>
        </button>
      </div>


      {showHomeConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Volver al Inicio?</h3>
            <p>Se borrará tu foto actual y el retrato.</p>
            <div className="modal-actions">
              <button
                className="action-btn secondary-btn"
                onClick={() => setShowHomeConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="action-btn danger-btn"
                onClick={() => {
                  setShowHomeConfirm(false);
                  handleNewPhoto();
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
