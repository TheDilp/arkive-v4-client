import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, Routes } from "react-router-dom";

import { NotificationContainer, ProjectLayout } from "./components";
import { AuthWrapper, SignIn } from "./pages/Auth";
import { CharacterProfileView, EntitiesView } from "./pages/Entities";
import { FolderView } from "./pages/Entities/FolderView";
import { ProjectsView } from "./pages/Projects";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <main
      className="relative h-screen max-h-screen w-screen max-w-[100%] overflow-hidden"
      style={{
        overflow: "hidden",
      }}>
      <QueryClientProvider client={queryClient}>
        <NotificationContainer />
        <ReactQueryDevtools position="top-left" />
        <Routes>
          <Route element={<AuthWrapper />} path="*">
            <Route path="auth/*">
              <Route element={<SignIn />} path="sign-in" />
            </Route>
            <Route path="projects/*">
              <Route element={<ProjectsView />} path="*" />
              <Route element={<ProjectLayout />} path=":project_id/*">
                <Route element={<FolderView />} path=":type" />
                <Route element={<CharacterProfileView />} path="characters/:item_id" />
                <Route element={<CharacterProfileView />} path="characters/:item_id/:type" />
                <Route element={<CharacterProfileView />} path="characters/:item_id/:type/:subitem_id" />
                <Route element={<EntitiesView />} path=":type/:item_id/*" />
                <Route element={<EntitiesView />} path=":type/:item_id/:subitem_id/*" />
                <Route element={<FolderView />} path=":type/folder/:item_id/*" />
              </Route>
            </Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </main>
  );
}
