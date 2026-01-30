import { useWizard } from "../context/WizardContext";
import { PhotoCapture } from "./steps/PhotoCapture";
import { TransformationStep } from "./steps/TransformationStep";
import { ResultView } from "./steps/ResultView";
import "./PhotoboothWizard.css";

const STEPS = [
  { number: 1, label: "Foto" },
  { number: 2, label: "Magia" },
  { number: 3, label: "Resultado" },
];

export function PhotoboothWizard() {
  const { currentStep } = useWizard();

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
      {/* SVG Filter for Green Screen Removal */}

      {/* Decorative dots - removed in CSS but keeping structure clean */}
      {/* <div className="wizard-background-overlay" /> */}

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
        {/* <p className="wizard-subtitle">
          Transforma tu foto en una divertida caricatura
        </p> */}
      </header>

      {/* <nav className="wizard-progress">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className={`progress-step ${currentStep === step.number ? "active" : ""
              } ${currentStep > step.number ? "completed" : ""}`}
          >
            <div className="progress-indicator">
              {currentStep > step.number ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                >
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span className="progress-label">{step.label}</span>
          </div>
        ))}
        <div className="progress-line">
          <div
            className="progress-line-fill"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>
      </nav> */}

      <main className="wizard-content">
        {/* Hand Overlays - Moved inside to stick to the card */}
        <div className="hand-overlay hand-left" />
        <div className="hand-overlay hand-right" />

        {/* Animated Step Container */}
        <div key={currentStep} className="step-transition">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
