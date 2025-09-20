import { useState, useRef } from "react";
import ProgressBar from "./ProgressBar";
import CountDown from "./CountDown";

function Display() {
  const [counterProgress, setCounterProgress] = useState(0);
  const [totalCountdown, setTotalCountdown] = useState(15);
  const [pause, setPause] = useState(false);
  // Add a key to force full remount of CountDown when needed
  const [resetKey, setResetKey] = useState(0);

  // Update progress based on countdown value
  const updateProgress = (value: number) => {
    setCounterProgress(((totalCountdown - value) / totalCountdown) * 100);
  };

  const countDownFinished = () => {
    console.log("Countdown finished!");
  };

  const clearTimer = () => {
    if (countDownRef.current && countDownRef.current.clearTimer) {
      countDownRef.current.clearTimer();
    }
  };

  const startTimer = () => {
    if (countDownRef.current && countDownRef.current.startTimer) {
      countDownRef.current.startTimer();
    }
  };

  const pauseTimer = () => {
    if (countDownRef.current && countDownRef.current.pauseTimer) {
      countDownRef.current.pauseTimer();
    }
  };

  const countDownRef = useRef(null);

  return (
    <div className="flex flex-col justify-center items-center w-full max-w-md mx-auto mt-10 p-4">
      <ProgressBar progress={counterProgress} />
      <CountDown
        key={resetKey} // Force remount when reset button is clicked
        ref={countDownRef}
        init={totalCountdown}
        onDecrement={updateProgress}
        onComplete={countDownFinished}
        autoStart={false} // Prevent auto-starting
      />
      <div className="flex flex-row items-center mt-4 w-full space-x-2">
        <input
          className="mt-4 p-2 border rounded flex-1"
          type="text"
          value={totalCountdown}
          onChange={(e) => setTotalCountdown(Number(e.target.value))}
        />
        <button
          className="mt-4 p-2 bg-green-500 text-white rounded"
          onClick={() => {
            startTimer();
            setPause(false);
          }}
        >
          {pause ? "RESUME" : "START"}
        </button>
        <button
          className="mt-4 p-2 bg-yellow-500 text-white rounded"
          onClick={() => {
            pauseTimer();
            setPause(true);
          }}
        >
          PAUSE
        </button>
        <button
          className="mt-4 p-2 bg-blue-500 text-white rounded"
          onClick={() => {
            clearTimer();
            // Force a reset by incrementing the key
            setResetKey((prev) => prev + 1);
            // Reset progress
            setCounterProgress(0);
          }}
        >
          RESET
        </button>
      </div>
    </div>
  );
}

export default Display;
