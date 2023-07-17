import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, Routes } from "react-router-dom";

import { NotificationContainer, ProjectLayout } from "./components";
import { EntitiesView } from "./pages/Entities";
import ProjectsView from "./pages/Projects/ProjectsView";
import { SettingsView } from "./pages/Settings";

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
          <Route path="/projects/*">
            <Route element={<ProjectsView />} path="" />
            <Route element={<ProjectLayout />} path=":project_id/*">
              <Route element={<SettingsView />} path="settings/:type/*" />
              <Route element={<EntitiesView />} path=":type" />
              {/* <Route element={<EntitiesView />} path=":type/folder/*" /> */}
              {/* <Route element={<EntitiesView />} path=":type/folder/:item_id" /> */}
              <Route element={<EntitiesView />} path=":type/:item_id" />
            </Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </main>
  );
}
