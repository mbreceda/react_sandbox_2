// filepath: /Users/miguelbrecedadelara/Developer/my-react-app/src/routes/routes.ts
import { createBrowserRouter, RouteObject } from "react-router-dom";
import App from "../App";
import Contact from "../pages/Contact";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/contacts/:contactId",
        element: <Contact />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
