import { StytchProvider } from "@stytch/react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import edgehandles from "cytoscape-edgehandles";
import gridguide from "cytoscape-grid-guide";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { ProjectLayout } from "./components";
import { EntitiesView } from "./pages/Entities";
import { ProjectsView } from "./pages/Projects";
import { authClient } from "./utils";

cytoscape.use(edgehandles);
cytoscape.use(dagre);
gridguide(cytoscape);

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    children: [
      {
        path: "projects/*",
        element: <ProjectsView />,
      },
      {
        path: "projects/:project_id/*",
        element: <ProjectLayout />,
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
    <StytchProvider stytch={authClient}>
      <RouterProvider router={router} />
    </StytchProvider>
  </React.StrictMode>,
);
