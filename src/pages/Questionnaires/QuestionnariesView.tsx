import { RedirectToSignIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

import {
  Button,
  createColumnHelper,
  Dialog,
  Drawer,
  Icon,
  Navbar,
  Sidebar,
  Skeleton,
  Table,
  TablePageLayout,
} from "../../components";
import { useBreakpoint, useGetEntities, useGetUser, useTable } from "../../hooks";
import { QuestionnaireType } from "../../types/EntityTypes/questionnaireTypes";
import { currentUserPermissionsAtom, drawerAtom, IconEnum, questionnaireNavEnum, userAtom } from "../../utils";

const columnHelper = createColumnHelper<any>();

function createColumns() {
  return [
    columnHelper.accessor("icon", {
      id: "icon",
      header: "",
      cell: (info) => <Icon fontSize={28} icon={info.getValue() || IconEnum.questionnaires} />,
      meta: {
        sortable: true,
        centered: true,
      },
      minSize: 3.75,
      size: 3.75,
      maxSize: 3.75,
    }),
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
    }),
  ];
}

export function QuestionnariesView() {
  const setDrawer = useSetAtom(drawerAtom);
  const { isLg } = useBreakpoint();
  const { user } = useUser();

  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { auth_id: user?.id as string },
      relations: {
        webhooks: true,
      },
      fields: ["id"],
    },
    { enabled: !!user?.id },
  );

  const { data: questionnaires, isLoading } = useGetEntities<QuestionnaireType>(
    { fields: ["id", "icon", "owner_id", "title"] },
    "questionnaires",
    { enabled: !!userData },
  );

  const [, dispatch] = useTable({});

  const setUserAtom = useSetAtom(userAtom);
  const setUserPermissions = useSetAtom(currentUserPermissionsAtom);

  useEffect(() => {
    if (userData?.data) {
      if (user)
        user?.update({
          unsafeMetadata: {
            user_id: userData?.data?.id,
          },
        });
      setUserAtom(userData.data);
      setUserPermissions((userData?.data?.role?.permissions || []).map((p) => p.code));
    }
  }, [userData?.data]);

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />
      <Dialog />

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {isLg ? <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={questionnaireNavEnum} /> : null}
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar isDisabled={isInitialLoadingUser} />
        </div>

        <div className="flex flex-1 flex-col items-end gap-y-2 p-4">
          {isInitialLoadingUser ? null : (
            <div className="w-fit">
              <Button
                icon={IconEnum.add}
                label="Create new questionnaire"
                onClick={() =>
                  setDrawer((prev) => ({
                    ...prev,
                    type: "questionnaires",
                    title: "Create new questionnaire",
                    data: {},
                    size: "xl",
                  }))
                }
              />
            </div>
          )}
          {isInitialLoadingUser ? (
            <Skeleton limit={4} type="project_view" />
          ) : (
            <TablePageLayout>
              <Table
                columns={createColumns()}
                config={{ getLink: (rowData) => `/questionnaires/${rowData.id}` }}
                data={questionnaires?.data || []}
                dispatch={dispatch}
                isLoading={isLoading}
                type="questionnaires"
              />
            </TablePageLayout>
          )}
        </div>
        {isLg ? null : <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={questionnaireNavEnum} />}
      </div>
    </div>
  );
}
