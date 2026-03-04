import { useRef, useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import getCroppedImg from "../../utils/cropUtils";
import { useWizard } from "../../context/WizardContext";
import "./PhotoCapture.css";

export function PhotoCapture() {
  const { setOriginalImage, goNext } = useWizard();

  // Stages
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Raw input
  const [preview, setPreview] = useState<string | null>(null);   // Final cropped

  // Camera state
  const [isCamera, setIsCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Go to bottom of page
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);


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
        setImageSrc(result); // Show cropper
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      // Prioritize environment facing mode for back camera on mobile if needed, 
      // but 'user' is good for selfies.
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 }, // Higher res for crop
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

        // Stop camera
        stopCamera();

        // Send to cropper
        setImageSrc(dataUrl);
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

  const onCropComplete = useCallback((_formattedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          0
        );
        setPreview(croppedImage);
        setImageSrc(null); // Hide cropper, show preview/confirm
      } catch (e) {
        console.error(e);
      }
    }
  }, [imageSrc, croppedAreaPixels]);

  const handleConfirm = () => {
    if (preview) {
      setOriginalImage(preview);
      goNext();
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelCrop = () => {
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="photo-capture" ref={containerRef}>
      <div className="step-header">
        <span className="step-number">1</span>
        <div className="step-info">
          <h2>Capturar Modelo</h2>
          <p>Sube una referencia o posa para el artista</p>
        </div>
      </div>

      <div className="capture-area">
        {/* State 1: Selection Buttons */}
        {!imageSrc && !preview && !isCamera && (
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

            <img
              src="/assets/clown-vector.png"
              alt=""
              className="capture-mascot"
              aria-hidden="true"
            />
          </div>
        )}

        {/* State 2: Camera Active */}
        {isCamera && (
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
                Cancelar
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

        {/* State 3: Cropper */}
        {imageSrc && (
          <div className="cropper-container animate-in">
            <div className="cropper-wrapper">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4} // Standard portrait aspect ratio
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="cropper-controls">
              <p className="instruction-text">Ajusta el recuadro a tu rostro</p>
              <div className="slider-container">
                <span>-</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="zoom-slider"
                />
                <span>+</span>
              </div>
              <div className="cropper-actions">
                <button className="action-btn secondary-btn" onClick={handleCancelCrop}>
                  Cancelar
                </button>
                <button className="action-btn primary-btn" onClick={showCroppedImage}>
                  Recortar y Usar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 4: Final Preview Confirmation */}
        {preview && (
          <div className="preview-container animate-in">
            <img src={preview} alt="Preview" className="image-preview" />
            <div className="preview-actions">
              <button
                className="action-btn secondary-btn"
                onClick={handleRetake}
              >
                Volver a intentar
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
