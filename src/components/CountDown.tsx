import { useCountdownContext } from "../hooks/useCountdownContext";

/**
 * CountDown component that displays the current countdown value
 */
const CountDown = () => {
  const { counter } = useCountdownContext();

  return <span className="text-2xl font-bold">{counter}</span>;
};

export default CountDown;
