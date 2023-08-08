import cytoscape from "cytoscape";
import edgehandles from "cytoscape-edgehandles";
import gridguide from "cytoscape-grid-guide";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { ProjectLayout } from "./components";
import { EntitiesView } from "./pages/Entities";
import ProjectsView from "./pages/Projects/ProjectsView";
import { SettingsView } from "./pages/Settings";

cytoscape.use(edgehandles);
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
            path: "settings/:type/*",
            element: <SettingsView />,
          },
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
