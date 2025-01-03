// filepath: /Users/miguelbrecedadelara/Developer/my-react-app/src/routes/routes.ts
import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "../Root";
import Contact from "../pages/Contact";
import EditContact from "../components/EditContact";
import {
  contactsLoader,
  contactLoader,
  createContactAction,
  editContactAction,
  destroyContactAction,
  setContactFavoriteAction,
} from "../loaders/rootLoaders";
import ErrorPage from "../pages/ErrorPage";
import Index from "../pages/Index";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    loader: contactsLoader,
    action: createContactAction,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Index /> },
          {
            path: "/contacts/:contactId",
            element: <Contact />,
            loader: contactLoader,
            action: setContactFavoriteAction,
          },
          {
            path: "/contacts/:contactId/edit",
            element: <EditContact />,
            loader: contactLoader,
            action: editContactAction,
          },
          {
            path: "/contacts/:contactId/destroy",
            action: destroyContactAction,
            errorElement: <div>Oops! there was an error.</div>,
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
