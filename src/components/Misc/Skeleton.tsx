import { SkeletonType } from "../../types";
import { IconEnum } from "../../utils";
import { Icon } from ".";

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

function ButtonSkeleton() {
  return <div className="h-10 w-40 animate-pulse rounded bg-zinc-700 shadow" />;
}

function BreadcrumbsSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between">
      <div className="flex h-8 items-center gap-x-2">
        <Icon fontSize={22} icon={IconEnum.home} />
        <Icon fontSize={22} icon={IconEnum.chevron_right} />
        <div className="flex h-8 items-center">
          <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-700" />
          <Icon fontSize={22} icon={IconEnum.chevron_right} />
        </div>
        <div className="flex h-8 items-center">
          <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-700" />
          <Icon fontSize={22} icon={IconEnum.chevron_right} />
        </div>
        <div className="flex h-8 items-center">
          <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-700" />
        </div>
      </div>

      <ButtonSkeleton />
    </div>
  );
}

export function Skeleton({ type }: SkeletonType) {
  if (type === "table") return <TableSkeleton />;
  if (type === "breadcrumbs") return <BreadcrumbsSkeleton />;
  return null;
}
