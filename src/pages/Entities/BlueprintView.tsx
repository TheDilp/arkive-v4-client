import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Icon, Table, TablePageLayout } from "../../components";
import { useBreakpoint, useChangeNavbarTitle, useDeleteMany, useGetEntities, useHasPermissions, useTable } from "../../hooks";
import {
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
            items={[
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
                title: "Delete blueprint",
                icon: IconEnum.trash,
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
                    title: "Delete blueprint",
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

function getSelectedActions(
  permissions: UserHasPermissionsType,
  {
    selection,
    resetDialogAtom,
    deleteMany,
    dispatch,
    setDrawer,
    setDialog,
  }: {
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
    selectedActions.push({
      icon: IconEnum.trash,
      variant: "error",
      hasNoBackground: true,
      isIconOnly: true,
      tooltip: "Delete selected rows.",
      onClick: () => {
        const ids = Object.values(selection || {}).flatMap((id) => id);
        if (ids.length) {
          setDialog((prev) => ({
            ...prev,
            title: "Delete many",
            description: `Are you sure you want to delete ${ids.length} ${ids.length === 1 ? "blueprint" : "blueprints"}?`,
            warning: "This action cannot be undone.",
            isOverlay: true,
            cancel: {
              label: "Cancel",
              variant: "primary",
              action: resetDialogAtom,
            },
            confirm: {
              label: "Delete",
              icon: IconEnum.trash,
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
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const columns = createColumns(setDrawer, setDialog, permissions, isProjectOwner, user?.id as string, user?.role?.id);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const { mutateAsync: deleteMany } = useDeleteMany("blueprints", project_id);
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
      fields: ["id", "title", "title_name", "icon", "owner_id"],
      data: {
        project_id,
      },
      permissions: true,
    },
    "blueprints",
  );

  const selectedActions = getSelectedActions(permissions, {
    deleteMany,
    selection,
    resetDialogAtom,
    setDialog,
    setDrawer,
    dispatch,
  });

  return (
    <TablePageLayout>
      <div className="flex h-full w-full flex-col">
        <div className="flex h-12 w-full items-center justify-end gap-x-2">
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
            filters,
            selection,
            orderBy,
            getLink: (rowData: BlueprintType) => `/projects/${project_id}/blueprints/${rowData.id}`,
            selectedActions,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="blueprints"
        />
      </div>
    </TablePageLayout>
  );
}
