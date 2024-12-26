import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

import NotFound from "./pages/NotFound/NotFound";
import { LoadingLayout } from "./components/LoadingLayout";
import RootLayout from "./pages/RootLayout/Layout";
import { loaders } from "./pages/RootLayout/loaders";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={
          <LoadingLayout>
            <RootLayout />
          </LoadingLayout>
        }
        loader={loaders.layoutLoader}
        id="root-loader"
      />
      ,
      <Route path="notfound" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </>,
  ),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </StrictMode>,
);
