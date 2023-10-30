import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Route, Routes, useNavigate } from "react-router-dom";

import { NotificationContainer, ProjectLayout } from "./components";
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
  const navigate = useNavigate();
  return (
    <main
      className="relative h-screen max-h-screen w-screen max-w-[100%] overflow-hidden"
      style={{
        overflow: "hidden",
      }}>
      <ClerkProvider
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
            </Routes>
          </SignedIn>
        </QueryClientProvider>
      </ClerkProvider>
    </main>
  );
}
