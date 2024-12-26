import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { Goodway } from "./components/SRP";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error(error);
    },
  }),
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Goodway />
    </QueryClientProvider>
  );
}

export default App;
