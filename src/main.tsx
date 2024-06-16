import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import edgehandles from "cytoscape-edgehandles";
import gridguide from "cytoscape-grid-guide";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { ProjectLayout } from "../components";
import App from "./App";
import { EntitiesView } from "./pages/Entities";
import { ErrorPage } from "./pages/Misc";
import { ProjectsView } from "./pages/Projects";

// eslint-disable-next-line import/no-named-as-default-member
cytoscape.use(edgehandles);
// eslint-disable-next-line import/no-named-as-default-member
cytoscape.use(dagre);
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
