import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { NotificationContainer } from "../../components";
import { GameLayout, GameView } from "./pages/Game";

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
                  {pathname === "/" ? <Navigate to="/games" /> : null}
                </SignedIn>
              </ClerkProvider>
            }
            path="/">
            <Route path="games/*">
              <Route element={<GameLayout />}>
                <Route element={<div className="text-white">LIST OF GAMES HERE</div>} path="*" />
                <Route element={<GameView />} path="123" />
              </Route>
            </Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </main>
  );
}

