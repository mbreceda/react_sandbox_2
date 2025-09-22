import { useState } from "react";
import { useCountdownContext } from "../hooks/useCountdownContext";

/**
 * Controls for the countdown timer
 */
const CountdownControls = () => {
  const { counter, isRunning, startTimer, pauseTimer, resetTimer } =
    useCountdownContext();

  const [inputValue, setInputValue] = useState(counter.toString());

  // Update input value only when the timer is reset (not running)
  //   useEffect(() => {
  //     if (!isRunning) {
  //       setInputValue(counter.toString());
  //     }
  //   }, [counter, isRunning]);

  const handleCountdownChange = (value: string) => {
    setInputValue(value);
  };

  const handleSetCountdown = () => {
    const newValue = parseInt(inputValue, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      resetTimer(newValue);
    }
  };

  // Toggle between start and pause
  const handleToggleTimer = () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };

  return (
    <div className="flex flex-row items-center mt-4 w-full space-x-2">
      <input
        className="mt-4 p-2 border rounded flex-1"
        type="text"
        value={inputValue}
        onChange={(e) => handleCountdownChange(e.target.value)}
      />
      <button
        className={`mt-4 p-2 ${isRunning ? "bg-yellow-500" : "bg-green-500"} text-white rounded`}
        onClick={handleToggleTimer}
      >
        {isRunning ? "PAUSE" : "START"}
      </button>
      <button
        className="mt-4 p-2 bg-blue-500 text-white rounded"
        onClick={handleSetCountdown}
      >
        SET
      </button>
    </div>
  );
};

export default CountdownControls;
