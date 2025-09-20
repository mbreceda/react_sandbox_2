import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

interface CountDownProps {
  init: number | null;
  onDecrement?: (value: number) => void;
  onComplete?: () => void;
  autoStart?: boolean; // Optional prop to control automatic starting
}

const CountDown = forwardRef(
  (
    { init = null, onDecrement, onComplete, autoStart = false }: CountDownProps,
    ref,
  ) => {
    const [counter, setCounter] = useState(0); // State to track the countdown value
    const [isRunning, setIsRunning] = useState(autoStart); // State to control when countdown is active
    const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer ID

    // Initial setup when component mounts or init prop changes
    useEffect(() => {
      // Clear any existing timer first
      clearTimerInternal();
      // Set the counter to the initial value
      setCounter(init || 0);
      // Only start automatically if autoStart is true
      setIsRunning(autoStart);
    }, [init, autoStart]); // Depend on init and autoStart props

    // Clear the timer and reset state - internal function
    const clearTimerInternal = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      clearTimer: () => {
        clearTimerInternal();
        setCounter(0);
        setIsRunning(false);
      },
      startTimer: () => {
        setIsRunning(true);
      },
      pauseTimer: () => {
        setIsRunning(false);
        clearTimerInternal();
      },
    }));

    const doCountdown = () => {
      return setTimeout(() => {
        setCounter((prev) => prev - 1);
      }, 1000);
    };

    const processCountdown = () => {
      // Call onDecrement when counter changes
      if (onDecrement) {
        onDecrement(counter);
      }
      // Call onComplete when counter reaches 0
      if (counter === 0 && onComplete) {
        onComplete();
      }
    };

    const startCounter = () => {
      // Only start countdown if counter is positive AND isRunning is true
      if (counter > 0 && isRunning) {
        // Set a timer to decrement counter every second
        timerRef.current = doCountdown();
        // Clean up timer when component unmounts or counter changes
        return () => clearTimerInternal();
      }
    };

    // Start the countdown process
    useEffect(() => {
      startCounter();
    }, [counter, isRunning]); // Depend on counter value and running state

    // Handle side effects when counter changes
    useEffect(() => {
      processCountdown();
    }, [counter, onDecrement, onComplete]);

    return <span className="text-2xl font-bold">{counter}</span>;
  },
);

export default CountDown;
