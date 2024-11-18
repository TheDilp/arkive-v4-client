import "../../index.css";

import cytoscape from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
import gridguide from "cytoscape-grid-guide";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ProjectLayout } from "../../components";
import { EntitiesView } from "../../pages/Entities";
import { ErrorPage } from "../../pages/Misc";
import { ProjectsView } from "../../pages/Projects";
import App from "./App";

// eslint-disable-next-line import/no-named-as-default-member
cytoscape.use(edgehandles);
gridguide(cytoscape);

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
