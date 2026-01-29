import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useWizard } from "../../context/WizardContext";
import "./ResultView.css";

export function ResultView() {
  const { originalImage, generatedImage, reset, setCurrentStep } = useWizard();

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
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
      // Convert base64 to blob
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
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("¡Imagen copiada al portapapeles!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleNewPhoto = () => {
    reset();
  };

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
        <div className="comparison-view">
          {originalImage && (
            <div className="comparison-item">
              <span className="comparison-label">Modelo</span>
              <img
                src={originalImage}
                alt="Original"
                className="comparison-image"
              />
            </div>
          )}

          {generatedImage && (
            <div className="comparison-item featured">
              <span className="comparison-label">Obra Final</span>
              <img
                src={generatedImage}
                alt="Caricatura generada"
                className="comparison-image caricature"
              />
            </div>
          )}
        </div>
      </div>

      <div className="result-actions">
        <button className="action-btn secondary-btn icon-only-btn" onClick={handleNewPhoto} title="Nueva Pose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 10 4 15 9 20" />
            <path d="M20 4v7a4 4 0 0 1-4 4H4" />
          </svg>
        </button>

        <button className="action-btn share-btn icon-only-btn" onClick={handleShare} title="Compartir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        <button className="action-btn primary-btn email-btn icon-only-btn" onClick={() => window.location.href = `mailto:?subject=Mi Caricatura&body=Mira mi resultado!`} title="Enviar por Correo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </button>

        <button className="action-btn danger-btn icon-only-btn" onClick={() => setCurrentStep(2)} title="Borrador y Nuevo Intento">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 2v6h6" />
            <path d="M2.66 15.57a10 10 0 1 0 .57-8.38" />
          </svg>
        </button>
      </div>

      {/* Secondary text links removed as they are now icons above */}
    </div>
  );
}
