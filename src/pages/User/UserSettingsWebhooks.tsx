import { useAtomValue, useSetAtom } from "jotai";
import { Dispatch, SetStateAction } from "react";

import { Button, createColumnHelper, Dropdown, Icon, Table } from "../../components";
import { useGetEntities, useTable } from "../../hooks";
import { DrawerAtomType, WebhookType } from "../../types";
import { drawerAtom, getDefaultEntityIcon, IconEnum, userAtom } from "../../utils";

const rolesColumnHelper = createColumnHelper<WebhookType>();

function createColumns(setDrawer: Dispatch<SetStateAction<DrawerAtomType>>) {
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
              { id: "2", title: "Delete webhook", icon: IconEnum.trash },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
export function UserSettingsWebhooks() {
  const user = useAtomValue(userAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const [, dispatch] = useTable({});

  function handleCreateWebhook() {
    setDrawer((prev) => ({ ...prev, title: "Create webhook", type: "webhooks", data: {} }));
  }

  const { data: webhooks } = useGetEntities<WebhookType>(
    { data: { user_id: user?.id }, fields: ["id", "title", "user_id"] },
    "webhooks",
    { enabled: !!user?.id },
  );
  return (
    <div className="flex w-full flex-col gap-y-2 p-4">
      <div className="flex items-center justify-end">
        <div>
          <Button icon={IconEnum.add} label="Create webhook" onClick={handleCreateWebhook} />
        </div>
      </div>
      <Table columns={createColumns(setDrawer)} data={webhooks?.data || []} dispatch={dispatch} type="webhooks" />
    </div>
  );
}
