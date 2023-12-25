import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { ProjectLayout } from "./components";
import { EntitiesView } from "./pages/Entities";
import { ErrorPage } from "./pages/Misc";
import { ProjectsView } from "./pages/Projects";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "projects/*",
        element: <ProjectsView />,
        errorElement: <ErrorPage />,
      },
      {
        path: "projects/:project_id/*",
        element: <ProjectLayout />,
        errorElement: <ErrorPage />,

        children: [
          {
            path: ":type",
            element: <EntitiesView />,
          },
          {
            path: ":type/:item_id",
            element: <EntitiesView />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
