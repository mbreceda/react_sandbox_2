import { ReactNode } from "react";
import useCountdown from "../hooks/useCountdown";
import { CountdownContext } from "./CountdownContextTypes";

export interface CountdownProviderProps {
  children: ReactNode;
  initialValue: number | null;
  autoStart?: boolean;
  onDecrement?: (value: number) => void;
  onComplete?: () => void;
}

// Only export the provider component from this file
const CountdownProvider = ({
  children,
  initialValue,
  autoStart = false,
  onDecrement,
  onComplete,
}: CountdownProviderProps) => {
  const {
    counter,
    isRunning,
    initialValue: initValue,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useCountdown({
    initialValue,
    autoStart,
    onDecrement,
    onComplete,
  });

  return (
    <CountdownContext.Provider
      value={{
        counter,
        isRunning,
        initialValue: initValue,
        progress,
        startTimer,
        pauseTimer,
        resetTimer,
      }}
    >
      {children}
    </CountdownContext.Provider>
  );
};

export default CountdownProvider;
