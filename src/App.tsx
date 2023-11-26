import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { NotificationContainer, ProjectLayout } from "./components";
import { CharacterProfileView, EntitiesView, FolderView } from "./pages/Entities";
import BlueprintProfileView from "./pages/Entities/BlueprintProfileView";
import { ProjectsView } from "./pages/Projects";
import { PublicEntitiesView } from "./pages/Public";
import { PublicLayout } from "./pages/Public/PublicLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
export default function App() {
  const navigate = useNavigate();
  return (
    <main
      className="relative h-screen max-h-screen w-screen max-w-[100%] overflow-hidden"
      style={{
        overflow: "hidden",
      }}>
      <ClerkProvider
        // afterSignInUrl="/projects"
        appearance={{
          baseTheme: dark,
        }}
        navigate={(to) => navigate(to)}
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <NotificationContainer />
          <ReactQueryDevtools position="top-left" />
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>
            <Routes>
              <Route element={<Navigate to="/projects" />} path="/" />
              <Route path="projects/*">
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
                </Route>
              </Route>
            </Routes>
          </SignedIn>
          <Routes>
            <Route path="public/*">
              {/* <Route path="*" /> */}
              <Route element={<PublicLayout />} path=":project_id/*">
                <Route path=":type" />
                <Route element={<PublicEntitiesView />} path=":type/:item_id/*" />
                <Route path=":type/:item_id/:subitem_id" />
              </Route>
            </Route>
          </Routes>
        </QueryClientProvider>
      </ClerkProvider>
    </main>
  );
}
