import ProgressBar from "./ProgressBar";
import CountDown from "./CountDown";
import useCountdownDisplay from "../hooks/useCountdownDisplay";

function Display() {
  // Use our custom hook for all countdown display logic
  const {
    counterProgress,
    totalCountdown,
    pause,
    resetKey,
    countDownRef,
    updateProgress,
    countDownFinished,
    startTimer,
    pauseTimer,
    resetTimer,
    handleCountdownChange,
  } = useCountdownDisplay(15); // Initialize with 15 seconds

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
          onChange={(e) => handleCountdownChange(Number(e.target.value))}
        />
        <button
          className="mt-4 p-2 bg-green-500 text-white rounded"
          onClick={startTimer}
        >
          {pause ? "RESUME" : "START"}
        </button>
        <button
          className="mt-4 p-2 bg-yellow-500 text-white rounded"
          onClick={pauseTimer}
        >
          PAUSE
        </button>
        <button
          className="mt-4 p-2 bg-blue-500 text-white rounded"
          onClick={resetTimer}
        >
          RESET
        </button>
      </div>
    </div>
  );
}

export default Display;
