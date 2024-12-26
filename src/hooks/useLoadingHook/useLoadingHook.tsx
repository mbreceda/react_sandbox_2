import { createContext } from "react";

interface LoadingLayoutProps {
  isLoading: boolean;
}

const loadingContext = createContext<LoadingLayoutProps>({ isLoading: false });

// const useLoadingHook = () => {
//   const context = useContext(loadingContext);
//   if (!context) {
//     throw new Error("useLoadingHook must be used within a LoadingProvider");
//   }
//   return context;
// };

export const LoadingProvider = ({ children, isLoading }) => {
  return (
    <loadingContext.Provider value={{ isLoading }}>
      {children}
    </loadingContext.Provider>
  );
};

export default LoadingProvider;
