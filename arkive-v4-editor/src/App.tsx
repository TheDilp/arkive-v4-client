import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistedClient, Persister, PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";
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
  MainView,
  ManuscriptProfileView,
  ProjectsView,
  UserSettings,
  UserSettingsFeatureFlags,
  UserSettingsProfile,
  UserSettingsWebhooks,
} from "../../pages";
import { moduleAtom } from "../../utils";

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    cacheTime: 1000 * 60 * 60 * 24,
    retry: (failureCount, error: any) => {
      if (error.message === "UNAUTHORIZED") {
        window.location.replace("https://thearkive.app");

        return false;
      }
      if (failureCount <= 2) return true;
      return false;
    },
    refetchOnWindowFocus: false,
    onError: (error: any) => {
      if (error.message === "UNAUTHORIZED") {
        window.location.replace("https://thearkive.app");
      }
    },
  },
});

// eslint-disable-next-line no-undef
export function createIDBPersister(idbValidKey: IDBValidKey = "arkive-editor") {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
}

const persister = createIDBPersister();
export default function App() {
  const setModule = useSetAtom(moduleAtom);
  useLayoutEffect(() => {
    setModule("editor");
  }, []);

  return (
    <main className="relative h-screen max-h-screen w-screen max-w-[100%] overflow-hidden bg-black">
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <NotificationContainer />
        <ReactQueryDevtools position="top-left" />
        <Routes>
          <Route element={<AuthWrapper />} path="/">
            <Route element={<UserSettings />} path="user_settings/*">
              <Route element={<UserSettingsProfile />} path="profile" />
              <Route element={<UserSettingsWebhooks />} path="webhooks" />
              <Route element={<UserSettingsFeatureFlags />} path="feature_flags" />
            </Route>
            <Route element={<Outlet />} path="projects/*">
              <Route element={<ProjectsView />} path="*" />
              <Route element={<ProjectLayout />} path=":project_id/*">
                <Route element={<MainView />} path=":type" />
                <Route element={<MainView />} path=":type/folder/:item_id/*" />
                <Route element={<ManuscriptProfileView />} path="manuscripts/:item_id" />
                <Route element={<ManuscriptProfileView />} path="manuscripts/:item_id/:subitem_id" />
                <Route element={<CharacterProfileView />} path="characters/:item_id" />
                <Route element={<CharacterProfileView />} path="characters/:item_id/:type" />
                <Route element={<CharacterProfileView />} path="characters/:item_id/:type/:subitem_id" />
                <Route element={<BlueprintProfileView />} path="blueprints/:item_id/:subitem_id/:type" />
                <Route element={<EntitiesView />} path=":type/:item_id/*" />
                <Route element={<EntitiesView />} path=":type/:item_id/:subitem_id/*" />
                <Route element={<Dashboard />} path="*" />
              </Route>
            </Route>
          </Route>
        </Routes>
      </PersistQueryClientProvider>
    </main>
  );
}
