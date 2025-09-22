import { useContext } from "react";
import {
  CountdownContext,
  CountdownContextType,
} from "../contexts/CountdownContextTypes";

// Export the hook for accessing the countdown context
export const useCountdownContext = (): CountdownContextType => {
  const context = useContext(CountdownContext);
  if (context === undefined) {
    throw new Error(
      "useCountdownContext must be used within a CountdownProvider",
    );
  }
  return context;
};
