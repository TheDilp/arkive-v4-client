import { SkeletonType } from "../../types";
import { IconEnum } from "../../utils";
import { Icon } from ".";

function TableRow() {
  return (
    <div className="flex h-12 w-full items-center gap-x-4">
      <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
      <div className="h-4 w-full rounded bg-zinc-700" />
      <div className="flex w-20 justify-center">
        <div className="h-7 w-7 rounded-full bg-zinc-700" />
      </div>
    </div>
  );
}

function TableSkeleton({ limit = 10 }: { limit?: number }) {
  return (
    <div className="flex max-h-full animate-pulse flex-col ">
      <div className="mb-4 flex max-h-10  w-full items-center gap-x-4 border border-zinc-700 px-2 py-4">
        <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
        <div className="h-4 w-full rounded bg-zinc-700" />
      </div>
      <div className="border-rounded flex flex-col divide-y divide-zinc-700 rounded border border-zinc-700 px-2">
        {[...Array(limit).keys()].map((key) => (
          <TableRow key={key} />
        ))}
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

function DrawerFormSkeleton() {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2 border-b border-zinc-400 pb-1">
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
      </div>
      <div className="flex items-center gap-x-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="flex items-center gap-x-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="flex items-center gap-x-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="flex items-center gap-x-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="flex items-center gap-x-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="flex items-center gap-x-2">
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
        <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
      <div className="h-10 w-full animate-pulse rounded-md bg-zinc-700" />
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex h-[calc(95%)] w-full flex-1 overflow-y-auto rounded border border-zinc-800 lg:h-[calc(100%-2rem)]">
      <div className="relative flex h-full w-full flex-col content-start focus-visible:outline-none">
        <div className="flex flex-col gap-y-2 px-4 py-4">
          <div className="h-3 w-[80rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[20rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[34rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[50rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[40rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[25rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[60rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[47rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[28rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[12rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[80rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[26rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[13rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[23rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[64rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[48rem] animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[30rem] animate-pulse rounded-r bg-zinc-700 px-4" />
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ type, limit }: SkeletonType) {
  if (type === "table") return <TableSkeleton limit={limit} />;
  if (type === "breadcrumbs") return <BreadcrumbsSkeleton />;
  if (type === "drawer_form") return <DrawerFormSkeleton />;
  if (type === "editor") return <EditorSkeleton />;
  return null;
}
