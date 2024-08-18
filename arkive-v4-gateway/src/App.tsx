import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SetStateAction } from "jotai";
import ls from "localstorage-slim";
import { createContext, Dispatch, ReactNode, useContext, useEffect, useState } from "react";
import { Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";

import { Button, Input, NotificationContainer } from "../../components";
import { Card } from "../../components/Layout/Card";
import { useAccessGateway } from "../../hooks";
import { IconEnum } from "../../utils";
import GatewayForm from "./pages/GatewayForm";

type AccessStateType = { access: boolean; code: number | undefined };
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

const AccessContext = createContext<AccessStateType & { setAccessState: Dispatch<SetStateAction<AccessStateType>> }>({
  access: false,
  code: undefined,
  setAccessState: () => {},
});
function AccessContextWrapper({ children }: { children: ReactNode }) {
  const [accessState, setAccessState] = useState<AccessStateType>({ access: false, code: undefined });

  return (
    <AccessContext.Provider value={{ access: accessState.access, code: accessState.code, setAccessState }}>
      {children}
    </AccessContext.Provider>
  );
}

function CodeInput() {
  const { type, access_id, entity_id } = useParams();
  const code = ls.get("code", { decrypt: true });
  const { access, code: codeState, setAccessState } = useContext(AccessContext);
  const { mutate: accessGateway, isLoading: isMutating } = useAccessGateway();
  const navigate = useNavigate();
  useEffect(() => {
    if (code && codeState && Number(code) === Number(codeState)) {
      setAccessState((prev) => ({ ...prev, access: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, codeState, isMutating]);

  useEffect(() => {
    if (access && type && access_id) {
      if (entity_id) navigate(`/${type}/${access_id}/update/${entity_id}/name`);
      else navigate(`/${type}/${access_id}/create/name`);
    }
  }, [access]);

  if (!code || !codeState || (code && codeState && code !== codeState) || !access)
    return (
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center">
        <div className="h-80 w-96 font-merriweather transition-all">
          <Card title="Please enter your access code">
            <div className="mt-auto flex flex-col gap-y-10 [&>div>div>input::-webkit-inner-spin-button]:appearance-none [&>div>div>input]:text-center">
              <Input
                max={999999}
                name="code"
                onChange={({ value }) => {
                  setAccessState((prev) => ({ ...prev, code: value as number }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (codeState) accessGateway(codeState.toString());
                  }
                }}
                size="lg"
                type="code"
                value={codeState || ""}
              />
              <Button
                icon={IconEnum.login}
                isDisabled={!codeState || (!!codeState && codeState.toString().length < 6) || isMutating}
                isLoading={isMutating}
                label="Access"
                onClick={() => {
                  if (codeState) accessGateway(codeState.toString());
                }}
                variant="info"
              />
            </div>
          </Card>
        </div>
      </div>
    );
  else return <Outlet />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationContainer />
      <main className="h-screen max-h-screen w-screen overflow-hidden">
        <AccessContextWrapper>
          <Routes>
            <Route element={<CodeInput />}>
              <Route element={<GatewayForm />} path=":type/:access_id/create" />
              <Route element={<GatewayForm />} path=":type/:access_id/create/:section_id" />
              <Route element={<GatewayForm />} path=":type/:access_id/update/:entity_id" />
              <Route element={<GatewayForm />} path=":type/:access_id/update/:entity_id/:section_id" />
            </Route>
          </Routes>
        </AccessContextWrapper>
      </main>
    </QueryClientProvider>
  );
}

export default App;
