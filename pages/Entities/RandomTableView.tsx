import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { Dispatch, useEffect } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, createColumnHelper, Dropdown, Icon, Table, TablePageLayout, Tooltip } from "../../components";
import { useGetEntities, useGetEntity, useHasPermissions, useTable } from "../../hooks";
import { AvailableEntityType, DialogAtomType, DrawerAtomType, WebhookType } from "../../types";
import { RandomTableOptionType, RandomTableType } from "../../types/EntityTypes/randomTableTypes";
import {
  baseURLS,
  dialogAtom,
  drawerAtom,
  FetchFunction,
  getDefaultEntityIcon,
  getSingularEntityType,
  hasActionPermission,
  hasEntityUpdatePermissionForEntityView,
  IconEnum,
  isProjectOwnerAtom,
  useNotifications,
  userAtom,
} from "../../utils";
import { getRollValue } from "../../utils/ui/diceRollerUtils";

const columnHelper = createColumnHelper<RandomTableOptionType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  webhooks: WebhookType[]
) {
  return [
    columnHelper.display({
      id: "is_folder",
      header: "",
      cell: ({ row }) => (
        <Tooltip
          content={
            !row.original.related_data?.type
              ? "Text"
              : getSingularEntityType(row.original.related_data.type as AvailableEntityType)
          }>
          <div className="flex w-full justify-center">
            {row.original.related_data?.image_id ? (
              <Avatar
                imageType={row.original.related_data.type === "maps" ? "map_images" : "images"}
                image_id={row.original.related_data.image_id || ""}
                isBordered
                isTooltipDisabled
                size="sm"
              />
            ) : null}
            {row.original.related_data?.icon ? <Icon fontSize={24} icon={row.original.related_data?.icon} /> : null}
            {row.original.related_data && !row.original.related_data.icon && !row.original.related_data.image_id ? (
              <Icon fontSize={24} icon={getDefaultEntityIcon(row.original.related_data?.type as AvailableEntityType)} />
            ) : null}
            {!row.original.related_data ? <Icon fontSize={24} icon={IconEnum.text_align_justify} /> : null}
          </div>
        </Tooltip>
      ),
      maxSize: 3.25,
      minSize: 3.25,
      meta: {
        centered: true,
        noLink: true,
      },
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
                id: "edit_option",
                title: "Edit option",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: `Edit option - ${row.original.title}`,
                    size: "lg",
                    type: "random_table_option",
                  }));
                },
              },
              {
                id: "discord",
                title: "Send to Discord",
                icon: IconEnum.discord,
                subItems: (webhooks || []).map((webhook) => ({
                  id: webhook.id,
                  title: webhook.title,
                  onClick: async () => {
                    await FetchFunction({
                      url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                      method: "POST",

                      body: JSON.stringify({
                        data: {
                          title: row.original.title,
                          description: row.original.description,
                          type: "random_table_roll",
                        },
                      }),
                    });
                  },
                })),
              },
              {
                id: "delete_option",
                title: "Delete option",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "random_table_options",
                    },
                    title: "Delete option",
                    size: "sm",
                    type: "delete_entity",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}

export function RandomTableView() {
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const user = useAtomValue(userAtom);

  const createNotification = useNotifications();
  const [{ selection, orderBy }, dispatch] = useTable({
    selection: {},
    orderBy: [{ field: "title", sort: "asc" }],
  });
  const { project_id, item_id } = useParams();

  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(["update_random_tables"], undefined);
  const setEntityUpdatePermission = useSetAtom(hasEntityUpdatePermissionForEntityView);
  const { data: randomTableData } = useGetEntity<RandomTableType>(item_id, "random_tables", {
    fields: ["id", "owner_id", "title", "is_public"],
    permissions: true,
  });
  const updateRandomTablePermission = hasActionPermission(
    isProjectOwner,
    user?.id === randomTableData?.data?.owner_id,
    permissions,
    randomTableData?.data?.permissions || [],
    "update_random_tables",
    user?.role?.id
  );

  const { data, isLoading } = useGetEntities<RandomTableOptionType>(
    {
      data: { parent_id: randomTableData?.data?.id, project_id },
      fields: ["id", "title", "description"],
      relations: { random_table_suboptions: true },
      permissions: true,
      orderBy,
    },
    "random_table_options",
    {
      enabled: !!randomTableData,
      staleTime: 5 * 60 * 1000,
      prefetch: false,
    }
  );

  useEffect(() => {
    setEntityUpdatePermission(updateRandomTablePermission);
  }, [updateRandomTablePermission]);

  async function rollOnTable(isValueOnly?: boolean): Promise<{
    option: { title: string; description: string | null } | null;
    subOption: { title: string; description: string | null } | null;
  }> {
    const selectedItems = Object.values(selection || {}).flatMap((a) => a);
    const value = await getRollValue(`1d${selectedItems?.length || data?.data?.length}`);

    const idx = value - 1;
    if (idx > -1) {
      const option = data?.data?.[idx];

      if (option) {
        if (isValueOnly) {
          return { option: { title: option.title, description: option.description || null }, subOption: null };
        }
        createNotification({
          title: option.title,
          timer: 15,
          description: option?.description || "",
          variant: "info",
          icon: IconEnum.d20,
          hasTitleBorder: true,
          position: "top",
        });
      }
      return { option: null, subOption: null };
    }
    return { option: null, subOption: null };
  }

  function handleOpenNew() {
    setDrawer((prev) => ({
      ...prev,
      data: { project_id, parent_id: item_id as string },
      title: "Create new options",
      type: "random_table_options",
      size: "lg",
    }));
  }

  return (
    <TablePageLayout>
      <div className="sticky top-0 flex w-full items-center justify-end gap-x-2">
        <div className="w-fit">
          <Dropdown
            allowedPlacements={["left"]}
            items={[
              {
                id: "local",
                title: "Roll",
                icon: IconEnum.d20,
                onClick: rollOnTable,
              },
              {
                id: "discord",
                title: "Send roll to Discord",
                icon: IconEnum.discord,
                onClick: undefined,
                subItems: (user?.webhooks || []).map((webhook) => ({
                  title: webhook.title,
                  id: webhook.id,
                  onClick: async () => {
                    const res = await rollOnTable(true);
                    await FetchFunction({
                      url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                      method: "POST",

                      body: JSON.stringify({
                        data: {
                          title: `${res.option?.title || ""} ${res?.subOption?.title ? `- ${res.subOption.title}` : ""}`,
                          description: `${res.option?.description || ""} ${res?.subOption?.description || ""}`,
                          type: "random_table_roll",
                        },
                      }),
                    });
                  },
                })),
              },
            ]}>
            <Button
              icon={IconEnum.d20}
              isDisabled={!data?.data?.length}
              label="Roll on table"
              onClick={undefined}
              tooltip={Object.values(selection || {})?.length > 0 ? "Roll from selected." : ""}
              variant="info"
            />
          </Dropdown>
        </div>
        <div className="w-52">
          <Button
            icon={IconEnum.add}
            isDisabled={!updateRandomTablePermission}
            label="Create new options"
            onClick={handleOpenNew}
          />
        </div>
      </div>
      <div className="h-full w-full overflow-hidden">
        <Table
          columns={createColumns(setDrawer, setDialog, user?.webhooks || [])}
          config={{
            hasSelect: true,
            expandable: true,
            selection,
            orderBy,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          type="random_table_options"
        />
      </div>
    </TablePageLayout>
  );
}
