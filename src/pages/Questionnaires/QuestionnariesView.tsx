import { RedirectToSignIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";

import { createColumnHelper, Dialog, Drawer, Navbar, Sidebar, Skeleton, Table, TablePageLayout } from "../../components";
import { useBreakpoint, useGetUser, useTable } from "../../hooks";
import { drawerAtom, getQuestionnairesViewNavItems } from "../../utils";

const columnHelper = createColumnHelper<any>();

function createColumns() {
  return [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
      },
    }),
  ];
}

export function QuestionnariesView() {
  const setDrawer = useSetAtom(drawerAtom);
  const { isLg } = useBreakpoint();
  const { user } = useUser();

  const { isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { auth_id: user?.id as string },
      relations: {
        webhooks: true,
      },
      fields: ["id"],
    },
    { enabled: !!user?.id },
  );
  const [, dispatch] = useTable({});

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />
      <Dialog />

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {isLg ? (
        <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={getQuestionnairesViewNavItems(setDrawer)} />
      ) : null}
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar isDisabled={isInitialLoadingUser} />
        </div>
        {isInitialLoadingUser ? <Skeleton limit={4} type="project_view" /> : null}
        {!isInitialLoadingUser && !isInitialLoadingUser ? (
          <div className="flex-1 p-4">
            <TablePageLayout>
              <Table
                columns={createColumns()}
                config={{ getLink: (rowData) => `/projects/${rowData.id}` }}
                data={[]}
                dispatch={dispatch}
                type="projects"
              />
            </TablePageLayout>
          </div>
        ) : null}
      </div>
      {isLg ? null : (
        <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={getQuestionnairesViewNavItems(setDrawer)} />
      )}
    </div>
  );
}
