import "../../index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import { GameLayout, GameView } from "./pages/Game";

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    errorElement: <div />,
    children: [
      {
        path: "game/*",
        element: <GameLayout />,
        errorElement: <div />,
      },
      {
        path: "games/:game_id/*",
        element: <GameView />,
        errorElement: <div />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

