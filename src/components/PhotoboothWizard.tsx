import { useWizard } from "../context/WizardContext";
import { PhotoCapture } from "./steps/PhotoCapture";
import { TransformationStep } from "./steps/TransformationStep";
import { ResultView } from "./steps/ResultView";
import { GalleryView } from "./steps/GalleryView";
import { SettingsView } from "./steps/SettingsView";
import { useState } from "react";
import "./PhotoboothWizard.css";

type ActiveView = "wizard" | "gallery" | "settings";

export function PhotoboothWizard() {
  const { currentStep } = useWizard();
  const [activeView, setActiveView] = useState<ActiveView>("wizard");

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PhotoCapture />;
      case 2:
        return <TransformationStep />;
      case 3:
        return <ResultView />;
      default:
        return <PhotoCapture />;
    }
  };

  return (
    <div className="photobooth-wizard">
      <header className="wizard-header">
        <h1 className="wizard-title">
          <span className="title-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              width="40"
              height="40"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </span>
          <div className="title-text-container">
            <span>PHOTOBOOTH</span>
            <span className="by-label">BY</span>
          </div>
          <img
            src="/assets/fred-breceda.png"
            alt="Fred Breceda"
            className="title-logo"
          />
        </h1>
        <div className="header-nav-icons">
          <button
            className={`nav-icon-btn ${activeView === "gallery" ? "active" : ""}`}
            onClick={() => setActiveView(activeView === "gallery" ? "wizard" : "gallery")}
            title="Hall of Fame"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className={`nav-icon-btn ${activeView === "settings" ? "active" : ""}`}
            onClick={() => setActiveView(activeView === "settings" ? "wizard" : "settings")}
            title="Ajustes"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="wizard-content">
        {/* Hand Overlays */}
        <div className="hand-overlay hand-left" />
        <div className="hand-overlay hand-right" />

        {/* Animated Step Container */}
        <div key={activeView === "wizard" ? currentStep : activeView} className="step-transition">
          {activeView === "gallery" ? (
            <GalleryView onBack={() => setActiveView("wizard")} />
          ) : activeView === "settings" ? (
            <SettingsView onBack={() => setActiveView("wizard")} />
          ) : (
            renderStep()
          )}
        </div>
      </main>
    </div>
  );
}
