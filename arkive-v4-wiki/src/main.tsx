import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorPage } from "../../pages/index";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import gridguide from "cytoscape-grid-guide";

cytoscape.use(dagre);
gridguide(cytoscape);

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

