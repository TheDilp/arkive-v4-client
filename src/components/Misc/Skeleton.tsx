import { AvailableEntityType, SkeletonType } from "../../types";
import { getDefaultEntityIcon, IconEnum } from "../../utils";
import { Icon } from ".";

function TableRow() {
  return (
    <div className="flex h-12 w-full items-center gap-x-4">
      <div className="ml-2 h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
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
      <div className="mb-4 flex max-h-12  w-full items-center gap-x-4 border border-zinc-700 px-2 py-4">
        <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
        <div className="h-6 w-full rounded bg-zinc-700" />
      </div>
      <div className="border-rounded flex flex-col divide-y divide-zinc-700 rounded border border-zinc-700">
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

function FolderViewSkeleton({ entity_type, limit = 20 }: Pick<SkeletonType, "entity_type" | "limit">) {
  return (
    <div className="mt-24 grid h-full w-full animate-pulse grid-cols-2 content-start gap-8 md:grid-cols-4 lg:grid-cols-10">
      {[...Array(limit).keys()].map((key) => (
        <div key={key} className="col-span-1 flex flex-col items-center">
          {/* <div className="h-24 w-24"> */}
          <Icon color="darkgrey" fontSize={100} icon={getDefaultEntityIcon(entity_type as AvailableEntityType)} />
          <div className="h-4 min-h-[0.25rem] w-full rounded bg-zinc-700" />
        </div>
        // </div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex min-h-[90%] max-w-full flex-1 overflow-y-auto rounded border border-zinc-800">
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

function FamilyTreeSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div className="skeleton_family_tree_parent  absolute left-1/4 top-24 h-[50px] w-[50px] rounded bg-zinc-900" />
      <div className="skeleton_family_tree_parent absolute right-1/4 top-24 h-[50px] w-[50px] rounded bg-zinc-900" />
      <div className="skeleton_family_tree_child absolute left-[calc(50%-25px)] top-64 h-[50px] max-h-[50px] w-[50px] max-w-[50px] rounded bg-zinc-900" />
    </div>
  );
}

function CharacterProfileSkeleton() {
  return (
    <div className="col-span-5 flex h-full animate-pulse flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-800 p-4 lg:col-span-1">
      <div className="h-24 min-h-[6rem] w-24 min-w-[6rem] rounded-full bg-zinc-700" />
      <div className="flex w-full flex-col items-center gap-y-2">
        <span className="h-[18px] w-3/4 rounded bg-zinc-700" />
        <span className="h-[18px] w-3/4 rounded bg-zinc-700" />
      </div>
      <div className="flex w-full animate-pulse flex-col items-center gap-y-2">
        <span className="h-7 w-full animate-pulse rounded bg-zinc-700" />
        <span className="h-7 w-full animate-pulse rounded bg-zinc-700" />
        <span className="h-7 w-full animate-pulse rounded bg-zinc-700" />
        <span className="h-7 w-full animate-pulse rounded bg-zinc-700" />
      </div>
    </div>
  );
}

function CharacterProfileMainSkeleton() {
  return (
    <div className="col-span-5 flex h-full animate-pulse flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-900 p-4 lg:col-span-4" />
  );
}

function CalendarViewSkeleton() {
  return (
    <div>
      <div className="sticky top-0 mb-2 flex w-full items-center justify-end gap-x-2">
        <div className="h-10 w-32 bg-zinc-700" />
        <div className="h-10 w-32 bg-zinc-700" />
        <div className="h-10 w-32 bg-zinc-700" />
        <div className="h-10 w-32 bg-zinc-700" />
      </div>
      <div
        className="grid overflow-auto border border-zinc-700"
        style={{
          gridTemplateColumns: "repeat(7, minmax(9rem, 1fr))",
        }}>
        <div className="group col-span-1 h-6 border-b border-r border-zinc-700 px-2 text-white" />
        <div className="group col-span-1 h-6 border-b border-r border-zinc-700 px-2 text-white" />
        <div className="group col-span-1 h-6 border-b border-r border-zinc-700 px-2 text-white" />
        <div className="group col-span-1 h-6 border-b border-r border-zinc-700 px-2 text-white" />
        <div className="group col-span-1 h-6 border-b border-r border-zinc-700 px-2 text-white" />
        <div className="group col-span-1 h-6 border-b border-r border-zinc-700 px-2 text-white" />
        <div className="group col-span-1 h-6 border-b border-r border-zinc-700 px-2 text-white" />

        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
        <div className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white" />
      </div>
    </div>
  );
}

function ExpandedTagSkeleton() {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2 border-b border-zinc-400 pb-1">
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
        <div className="h-8 w-full animate-pulse bg-zinc-700" />
      </div>
    </div>
  );
}

export function Skeleton({ type, limit = 0, entity_type }: SkeletonType) {
  if (type === "table") return <TableSkeleton limit={limit} />;
  if (type === "folder_view") return <FolderViewSkeleton entity_type={entity_type} />;
  if (type === "breadcrumbs") return <BreadcrumbsSkeleton />;
  if (type === "drawer_form") return <DrawerFormSkeleton />;
  if (type === "editor") return <EditorSkeleton />;
  if (type === "family_tree") return <FamilyTreeSkeleton />;
  if (type === "character_profile") return <CharacterProfileSkeleton />;
  if (type === "character_profile_main") return <CharacterProfileMainSkeleton />;
  if (type === "calendar_view") return <CalendarViewSkeleton />;
  if (type === "expanded_tag") return <ExpandedTagSkeleton />;
  return null;
}
