import { forwardRef, useImperativeHandle } from "react";
import useCountdown from "../hooks/useCountdown";

interface CountDownProps {
  init: number | null;
  onDecrement?: (value: number) => void;
  onComplete?: () => void;
  autoStart?: boolean; // Optional prop to control automatic starting
}

/**
 * CountDown component that displays and manages a countdown timer
 */
const CountDown = forwardRef(
  (
    { init = null, onDecrement, onComplete, autoStart = false }: CountDownProps,
    ref,
  ) => {
    // Use our custom countdown hook for all timer logic
    const { counter, startTimer, pauseTimer, resetTimer } = useCountdown({
      initialValue: init,
      autoStart,
      onDecrement,
      onComplete,
    });

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      clearTimer: () => {
        resetTimer(0);
      },
      startTimer: () => {
        startTimer();
      },
      pauseTimer: () => {
        pauseTimer();
      },
    }));

    return <span className="text-2xl font-bold">{counter}</span>;
  },
);

export default CountDown;
