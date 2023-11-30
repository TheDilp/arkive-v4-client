import { Link, useRouteError } from "react-router-dom";

import { AccessDeniedPage } from "./AccessDeniedPage";

export function ErrorPage() {
  const e = useRouteError();

  if (e?.toString() === "Error: No public access") return <AccessDeniedPage />;

  return (
    <div className="grid h-screen place-content-center bg-zinc-950 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-red-600">Error</h1>
        <p className="text-2xl font-bold tracking-tight text-zinc-400 sm:text-4xl">Uh-oh!</p>
        <p className="mt-4 text-zinc-500">There was an error.</p>
        <Link
          className="mt-6 inline-block rounded bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring"
          to="/projects">
          Go to projects
        </Link>
      </div>
    </div>
  );
}
