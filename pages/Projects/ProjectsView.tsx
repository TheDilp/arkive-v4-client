import { useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { useEffect, useLayoutEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

import {
  Avatar,
  Button,
  createColumnHelper,
  Dialog,
  Drawer,
  Navbar,
  ProjectGameCard,
  Sidebar,
  Skeleton,
  Table,
  TablePageLayout,
} from "../../components";
import { useBreakpoint, useGetAllProjects, useGetUser, useNavbarTitle, useTable } from "../../hooks";
import { ProjectType } from "../../types";
import {
  drawerAtom,
  getAssetURL,
  getAvatarInitials,
  getProjectsViewNavItems,
  IconEnum,
  projectAtom,
  projectCardNavItems,
  userAtom,
  userStatusAtom,
} from "../../utils";

const columnHelper = createColumnHelper<ProjectType>();
const alwaysEnabledItems = ["/", "settings", "tags", "assets"];

function createColumns(navigate: NavigateFunction) {
  return [
    columnHelper.display({
      id: "image_id",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image_id={row.original.image_id}
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
      cell: ({ row }) => {
        return (
          <div className="flex w-full flex-1 items-center justify-between gap-x-4 overflow-auto">
            {projectCardNavItems
              .filter(
                (item) =>
                  row.original?.feature_flags?.[`${item.navigate}_enabled`] || alwaysEnabledItems.includes(item.navigate)
              )
              .map((item) => (
                <div key={item.icon}>
                  <Button
                    hasNoBackground
                    icon={item.icon}
                    iconSize={32}
                    isIconOnly
                    onClick={() => navigate(`/projects/${row.original.id}/${item.navigate}`)}
                  />
                </div>
              ))}
          </div>
        );
      },
      meta: {
        pinned: true,
        noLink: true,
        centered: true,
      },
      minSize: 12,
    }),
  ];
}

export function ProjectsView() {
  const setDrawer = useSetAtom(drawerAtom);
  const navigate = useNavigate();
  const { isLg } = useBreakpoint();
  const user = useAtomValue(userStatusAtom);
  const [view, setView] = useState<boolean | null>(ls.get("projects_view"));
  useNavbarTitle("The Arkive", true);

  const {
    data,
    isLoading,
    isFetching: isFetchingProjects,
  } = useGetAllProjects(
    {
      data: {},
      fields: ["id", "title", "image_id"],
    },
    {
      enabled: !!user?.user_id,
    }
  );

  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { id: user?.user_id as string },
      relations: {
        webhooks: true,
      },
      fields: ["id"],
    },
    { enabled: !!user?.user_id && !isFetchingProjects && !!user?.project_id }
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
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />
      <Dialog />

      {isLg ? (
        <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={getProjectsViewNavItems(setView, view)} />
      ) : null}
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar isDisabled={isLoading || isInitialLoadingUser} />
        </div>
        <div className="flex h-full flex-1 flex-col gap-y-2 p-4">
          {isLoading ? (
            <Skeleton limit={4} type="project_view" />
          ) : (
            <div className="flex justify-end">
              <div className="w-fit">
                <Button
                  icon={IconEnum.add}
                  label="Create new project"
                  onClick={() =>
                    setDrawer((prev) => ({
                      ...prev,
                      type: "project",
                      title: "Create new project",
                      data: null,
                    }))
                  }
                />
              </div>
            </div>
          )}
          {view && !isLoading && !isInitialLoadingUser ? (
            <div className="flex-1">
              <TablePageLayout>
                <Table
                  columns={createColumns(navigate)}
                  config={{ getLink: (rowData: ProjectType) => `/projects/${rowData.id}` }}
                  data={data?.data || []}
                  dispatch={dispatch}
                  type="projects"
                />
              </TablePageLayout>
            </div>
          ) : null}
          {!view && !isLoading && !isInitialLoadingUser ? (
            <div className="grid h-full max-h-full flex-1 grid-cols-1 gap-4 overflow-auto xl:grid-cols-2 2xl:grid-cols-4">
              {(data?.data || []).map((project) => (
                <ProjectGameCard
                  key={project.id}
                  feature_flags={project.feature_flags}
                  id={project.id}
                  image={getAssetURL(project.id, "images", project.image_id)}
                  title={project.title}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {isLg ? null : (
        <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={getProjectsViewNavItems(setView, view)} />
      )}
    </div>
  );
}
