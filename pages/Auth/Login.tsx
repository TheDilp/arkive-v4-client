import { useAtomValue } from "jotai";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import { AuthLayout, Button, Input } from "../../components";
import { useHandleChange } from "../../hooks";
import { IconEnum, loggedInAtom } from "../../utils";

export function Login() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const loggedIn = useAtomValue(loggedInAtom);
  const { handleChange } = useHandleChange({ data: loginData, setData: setLoginData });
  if (loggedIn) return <Navigate to="/projects" />;

  return (
    <AuthLayout>
      <div className="font-lato flex w-[30rem] flex-col items-center gap-y-4">
        <h1 className="font-merriweather flex items-center gap-x-2 pr-12 text-4xl">
          <img height={64} src="/Logo.webp" width={64} />
          The Arkive
        </h1>
        <h2 className="font-merriweather top-0 z-10 p-4 text-3xl font-bold">Discover your world</h2>
        <div className="flex w-full flex-col items-center justify-center gap-y-4 rounded bg-zinc-900 p-4 shadow">
          <div className="flex w-full flex-col gap-2">
            <Button
              customButtonColor="#5865F2"
              icon={IconEnum.discord}
              label="Sign in with Discord"
              onClick={() => {
                document.location = import.meta.env.VITE_DISCORD_LOGIN;
              }}
              variant="primary"
            />
            <Button icon={IconEnum.google} label="Sign in with Google" onClick={undefined} variant="info" />
          </div>
          <div className="relative w-full">
            <hr className="my-2 w-full border-zinc-600" />
            <span className="absolute -top-3 left-[calc(50%-13px)] bg-zinc-900 p-2 text-zinc-400">or</span>
          </div>
          <h3 className="text-3xl">Login</h3>
          <Input name="email" onChange={handleChange} placeholder="Email" size="lg" type="email" value={loginData.email} />
          <Input
            name="password"
            onChange={handleChange}
            placeholder="Password"
            size="lg"
            type="password"
            value={loginData.password}
          />
          <div className="min-h-10 w-full">
            <Button
              icon={IconEnum.login}
              isDisabled={!loginData?.email || !loginData?.password}
              label="Login"
              onClick={undefined}
              variant="success"
            />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
