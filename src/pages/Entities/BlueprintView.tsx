import { SetStateAction, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Icon, Table, TablePageLayout } from "../../components";
import { useBreakpoint, useChangeNavbarTitle, useDeleteMany, useGetEntities, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType } from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import { dialogAtom, drawerAtom, getDefaultEntityIcon, IconEnum, TextFilters } from "../../utils";

const columnHelper = createColumnHelper<BlueprintType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
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

export function BlueprintView() {
  const { project_id } = useParams();
  const { isMd } = useBreakpoint();
  useChangeNavbarTitle("Blueprints");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const columns = createColumns(setDrawer, setDialog);
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
      fields: ["id", "title", "title_name", "icon"],
      data: {
        project_id,
      },
    },
    "blueprints",
  );

  return (
    <TablePageLayout>
      <div className="flex h-full w-full flex-col">
        <div className="flex h-12 w-full items-center justify-end gap-x-2">
          <div className="w-fit">
            <Button
              icon={IconEnum.add}
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
            selectedActions: [
              {
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
                      description: `Are you sure you want to delete ${ids.length} ${
                        ids.length === 1 ? "blueprint" : "blueprints"
                      }?`,
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
              },
            ],
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
