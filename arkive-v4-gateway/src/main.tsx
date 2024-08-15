import "../../index.css";

import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { GatewayErrorPage } from "../../pages/Misc";
import App from "./App";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    errorElement: <GatewayErrorPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
