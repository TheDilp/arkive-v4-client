import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { Dispatch, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Icon, Input, Select, Table, TablePageLayout } from "../../components";
import {
  useBreakpoint,
  useBulkUpdate,
  useChangeNavbarTitle,
  useDeleteMany,
  useGetEntities,
  useHasPermissions,
  useTable,
} from "../../hooks";
import {
  BulkUpdateType,
  DeleteManyType,
  DialogAtomType,
  DrawerAtomType,
  TableDispatch,
  TableSelectedAction,
  TableSelectionType,
  UserHasPermissionsType,
} from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import {
  dialogAtom,
  drawerAtom,
  getDefaultEntityIcon,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  TextFilters,
  userAtom,
} from "../../utils";

const columnHelper = createColumnHelper<BlueprintType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  permissions: UserHasPermissionsType,
  isProjectOwner: boolean,
  user_id: string,
  user_role_id: string | undefined,
) {
  return [
    columnHelper.display({
      id: "icon",
      cell: ({ row }) => <Icon fontSize={24} icon={row.original?.icon || getDefaultEntityIcon("blueprints")} />,
      maxSize: 3.25,
      minSize: 3.25,
      meta: {
        centered: true,
      },
    }),
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: TextFilters,
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
            items={
              row.original.deleted_at
                ? [
                    {
                      id: "1",
                      title: "Restore blueprint",
                      icon: IconEnum.restore,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "blueprints",
                          },

                          title: "Restore blueprint",
                          size: "sm",
                          type: "restore_entity",
                          isOverlay: true,
                        }));
                      },
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_blueprints",
                        user_role_id,
                      ),
                    },
                    {
                      id: "delete_blueprint",
                      title: row.original.deleted_at ? "Delete blueprint" : "Arkive blueprint",
                      icon: row.original.deleted_at ? IconEnum.trash : IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_blueprints",
                        user_role_id,
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "blueprints",
                          },
                          title: row.original.deleted_at ? "Delete blueprint" : "Arkive blueprint",
                          size: "sm",
                          type: row.original.deleted_at ? "delete_entity" : "arkive_entity",
                          isOverlay: true,
                        }));
                      },
                    },
                  ]
                : [
                    {
                      id: "1",
                      title: "Edit blueprint",
                      icon: IconEnum.edit,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "update_blueprints",
                        user_role_id,
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: row.original,
                          title: "Edit blueprint",
                          size: "lg",
                          type: "blueprints",
                        }));
                      },
                    },
                    {
                      id: "2",
                      title: "Create instance",
                      isDisabled: !permissions?.create_blueprint_instances,
                      icon: IconEnum.add,
                      onClick: () =>
                        setDrawer((prev) => ({
                          ...prev,
                          data: {
                            parent_id: row.original.id,
                          },
                          title: "Create new instance",
                          type: "blueprint_instances",
                          size: "lg",
                        })),
                    },
                    {
                      id: "3",
                      title: "Arkive blueprint",
                      icon: IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_blueprints",
                        user_role_id,
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "blueprints",
                          },
                          title: "Arkive blueprint",
                          size: "sm",
                          type: "arkive_entity",
                        }));
                      },
                    },
                  ]
            }>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}

function getSelectedActions(
  permissions: UserHasPermissionsType,
  {
    selection,
    arkived,
    updateMany,
    resetDialogAtom,
    deleteMany,
    dispatch,
    setDrawer,
    setDialog,
  }: {
    arkived: "arkive" | "active";
    updateMany: BulkUpdateType;
    deleteMany: DeleteManyType;
    selection: TableSelectionType | undefined;
    setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
    setDialog: Dispatch<SetStateAction<DialogAtomType>>;
    resetDialogAtom: () => unknown;
    dispatch: TableDispatch;
  },
) {
  const selectedActions: TableSelectedAction[] = [];
  if (permissions?.is_owner) {
    selectedActions.push({
      icon: IconEnum.permissions,
      hasNoBackground: true,
      isIconOnly: true,
      tooltip: "Change access",
      onClick: () => {
        const ids = Object.values(selection || {}).flatMap((id) => id);

        setDrawer((prev) => ({
          ...prev,
          size: "lg",
          title: "Edit access",
          type: "bulk_access",
          data: {
            ids,
            selectablePermissions: ["read_blueprints", "update_blueprints", "delete_blueprints"],
            type: "blueprints",
          },
        }));
      },
    });
  }
  if (permissions?.delete_blueprints) {
    if (arkived === "arkive") {
      selectedActions.push({
        icon: IconEnum.restore,
        variant: "primary",
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Restore selected rows",
        onClick: () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          if (ids.length) {
            setDialog((prev) => ({
              ...prev,
              title: "Restore many",
              description: `Are you sure you want to restore ${ids.length} ${ids.length === 1 ? "blueprint" : "blueprints"}?`,
              isOverlay: true,
              cancel: {
                label: "Cancel",
                variant: "primary",
                action: resetDialogAtom,
              },
              confirm: {
                label: "Restore",
                icon: IconEnum.restore,
                action: () => {
                  updateMany(
                    { data: ids.map((id) => ({ data: { id, deleted_at: null } })) },
                    {
                      onSuccess: () => dispatch({ type: "clearSelection" }),
                    },
                  );
                  dispatch({ type: "clearSelection" });
                },
                variant: "success",
              },
            }));
          }
        },
      });
    }

    selectedActions.push({
      icon: arkived === "arkive" ? IconEnum.trash : IconEnum.archive,
      variant: arkived === "arkive" ? "error" : "primary",
      hasNoBackground: true,
      isIconOnly: true,
      tooltip: `${arkived === "arkive" ? "Delete" : "Arkive"} selected rows`,
      onClick: () => {
        const ids = Object.values(selection || {}).flatMap((id) => id);
        if (ids.length) {
          setDialog((prev) => ({
            ...prev,
            title: `${arkived === "arkive" ? "Delete" : "Arkive"} many`,
            description: `Are you sure you want to ${arkived === "arkive" ? "delete" : "arkive"} ${ids.length} ${
              ids.length === 1 ? "blueprint" : "blueprints"
            }?`,
            warning: arkived === "arkive" ? "This action cannot be undone." : undefined,
            isOverlay: true,
            cancel: {
              label: "Cancel",
              variant: "primary",
              action: resetDialogAtom,
            },
            confirm: {
              label: arkived === "arkive" ? "Delete" : "Arkive",
              icon: arkived === "arkive" ? IconEnum.trash : IconEnum.archive,
              action: async () =>
                deleteMany(
                  { data: { ids } },
                  {
                    onSuccess: () => dispatch({ type: "clearSelection" }),
                  },
                ),
              variant: "error",
            },
          }));
        }
      },
    });
  }

  return selectedActions;
}

