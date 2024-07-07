import { AvailableEntityType, SkeletonType } from "../../types";
import { getDefaultEntityIcon, IconEnum } from "../../utils";
import { Icon } from ".";

function TableRow() {
  return (
    <div className="flex h-[3.04rem] w-full items-center gap-x-4">
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
    <div className="flex max-h-full animate-pulse flex-col">
      {/* <div className="flex items-center w-full px-2 py-4 mb-4 border max-h-12 gap-x-4 border-zinc-700">
        <div className="h-6 w-6 min-w-[1.5rem] rounded-md bg-zinc-700" />
        <div className="w-full h-6 rounded bg-zinc-700" />
      </div> */}
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
      <div className="flex items-center gap-x-2 border-b border-zinc-500 pb-1">
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
    <div className="grid h-full w-full animate-pulse grid-cols-2 content-start gap-8 md:grid-cols-4 lg:grid-cols-10">
      {[...Array(limit).keys()].map((key) => (
        <div className="col-span-1 flex flex-col items-center" key={key}>
          {/* <div className="w-24 h-24"> */}
          <Icon color="darkgrey" fontSize={100} icon={getDefaultEntityIcon(entity_type as AvailableEntityType)} />
          <div className="h-4 min-h-[0.125rem] w-full rounded bg-zinc-700" />
        </div>
        // </div>
      ))}
    </div>
  );
}

function EditorSkeleton({ isFullWidth }: Pick<SkeletonType, "isFullWidth">) {
  return (
    <div
      className={`flex h-full max-w-full flex-1 overflow-y-auto rounded border border-zinc-800 lg:mx-auto ${
        isFullWidth ? "lg:w-full" : "lg:max-w-5xl"
      }`}>
      <div className="relative flex h-full w-full flex-col content-start focus-visible:outline-none">
        <div className="flex flex-col gap-y-2 px-4 py-4">
          <div className="h-3 w-[20rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[80rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[34rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[50rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[40rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[25rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[60rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[47rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[28rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[12rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[80rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[26rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[13rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[23rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[64rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[48rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
          <div className="h-3 w-[30rem] max-w-full animate-pulse rounded-r bg-zinc-700 px-4" />
        </div>
      </div>
    </div>
  );
}

function FamilyTreeSkeleton() {
  return (
    <div className="relative flex h-full animate-pulse items-center justify-center">
      <div className="h-24 w-24 bg-zinc-900" />
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

function ConversationSkeleton() {
  return (
    <div className="flex min-h-[90%] max-w-full flex-1 overflow-y-auto rounded border border-zinc-800">
      <div className="relative flex h-full w-full flex-col content-start focus-visible:outline-none">
        <div className="flex flex-col gap-y-2 px-4 py-4">
          <div className="ml-auto h-6 w-[20rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[20rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[34rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[30rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[20rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="ml-auto h-6 w-[25rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="ml-auto h-6 w-[60rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[25rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[24rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="ml-auto h-6 w-[12rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[20rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="ml-auto h-6 w-[26rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[13rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[23rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="ml-auto h-6 w-[24rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[28rem] animate-pulse rounded bg-zinc-700 px-4" />
          <div className="h-6 w-[30rem] animate-pulse rounded bg-zinc-700 px-4" />
        </div>
      </div>
    </div>
  );
}

function AvatarSkeleton({ limit = 1 }: { limit?: number }) {
  return (
    <div className="flex w-full items-center justify-center -space-x-4">
      {[...Array(limit).keys()].map((key) => (
        <div
          className="h-10 w-10 animate-pulse rounded-full bg-zinc-700 shadow"
          key={key}
          style={{
            animationDelay: `${key * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}

function ProjectViewSkeleton({ limit = 4 }: { limit?: number }) {
  return (
    <>
      {[...Array(limit).keys()].map((key) => (
        <div
          className="animate-in fade-in group relative col-span-1 flex h-[28rem] flex-col items-center justify-center rounded bg-zinc-950 bg-cover bg-center bg-no-repeat shadow transition-all duration-500"
          key={key}
        />
      ))}
    </>
  );
}

function SidebarSkeleton() {
  return (
    <ul className="flex flex-row lg:flex-col">
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
      <li className="flex h-16 w-16 items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700" />
      </li>
    </ul>
  );
}

export function Skeleton({ type, limit = 0, entity_type, isFullWidth }: SkeletonType) {
  if (type === "table") return <TableSkeleton limit={limit} />;
  if (type === "folder_view") return <FolderViewSkeleton entity_type={entity_type} />;
  if (type === "breadcrumbs") return <BreadcrumbsSkeleton />;
  if (type === "drawer_form") return <DrawerFormSkeleton />;
  if (type === "editor") return <EditorSkeleton isFullWidth={isFullWidth} />;
  if (type === "family_tree") return <FamilyTreeSkeleton />;
  if (type === "character_profile") return <CharacterProfileSkeleton />;
  if (type === "character_profile_main") return <CharacterProfileMainSkeleton />;
  if (type === "calendar_view") return <CalendarViewSkeleton />;
  if (type === "expanded_tag") return <ExpandedTagSkeleton />;
  if (type === "conversations") return <ConversationSkeleton />;
  if (type === "avatar") return <AvatarSkeleton limit={limit} />;
  if (type === "project_view") return <ProjectViewSkeleton limit={limit} />;
  if (type === "sidebar") return <SidebarSkeleton />;
  return null;
}

