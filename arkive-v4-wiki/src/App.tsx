import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";

import { PublicEntitiesView, PublicLayout, PublicListView } from "./Public";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <main className="h-screen max-h-screen w-screen overflow-hidden bg-black">
      <QueryClientProvider client={queryClient}>
        <Routes>
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
