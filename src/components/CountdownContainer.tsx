import CountdownProvider from "../contexts/CountdownContext";
import CountDown from "./CountDown";
import CountdownControls from "./CountdownControls";
import ProgressBar from "./ProgressBar";

interface CountdownContainerProps {
  initialValue: number | null;
  autoStart?: boolean;
  onComplete?: () => void;
  onDecrement?: (value: number) => void;
}

/**
 * Container component that provides the countdown context and progress visualization
 */
const CountdownContainer = ({
  initialValue,
  autoStart = false,
  onComplete,
  onDecrement,
}: CountdownContainerProps) => {
  return (
    <CountdownProvider
      initialValue={initialValue}
      autoStart={autoStart}
      onComplete={onComplete}
      onDecrement={onDecrement}
    >
      <div className="flex flex-col items-center gap-4 w-full">
        <ProgressBar />
        <CountDown />
        <CountdownControls />
      </div>
    </CountdownProvider>
  );
};

export default CountdownContainer;
