import { Link } from "react-router-dom";

export function AccessDeniedPage() {
  return (
    <div className="grid h-screen place-content-center bg-zinc-950 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-zinc-300">No public access</h1>
        <p className="text-2xl font-bold tracking-tight text-zinc-400 sm:text-4xl">
          Looks like this entity wasn&apos;t made public by its owner.{" "}
        </p>
        <Link
          className="mt-6 inline-block rounded bg-blue-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring"
          to="/projects">
          Go to the project&apos;s home page
        </Link>
      </div>
    </div>
  );
}
