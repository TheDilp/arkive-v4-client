import { SkeletonType } from "../../types";

function TableSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      <div className="mb-4 flex max-h-10  w-full items-center gap-x-4 border border-zinc-700 px-2 py-4">
        <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
        <div className="h-4 w-full rounded bg-zinc-700" />
      </div>
      <div className="border-rounded flex flex-col divide-y divide-zinc-700 rounded border border-zinc-700 px-2">
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
        <div className="flex h-12 w-full items-center gap-x-4">
          <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
          <div className="h-4 w-full rounded bg-zinc-700" />
          <div className="flex w-20 justify-center">
            <div className="h-7 w-7 rounded-full bg-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ type }: SkeletonType) {
  if (type === "table") return <TableSkeleton />;
  return null;
}
