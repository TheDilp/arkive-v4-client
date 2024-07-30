import { Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import GatewayForm from "./pages/GatewayForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Card } from "../../components/Layout/Card";
import ls from "localstorage-slim";
import { Button, Input, NotificationContainer } from "../../components";
import { createContext, Dispatch, ReactNode, useContext, useEffect, useState } from "react";
import { IconEnum } from "../../utils";
import { SetStateAction } from "jotai";
import { useAccessGateway } from "../../hooks";
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
    if (code && codeState && code === codeState) {
      setAccessState((prev) => ({ ...prev, access: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, codeState]);

  useEffect(() => {
    if (access && type && access_id && entity_id) {
      if (type === "characters") navigate(`/${type}/${access_id}/${entity_id}/name`);
    }
  }, [access]);

  if (!code || !codeState || (code && codeState && code !== codeState) || !access)
    return (
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center">
        <div className="h-80 w-96 font-merriweather transition-all">
          <Card title="Please input the access code you recieved in your email">
            <div className="mt-auto flex flex-col gap-y-10 [&>div>div>input::-webkit-inner-spin-button]:appearance-none [&>div>div>input]:text-center">
              <Input
                type="code"
                max={999999}
                size="lg"
                value={codeState || undefined}
                onChange={({ value }) => {
                  setAccessState((prev) => ({ ...prev, code: value as number }));
                }}
                name="code"
              />
              <Button
                isDisabled={!codeState || (!!codeState && codeState.toString().length < 6) || isMutating}
                variant="info"
                label="Access"
                onClick={() => {
                  if (codeState) accessGateway(codeState.toString());
                }}
                isLoading={isMutating}
                icon={IconEnum.login}
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
              <Route path=":type/:access_id/:entity_id" element={<GatewayForm />} />
              <Route path=":type/:access_id/:entity_id/:section_id" element={<GatewayForm />} />
            </Route>
            {/* <Route path="*" element={<Navigate to={"https://google.com"} />} /> */}
          </Routes>
        </AccessContextWrapper>
      </main>
    </QueryClientProvider>
  );
}

export default App;

