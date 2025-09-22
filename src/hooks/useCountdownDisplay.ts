import { useState, useCallback } from "react";
import { useCountdownContext } from "./useCountdownContext";

/**
 * Custom hook for managing the countdown display logic within CountdownProvider
 *
 * NOTE: This hook MUST be used inside a component that is a child of CountdownProvider
 */
export const useCountdownDisplay = () => {
  const {
    counter,
    isRunning,
    startTimer: contextStartTimer,
    pauseTimer: contextPauseTimer,
    resetTimer: contextResetTimer,
  } = useCountdownContext();

  // We track UI state separate from timer state
  const [pause, setPause] = useState(!isRunning);

  const countDownFinished = useCallback(() => {
    console.log("Countdown finished!");
  }, []);

  // Timer control functions using context
  const startTimer = useCallback(() => {
    contextStartTimer();
    setPause(false);
  }, [contextStartTimer]);

  const pauseTimer = useCallback(() => {
    contextPauseTimer();
    setPause(true);
  }, [contextPauseTimer]);

  const resetTimer = useCallback(
    (newValue: number = 0) => {
      contextResetTimer(newValue);
    },
    [contextResetTimer],
  );

  // Function to handle setting a new countdown value
  const handleSetCountdown = useCallback(
    (newValue: number) => {
      contextResetTimer(newValue);
    },
    [contextResetTimer],
  );

  return {
    // State from context
    counter,
    isRunning,

    // Local UI state
    pause,

    // Callbacks
    countDownFinished,
    startTimer,
    pauseTimer,
    resetTimer,
    handleSetCountdown,
  };
};

export default useCountdownDisplay;
