import { createContext, useContext, useState, ReactNode } from "react";
import type { GenerationResult, Gender } from "../services/geminiService";

export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardState {
  originalImage: string | null;
  filteredImage: string | null;
  generatedImage: string | null;
  currentStep: WizardStep;
  isProcessing: boolean;
  apiKey: string;
  generationMetadata: Omit<GenerationResult, "imageDataUrl"> | null;
  dbRecordId: string | null; // ID of the DynamoDB record for this generation
  toddlerIntensity: number; // 0 to 100
}

interface WizardContextType extends WizardState {
  setOriginalImage: (image: string | null) => void;
  setFilteredImage: (image: string | null) => void;
  setGeneratedImage: (image: string | null) => void;
  setCurrentStep: (step: WizardStep) => void;
  setIsProcessing: (processing: boolean) => void;
  setApiKey: (key: string) => void;
  setGenerationMetadata: (
    meta: Omit<GenerationResult, "imageDataUrl"> | null,
  ) => void;
  setDbRecordId: (id: string | null) => void;
  setToddlerIntensity: (intensity: number) => void;
  // Convenience getter
  detectedGender: Gender | null;
  reset: () => void;
  regenerate: () => void;
  goNext: () => void;
  goBack: () => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

const initialState: WizardState = {
  originalImage: null,
  filteredImage: null,
  generatedImage: null,
  currentStep: 1,
  isProcessing: false,
  apiKey: "",
  generationMetadata: null,
  dbRecordId: null,
  toddlerIntensity: 100,
};

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);

  const setOriginalImage = (image: string | null) =>
    setState((prev) => ({ ...prev, originalImage: image }));

  const setFilteredImage = (image: string | null) =>
    setState((prev) => ({ ...prev, filteredImage: image }));

  const setGeneratedImage = (image: string | null) =>
    setState((prev) => ({ ...prev, generatedImage: image }));

  const setCurrentStep = (step: WizardStep) =>
    setState((prev) => ({ ...prev, currentStep: step }));

  const setIsProcessing = (processing: boolean) =>
    setState((prev) => ({ ...prev, isProcessing: processing }));

  const setApiKey = (key: string) =>
    setState((prev) => ({ ...prev, apiKey: key }));

  const setGenerationMetadata = (
    meta: Omit<GenerationResult, "imageDataUrl"> | null,
  ) => setState((prev) => ({ ...prev, generationMetadata: meta }));

  const setDbRecordId = (id: string | null) =>
    setState((prev) => ({ ...prev, dbRecordId: id }));

  const setToddlerIntensity = (intensity: number) =>
    setState((prev) => ({ ...prev, toddlerIntensity: intensity }));

  const reset = () => setState(initialState);

  const regenerate = () =>
    setState((prev) => ({
      ...prev,
      generatedImage: null,
      generationMetadata: null,
      dbRecordId: null,
      currentStep: 2 as WizardStep,
    }));

  const goNext = () =>
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4) as WizardStep,
    }));

  const goBack = () =>
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1) as WizardStep,
    }));

  return (
    <WizardContext.Provider
      value={{
        ...state,
        setOriginalImage,
        setFilteredImage,
        setGeneratedImage,
        setCurrentStep,
        setIsProcessing,
        setApiKey,
        setGenerationMetadata,
        setDbRecordId,
        setToddlerIntensity,
        // Derived convenience value so consumers don't need to dig into metadata
        detectedGender: state.generationMetadata?.detectedGender ?? null,
        reset,
        regenerate,
        goNext,
        goBack,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
