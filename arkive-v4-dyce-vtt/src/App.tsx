import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { NotificationContainer } from "../../components";
import { moduleAtom } from "../../utils";
import { GameLayout, GameView } from "./pages/Game";
import { GamesList } from "./pages/GamesList";

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
          <Route
            element={
              <ClerkProvider
                appearance={{
                  baseTheme: dark,
                }}
                domain={(url) => url.host}
                isSatellite
                publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
                routerPush={(to: string) => navigate(to)}
                routerReplace={(to: string) => navigate(to)}
                signInUrl="http://localhost:5173/sign-in">
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
                <SignedIn>
                  <Outlet />
                  {pathname === "/" ? <Navigate to="/games" /> : null}
                </SignedIn>
              </ClerkProvider>
            }
            path="/">
            <Route path="games/*">
              <Route element={<GameLayout />}>
                <Route element={<GamesList />} path="*" />
                <Route element={<GameView />} path=":game_id" />
              </Route>
            </Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </main>
  );
}

