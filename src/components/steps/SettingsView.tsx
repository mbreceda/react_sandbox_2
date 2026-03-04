import { useSettings } from "../../context/SettingsContext";
import "./SettingsView.css";

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { showIntensitySlider, showFeedback, showWatermark, applySilkscreenFilter, setSetting } = useSettings();

  return (
    <div className="settings-view animate-in">
      <div className="settings-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h2>Ajustes</h2>
        <p>Configura tu experiencia</p>
      </div>

      <div className="settings-content custom-scrollbar">
        <div className="settings-group">
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🎚️</span>
              <div>
                <h3>Termómetro Toddler</h3>
                <p>Slider para ajustar la intensidad del filtro bebé (0-100%)</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showIntensitySlider}
                onChange={(e) => setSetting("showIntensitySlider", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">📊</span>
              <div>
                <h3>Feedback</h3>
                <p>Mostrar botones de 👍/👎 después de generar una caricatura</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showFeedback}
                onChange={(e) => setSetting("showFeedback", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">✍️</span>
              <div>
                <h3>Firma</h3>
                <p>Agregar logo de Fred Breceda al resultado final</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showWatermark}
                onChange={(e) => setSetting("showWatermark", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-icon">🎨</span>
              <div>
                <h3>Filtro Serigrafía</h3>
                <p>Aplicar efecto de impresión silkscreen al resultado</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={applySilkscreenFilter}
                onChange={(e) => setSetting("applySilkscreenFilter", e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <p>Los ajustes se guardan automáticamente 💾</p>
      </div>
    </div>
  );
}
