import { createContext } from "react";

// Define types for the context
export interface CountdownContextType {
  counter: number;
  isRunning: boolean;
  initialValue: number;
  progress: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (value?: number) => void;
}

// Create the context with a default undefined value
export const CountdownContext = createContext<CountdownContextType | undefined>(
  undefined,
);
