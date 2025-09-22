import { useCountdownContext } from "../hooks/useCountdownContext";

/**
 * Progress bar component that shows visual progress of the countdown
 * Gets all data directly from CountdownContext
 */
const ProgressBar = () => {
  const { progress } = useCountdownContext();

  return (
    <div className="h-[20px] w-[90%] bg-gray-300 rounded-full overflow-hidden">
      <div
        className="bg-blue-600 h-full rounded-full transition-all duration-1000"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;
