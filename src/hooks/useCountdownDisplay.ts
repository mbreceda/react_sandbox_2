import { useState, useRef, useCallback } from "react";

/**
 * Custom hook for managing the countdown display logic
 * @param initialValue Initial countdown value
 */
export const useCountdownDisplay = (initialValue = 15) => {
  const [counterProgress, setCounterProgress] = useState(0);
  const [totalCountdown, setTotalCountdown] = useState(initialValue);
  const [pause, setPause] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const countDownRef = useRef(null);

  // Update progress based on countdown value
  const updateProgress = useCallback(
    (value: number) => {
      setCounterProgress(((totalCountdown - value) / totalCountdown) * 100);
    },
    [totalCountdown],
  );

  const countDownFinished = useCallback(() => {
    console.log("Countdown finished!");
  }, []);

  // Timer control functions
  const clearTimer = useCallback(() => {
    if (countDownRef.current && countDownRef.current.clearTimer) {
      countDownRef.current.clearTimer();
    }
  }, []);

  const startTimer = useCallback(() => {
    if (countDownRef.current && countDownRef.current.startTimer) {
      countDownRef.current.startTimer();
      setPause(false);
    }
  }, []);

  const pauseTimer = useCallback(() => {
    if (countDownRef.current && countDownRef.current.pauseTimer) {
      countDownRef.current.pauseTimer();
      setPause(true);
    }
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    // Force a reset by incrementing the key
    setResetKey((prev) => prev + 1);
    // Reset progress
    setCounterProgress(0);
  }, [clearTimer]);

  // Function to handle countdown value change
  const handleCountdownChange = useCallback((value: number) => {
    setTotalCountdown(Number(value));
  }, []);

  return {
    // State
    counterProgress,
    totalCountdown,
    pause,
    resetKey,
    countDownRef,

    // Callbacks
    updateProgress,
    countDownFinished,
    startTimer,
    pauseTimer,
    resetTimer,
    handleCountdownChange,
  };
};

export default useCountdownDisplay;
