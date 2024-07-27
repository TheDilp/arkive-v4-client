import { Navigate, Route, Routes, To } from "react-router-dom";
import CharacterForm from "./pages/CharacterForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="h-screen max-h-screen w-screen overflow-hidden">
        <Routes>
          <Route path="characters/:access_id/:entity_id" element={<CharacterForm />} />
          <Route path="*" element={<Navigate to={-1 as To} />} />
        </Routes>
      </main>
    </QueryClientProvider>
  );
}

export default App;

