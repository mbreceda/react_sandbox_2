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
} from "../loaders/rootLoaders";
import ErrorPage from "../pages/ErrorPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    loader: contactsLoader,
    action: createContactAction,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/contacts/:contactId",
        element: <Contact />,
        loader: contactLoader,
      },
      {
        path: "/contacts/:contactId/edit",
        element: <EditContact />,
        loader: contactLoader,
        action: editContactAction,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
