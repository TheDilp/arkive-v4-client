import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { moduleAtom } from "../../utils";
import { Home } from "./Home";
import { PublicEntitiesView, PublicLayout, PublicListView } from "./Public";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const setModule = useSetAtom(moduleAtom);

  useLayoutEffect(() => {
    setModule("wiki");
  }, []);
  return (
    <main className="h-screen max-h-screen w-screen overflow-hidden bg-black">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<Home />} path="/" />
          <Route element={<PublicLayout />} path=":project_id/*">
            <Route element={<PublicListView />} path=":type" />
            <Route element={<PublicEntitiesView />} path=":type/:item_id/*" />
            <Route element={<PublicEntitiesView />} path=":type/:item_id/:subitem_id" />
          </Route>
        </Routes>
      </QueryClientProvider>
    </main>
  );
}

export default App;
