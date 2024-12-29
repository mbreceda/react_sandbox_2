// filepath: /Users/miguelbrecedadelara/Developer/my-react-app/src/routes/routes.ts
import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "../Root";
import Contact from "../pages/Contact";
import { contactsLoader, contactLoader } from "../loaders/rootLoaders";
import ErrorPage from "../pages/ErrorPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    loader: contactsLoader,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/contacts/:contactId",
        element: <Contact />,
        loader: contactLoader,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