export function BlueprintView() {
  const { project_id } = useParams();
  const { isMd } = useBreakpoint();
  useChangeNavbarTitle("Blueprints");
  const permissions = useHasPermissions(
    ["create_blueprints", "read_blueprints", "update_blueprints", "delete_blueprints", "create_blueprint_instances"],
    undefined,
  );
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const user = useAtomValue(userAtom);
  const [arkived, setArkived] = useState<"active" | "arkive">(ls.get("blueprint-table-active") || "active");
  const [filter, setFilter] = useState("");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const columns = createColumns(setDrawer, setDialog, permissions, isProjectOwner, user?.id as string, user?.role?.id);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const { mutate: updateMany } = useBulkUpdate(project_id as string, "blueprints");
  const { mutateAsync: deleteMany } = useDeleteMany("blueprints", arkived === "active", project_id);
  const [{ orderBy, filters, pagination, selection }, dispatch] = useTable({
    orderBy: [{ field: "title", sort: "asc" }],
    filters: {},
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const { data, isLoading } = useGetEntities<BlueprintType>(
    {
      filters,
      orderBy,
      pagination,
      fields: ["id", "deleted_at", "title", "title_name", "icon", "owner_id"],
      data: {
        project_id,
      },
      permissions: true,
      arkived: arkived === "arkive",
    },
    "blueprints",
  );

  const selectedActions = getSelectedActions(permissions, {
    arkived,
    updateMany,
    deleteMany,
    selection,
    resetDialogAtom,
    setDialog,
    setDrawer,
    dispatch,
  });

  useEffect(() => {
    if (!filter) {
      dispatch({
        type: "clearAllFilters",
      });
    }
    dispatch({ type: "clearSelection" });
    dispatch({ type: "setPagination", payload: { page: 0 } });
    if (filter.length >= 3) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: {
              and: [{ id: "quick_filter", header_name: "quick_filter", field: "title", operator: "ilike", value: filter }],
              field: "title",
            },
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch, arkived]);

  return (
    <TablePageLayout>
      <div className="flex h-12 w-full items-center justify-end gap-x-2">
        <div className="w-52">
          <Input
            isClearable
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder="Quick search by title"
            type="search"
            value={filter}
          />
        </div>
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setArkived(value as "active" | "arkive");
              ls.set("blueprint-table-active", value);
            }}
            options={[
              { label: "Active", value: "active", icon: IconEnum.eye },
              { label: "Arkived", value: "arkive", icon: IconEnum.archive },
            ]}
            placeholder="Active or arkived"
            value={arkived}
          />
        </div>
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
            isDisabled={!permissions?.create_blueprints}
            label="Create new blueprint"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id },
                title: "Create new blueprint",
                type: "blueprints",
                size: "lg",
              }))
            }
            tooltip={isMd ? undefined : "Create new blueprint"}
          />
        </div>
      </div>

      <Table
        columns={columns}
        config={{
          hasSelect: true,
          hasArkived: arkived === "arkive",
          filters,
          selection,
          orderBy,
          getLink: (rowData: BlueprintType) =>
            arkived === "active" ? `/projects/${project_id}/blueprints/${rowData.id}` : "#",
          selectedActions,
        }}
        data={data?.data || []}
        dispatch={dispatch}
        isLoading={isLoading}
        pagination={pagination}
        type="blueprints"
      />
    </TablePageLayout>
  );
}
