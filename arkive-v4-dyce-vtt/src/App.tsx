import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { NotificationContainer } from "../../components";
import { AuthWrapper } from "../../pages";
import { moduleAtom } from "../../utils";
import { GameLayout, GameView } from "./pages/Game";
import { GamesView } from "./pages/GamesView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
export default function App() {
  const setModule = useSetAtom(moduleAtom);

  useLayoutEffect(() => {
    setModule("dyce_vtt");
  }, []);

  return (
    <main className="relative h-screen max-h-screen w-screen max-w-[100%] overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <NotificationContainer />
        <ReactQueryDevtools position="top-right" />
        <Routes>
          <Route element={<AuthWrapper />} path="/">
            <Route element={<GameLayout />} path="games/*">
              <Route element={<GamesView />} path="*" />
              <Route element={<GameView />} path=":project_id/:game_id" />
            </Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </main>
  );
}
