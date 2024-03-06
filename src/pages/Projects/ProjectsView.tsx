import { RedirectToSignIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Avatar,
  Button,
  createColumnHelper,
  Drawer,
  Navbar,
  ProjectCard,
  Skeleton,
  Table,
  TablePageLayout,
} from "../../components";
import { useChangeNavbarTitle, useGetAllProjects, useGetUser, useTable } from "../../hooks";
import { DrawerAtomType, ProjectType } from "../../types";
import { drawerAtom, getAvatarInitials, getImageURL, IconEnum, projectAtom, projectCardNavItems, userAtom } from "../../utils";

const columnHelper = createColumnHelper<ProjectType>();

const createColumns = [
  columnHelper.display({
    id: "image_id",
    header: "Image",
    cell: ({ row }) => (
      <div className="flex w-full items-center justify-center">
        <Avatar
          hasShowImage
          image={getImageURL(row.original.id, "images", row.original.image_id)}
          initials={getAvatarInitials(row.original.title)}
          isBordered
          isTooltipDisabled
          size="sm"
        />
      </div>
    ),
    meta: {
      pinned: true,
      noLink: true,
      centered: true,
    },
    minSize: 4.5,
    maxSize: 4.5,
  }),

  columnHelper.accessor("title", {
    id: "title",
    header: "Title",
    cell: (info) => info.getValue(),
    meta: {
      sortable: true,
    },
  }),
  columnHelper.display({
    id: "links",
    header: "Shortcuts",
    cell: ({ row }) => (
      <div className="flex w-full flex-1 items-center justify-between gap-x-4">
        {projectCardNavItems.map((item) => (
          <Link key={item.icon} to={`/projects/${row.original.id}/${item.navigate}`}>
            <Button hasNoBackground icon={item.icon} iconSize={32} isIconOnly onClick={() => {}} />
          </Link>
        ))}
      </div>
    ),
    meta: {
      pinned: true,
      noLink: true,
      centered: true,
    },
    minSize: 12,
  }),
];

export function ProjectsView() {
  const setDrawer = useSetAtom(drawerAtom);
  const [view, setView] = useState<boolean | null>(ls.get("projects_view"));
  useChangeNavbarTitle("The Arkive");

  const { user } = useUser();
  const { data, isLoading } = useGetAllProjects({
    data: { auth_id: user?.id },
    fields: ["id", "title", "image_id"],
  });

  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { auth_id: user?.id },
      relations: {
        webhooks: true,
      },
      fields: ["id"],
    },
    { enabled: !!user?.id },
  );
  const setUserAtom = useSetAtom(userAtom);
  const resetProjectAtom = useResetAtom(projectAtom);
  const [, dispatch] = useTable({});

  useEffect(() => {
    if (userData) {
      setUserAtom(userData.data);
    }
  }, [userData?.data]);

  useLayoutEffect(() => {
    resetProjectAtom();
  }, []);

  return (
    <div className="flex h-screen w-screen">
      <Drawer />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <div className="h-full w-16 min-w-[4rem] max-w-[4rem] border-r border-zinc-800 bg-zinc-900">
        <div className="sticky left-0 top-0 flex h-16 min-h-[4rem] w-16 min-w-[4rem] select-none items-center justify-center border-r border-zinc-800 bg-zinc-900">
          <img alt="Arkive Logo" className="h-12 min-w-[4rem]" height={48} src="/Logo.webp" width={64} />
        </div>
        <div className="h-16 w-full">
          <Button
            hasNoBackground
            icon={IconEnum.add}
            iconSize={28}
            onClick={() =>
              setDrawer((prev: DrawerAtomType) => ({
                ...prev,
                type: "project",
                title: "Create new project",
                data: { owner_id: userData?.data?.id as string },
              }))
            }
            tooltip="Create new project"
          />
          <Button
            hasNoBackground
            icon={view ? IconEnum.table : IconEnum.card}
            iconSize={28}
            onClick={() => {
              ls.set("projects_view", !view);
              setView(!view);
            }}
            tooltip="Change view"
          />
        </div>
      </div>
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar isDisabled={isLoading || isInitialLoadingUser} />
        </div>
        {isLoading ? <Skeleton limit={4} type="project_view" /> : null}
        {view && !isLoading && !isInitialLoadingUser ? (
          <div className="flex-1 p-4">
            <TablePageLayout>
              <Table
                columns={createColumns}
                config={{ getLink: (rowData) => `/projects/${rowData.id}` }}
                data={data?.data || []}
                dispatch={dispatch}
                type="projects"
              />
            </TablePageLayout>
          </div>
        ) : null}

        {!view && !isLoading && !isInitialLoadingUser ? (
          <div className="grid grid-cols-1 gap-4 overflow-y-auto p-4 xl:grid-cols-2 2xl:grid-cols-4">
            {(data?.data || []).map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                image={getImageURL(project.id, "images", project.image_id)}
                title={project.title}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
