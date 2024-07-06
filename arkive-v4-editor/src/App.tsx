import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import { NotificationContainer, ProjectLayout } from "../../components";
import {
  AuthWrapper,
  BlueprintProfileView,
  CharacterProfileView,
  Dashboard,
  EntitiesView,
  FolderView,
  ProjectsView,
  PublicEntitiesView,
  PublicLayout,
  PublicListView,
  UserSettings,
  UserSettingsFeatureFlags,
  UserSettingsWebhooks,
} from "../../pages";
import { moduleAtom } from "../../utils";

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
    setModule("arkive");
  }, []);

  return (
    <main className="relative h-screen max-h-screen w-screen max-w-[100%] overflow-hidden bg-black">
      <QueryClientProvider client={queryClient}>
        <NotificationContainer />
        <ReactQueryDevtools position="top-left" />
        <Routes>
          <Route element={<AuthWrapper />} path="/">
            <Route element={<UserSettings />} path="user_settings/*">
              <Route element={<UserSettingsWebhooks />} path="webhooks" />
              <Route element={<UserSettingsFeatureFlags />} path="feature_flags" />
            </Route>
            <Route element={<Outlet />} path="projects/*">
              <Route element={<ProjectsView />} path="*" />
              <Route element={<ProjectLayout />} path=":project_id/*">
                <Route element={<FolderView />} path=":type" />
                <Route element={<CharacterProfileView />} path="characters/:item_id" />
                <Route element={<CharacterProfileView />} path="characters/:item_id/:type" />
                <Route element={<CharacterProfileView />} path="characters/:item_id/:type/:subitem_id" />
                <Route element={<BlueprintProfileView />} path="blueprints/:item_id/:subitem_id/:type" />
                <Route element={<EntitiesView />} path=":type/:item_id/*" />
                <Route element={<EntitiesView />} path=":type/:item_id/:subitem_id/*" />
                <Route element={<FolderView />} path=":type/folder/:item_id/*" />
                <Route element={<Dashboard />} path="*" />
              </Route>
            </Route>
          </Route>
        </Routes>

        <Routes>
          <Route path="public/*">
            <Route element={<PublicLayout />} path=":project_id/*">
              <Route element={<PublicListView />} path=":type" />
              <Route element={<PublicEntitiesView />} path=":type/:item_id/*" />
              <Route element={<PublicEntitiesView />} path=":type/:item_id/:subitem_id" />
            </Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </main>
  );
}

