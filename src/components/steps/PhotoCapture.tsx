import { useRef, useState, useCallback, useEffect } from "react";
import { useWizard } from "../../context/WizardContext";
import "./PhotoCapture.css";

export function PhotoCapture() {
  const { setOriginalImage, goNext } = useWizard();
  const [preview, setPreview] = useState<string | null>(null);
  const [isCamera, setIsCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Assign stream to video element when both are ready
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCamera]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setIsCamera(true);
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
      );
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Flip horizontally to correct mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        setPreview(dataUrl);

        // Stop camera immediately after capture
        if (videoRef.current.srcObject) {
          const tracks = (
            videoRef.current.srcObject as MediaStream
          ).getTracks();
          tracks.forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setStream(null);
        setIsCamera(false);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCamera(false);
  }, [stream]);

  const handleConfirm = () => {
    if (preview) {
      setOriginalImage(preview);
      goNext();
    }
  };

  const handleRetake = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="photo-capture">
      <div className="step-header">
        <span className="step-number">1</span>
        <div className="step-info">
          <h2>Capturar Modelo</h2>
          <p>Sube una referencia o posa para el artista</p>
        </div>
      </div>

      <div className="capture-area">
        {!preview && !isCamera && (
          <div className="capture-options animate-in">
            <button
              className="capture-btn upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Subir Referencia</span>
            </button>

            <button className="capture-btn camera-btn" onClick={startCamera}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Posar Ahora</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden-input"
            />
          </div>
        )}

        {isCamera && !preview && (
          <div className="camera-view animate-in">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-preview"
            />
            <div className="camera-controls">
              <button className="action-btn cancel-btn" onClick={stopCamera}>
                Cancelar Salida
              </button>
              <button
                className="action-btn capture-photo-btn"
                onClick={capturePhoto}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {preview && (
          <div className="preview-container animate-in">
            <img src={preview} alt="Preview" className="image-preview" />
            <div className="preview-actions">
              <button
                className="action-btn secondary-btn"
                onClick={handleRetake}
              >
                Buscar otra pose
              </button>
              <button
                className="action-btn primary-btn"
                onClick={handleConfirm}
              >
                Confirmar Modelo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
