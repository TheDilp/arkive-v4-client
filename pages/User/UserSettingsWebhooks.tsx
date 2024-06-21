import { useUser } from "@clerk/clerk-react";
import { UseMutateFunction } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { Dispatch, SetStateAction } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Icon, Table } from "../../components";
import { useDeleteEntity, useGetEntities, useGetUser, useTable } from "../../hooks";
import { DrawerAtomType, WebhookType } from "../../types";
import { drawerAtom, getDefaultEntityIcon, IconEnum } from "../../utils";

const rolesColumnHelper = createColumnHelper<WebhookType>();

type DeleteWebhookType = UseMutateFunction<
  any,
  unknown,
  {
    data: {
      id: string;
      parent_id?: string | undefined;
    };
  },
  unknown
>;

function createColumns(setDrawer: Dispatch<SetStateAction<DrawerAtomType>>, mutate: DeleteWebhookType) {
  return [
    rolesColumnHelper.display({
      id: "icon",
      cell: ({ row }) => <Icon fontSize={24} icon={row.original?.icon || getDefaultEntityIcon("webhooks")} />,
      maxSize: 3.25,
      minSize: 3.25,
      meta: {
        centered: true,
      },
    }),
    rolesColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
    }),
    rolesColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "1",
                title: "Edit webhook",
                icon: IconEnum.edit,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    size: "xl",
                    title: "Edit webhook",
                    data: { id: row.original.id },
                    type: "webhooks",
                  })),
              },
              {
                id: "2",
                title: "Delete webhook",
                onClick: () => mutate({ data: { id: row.original.id } }),
                icon: IconEnum.trash,
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
export function UserSettingsWebhooks() {
  const { user: authUser } = useUser();
  const { project_id } = useParams();
  const { data: user } = useGetUser({ data: { id: authUser?.id as string }, fields: ["id"] });
  const setDrawer = useSetAtom(drawerAtom);
  const { mutate } = useDeleteEntity("webhooks", project_id as string, false);
  const [, dispatch] = useTable({});

  function handleCreateWebhook() {
    setDrawer((prev) => ({ ...prev, title: "Create webhook", type: "webhooks", data: {} }));
  }

  const { data: webhooks, isFetching } = useGetEntities<WebhookType>(
    { data: { user_id: user?.data?.id }, fields: ["id", "title", "user_id"] },
    "webhooks",
    { enabled: !!user?.data?.id, staleTime: 5 * 60 * 1000 }
  );
  return (
    <div className="flex w-full flex-col gap-y-2">
      <div className="flex items-center justify-end">
        <div>
          <Button icon={IconEnum.add} label="Create webhook" onClick={handleCreateWebhook} />
        </div>
      </div>
      <Table
        columns={createColumns(setDrawer, mutate)}
        data={webhooks?.data || []}
        dispatch={dispatch}
        isLoading={isFetching}
        type="webhooks"
      />
    </div>
  );
}
