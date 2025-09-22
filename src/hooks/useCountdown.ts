import { useState, useRef, useEffect, useCallback, useMemo } from "react";

interface UseCountdownProps {
  initialValue?: number | null;
  autoStart?: boolean;
  onDecrement?: (value: number) => void;
  onComplete?: () => void;
}

interface UseCountdownReturn {
  counter: number;
  isRunning: boolean;
  initialValue: number;
  progress: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (newValue?: number) => void;
}

/**
 * Custom hook for countdown timer functionality
 * @param initialValue The initial countdown value
 * @param autoStart Whether to start the countdown automatically
 * @param onDecrement Callback when counter decrements
 * @param onComplete Callback when counter reaches zero
 */
export const useCountdown = ({
  initialValue = 0,
  autoStart = false,
  onDecrement,
  onComplete,
}: UseCountdownProps = {}): UseCountdownReturn => {
  // State to track the countdown value, running status, and current initial value
  const [counter, setCounter] = useState(initialValue || 0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [currentInitialValue, setCurrentInitialValue] = useState(
    initialValue || 0,
  );

  // Ref to store the timer ID
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear the timer - internal function
  const clearTimerInternal = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start the countdown
  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Pause the countdown
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    clearTimerInternal();
  }, [clearTimerInternal]);

  // Reset the countdown to a new value
  const resetTimer = useCallback(
    (newValue?: number) => {
      clearTimerInternal();
      setIsRunning(false);
      const valueToSet = newValue !== undefined ? newValue : initialValue || 0;
      setCounter(valueToSet);
      setCurrentInitialValue(valueToSet); // Also update the current initial value
    },
    [clearTimerInternal, initialValue],
  );

  // Reset counter when initialValue changes
  useEffect(() => {
    clearTimerInternal();
    const valueToSet = initialValue || 0;
    setCounter(valueToSet);
    setCurrentInitialValue(valueToSet);
    setIsRunning(autoStart);
  }, [initialValue, autoStart, clearTimerInternal]);

  // DO COUNTDOWN
  // Handle the countdown timer
  useEffect(() => {
    // Only start countdown if counter is positive AND isRunning is true
    if (counter > 0 && isRunning) {
      timerRef.current = setTimeout(() => {
        setCounter((prev) => prev - 1);
      }, 1000);

      // Clean up timer when component unmounts or counter changes
      return () => clearTimerInternal();
    }
  }, [counter, isRunning, clearTimerInternal]);

  // PROCESS COUNTDOWN
  // Handle side effects when counter changes
  useEffect(() => {
    // Call onDecrement when counter changes
    if (onDecrement) {
      onDecrement(counter);
    }

    // Call onComplete when counter reaches 0
    if (counter === 0 && onComplete) {
      onComplete();
    }
  }, [counter, onDecrement, onComplete]);

  // Calculate progress based on counter and current initial value
  const progress = useMemo(() => {
    if (currentInitialValue > 0) {
      return Math.max(
        0,
        Math.min(
          100,
          ((currentInitialValue - counter) / currentInitialValue) * 100,
        ),
      );
    }
    return 0;
  }, [counter, currentInitialValue]);

  return {
    counter,
    isRunning,
    initialValue: currentInitialValue,
    progress,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};

export default useCountdown;
