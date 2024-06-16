import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { NotificationContainer, ProjectLayout } from "../../components";
import { CharacterProfileView, EntitiesView, FolderView } from "../../pages/Entities";
import { BlueprintProfileView } from "../../pages/Entities/BlueprintProfileView";
import { GameLayout, GameView } from "../../pages/Game";
import { Dashboard } from "../../pages/Projects/Dashboard";
import { ProjectsView } from "../../pages/Projects/ProjectsView";
import { PublicEntitiesView, PublicListView } from "../../pages/Public";
import { PublicLayout } from "../../pages/Public/PublicLayout";
import { UserSettings, UserSettingsWebhooks } from "../../pages/User";
import UserSettingsFeatureFlags from "../../pages/User/UserSettingsFeatureFlags";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <main className="relative h-screen max-h-screen w-screen max-w-[100%] overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <NotificationContainer />
        <ReactQueryDevtools position="top-left" />
        <Routes>
          <Route
            element={
              <ClerkProvider
                appearance={{
                  baseTheme: dark,
                }}
                publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
                routerPush={(to: string) => navigate(to)}
                routerReplace={(to: string) => navigate(to)}>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
                <SignedIn>
                  <Outlet />
                  {pathname === "/" ? <Navigate to="/projects" /> : null}
                </SignedIn>
              </ClerkProvider>
            }
            path="/">
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
            <Route path="game/*">
              <Route element={<GameLayout />}>
                <Route element={<GameView />} path="123" />
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
