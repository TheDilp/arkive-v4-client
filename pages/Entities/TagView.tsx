import { useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Input, Select, Table, TablePageLayout } from "../../components";
import {
  useBreakpoint,
  useBulkUpdate,
  useDeleteMany,
  useGetEntities,
  useHasPermissions,
  useNavbarTitle,
  useTable,
} from "../../hooks";
import { DialogAtomType, DrawerAtomType, TagType, UserHasPermissionsType } from "../../types";
import { dialogAtom, drawerAtom, hasActionPermission, IconEnum, isProjectOwnerAtom, TextFilters, userAtom } from "../../utils";

const columnHelper = createColumnHelper<TagType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  isProjectOwner: boolean,
  permissions: UserHasPermissionsType,
  user_id: string,
  user_role_id: string | undefined
) {
  return [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: TextFilters,
      },
    }),
    columnHelper.accessor("color", {
      id: "color",
      header: "Color",
      cell: (info) => (
        <div className="flex w-full justify-center">
          <div className="h-6 w-6 select-none rounded-full shadow" style={{ backgroundColor: info.getValue() }} />
        </div>
      ),
      meta: {
        sortable: true,
        noLink: true,
        centered: true,
      },
      maxSize: 6,
      minSize: 6,
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
                      title: "Restore tag",
                      icon: IconEnum.restore,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "tags",
                          },

                          title: "Restore tag",
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
                        "delete_tags",
                        user_role_id
                      ),
                    },
                    {
                      id: "delete_tag",
                      title: "Delete tag",
                      icon: IconEnum.trash,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_tags",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "tags",
                          },
                          title: "Delete tag",
                          size: "sm",
                          type: "delete_entity",
                          isOverlay: true,
                        }));
                      },
                    },
                  ]
                : [
                    {
                      id: "1",
                      title: "Edit tag",
                      icon: IconEnum.edit,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "update_tags",
                        user_role_id
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: row.original,
                          title: "Edit tag",
                          size: "lg",
                          type: "edit_tag",
                        }));
                      },
                    },
                    {
                      id: "expand",
                      icon: IconEnum.tags,
                      title: `${!row.getIsExpanded() ? "Show" : "Hide"} entities with this tag`,
                      onClick: row.getToggleExpandedHandler(),
                    },
                    {
                      id: "3",
                      title: "Arkive tag",
                      icon: IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_tags",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "tags",
                          },
                          title: "Arkive tag",
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

export function TagView() {
  const { project_id } = useParams();
  const { isMd } = useBreakpoint();
  const [arkived, setArkived] = useState<"active" | "arkive">(ls.get("tag-table-active") || "active");
  useNavbarTitle("Tags", true);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const { mutate: updateMany } = useBulkUpdate(project_id as string, "tags");
  const { mutateAsync: deleteMany } = useDeleteMany("tags", arkived === "active", project_id);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const [filter, setFilter] = useState("");
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(["create_tags", "update_tags", "delete_tags"], undefined);
  const columns = createColumns(setDrawer, setDialog, isProjectOwner, permissions, user?.id as string, user?.role?.id);
  const [{ selection, orderBy, filters, pagination }, dispatch] = useTable<TagType>({
    selection: {},
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
  });
  const { data, isLoading } = useGetEntities<TagType>(
    {
      data: { project_id },
      fields: ["id", "deleted_at", "color", "title", "project_id"],
      filters,
      pagination,
      orderBy,
      arkived: arkived === "arkive",
    },
    "tags"
  );
  const selectedActions = [
    {
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
            selectablePermissions: ["read_tags", "update_tags", "delete_tags"],
            type: "tags",
          },
        }));
      },
    },

    ...(arkived === "arkive" && permissions?.delete_tags
      ? [
          {
            icon: IconEnum.restore,
            variant: "primary" as const,
            hasNoBackground: true,
            isIconOnly: true,
            tooltip: "Restore selected rows",
            onClick: () => {
              const ids = Object.values(selection || {}).flatMap((id) => id);
              if (ids.length) {
                setDialog((prev) => ({
                  ...prev,
                  title: "Restore many",
                  description: `Are you sure you want to restore ${ids.length} ${ids.length === 1 ? "tag" : "tags"}?`,
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
                        }
                      );
                      dispatch({ type: "clearSelection" });
                    },
                    variant: "success",
                  },
                }));
              }
            },
          },
        ]
      : []),
    {
      icon: arkived === "arkive" ? IconEnum.trash : IconEnum.archive,
      variant: arkived === "arkive" ? ("error" as const) : ("primary" as const),
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
              ids.length === 1 ? "tag" : "tags"
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
                  }
                ),
              variant: "error",
            },
          }));
        }
      },
    },
  ];

  useLayoutEffect(() => {
    if (!filter) {
      dispatch({
        type: "clearAllFilters",
      });
    }
    dispatch({ type: "clearSelection" });
    dispatch({ type: "setPagination", payload: { page: 0, limit: pagination?.limit } });
    if (filter.length >= 3) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: {
              and: [{ id: "quick_filter", header_name: "title", field: "title", operator: "ilike", value: filter }],
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
  }, [filter, dispatch]);

  return (
    <TablePageLayout>
      <div className="sticky top-0 flex h-12 w-full items-center justify-end gap-x-2">
        <div className="w-52">
          <Input
            isClearable
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder="Quick search by title"
            value={filter}
          />
        </div>
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setArkived(value as "active" | "arkive");
              ls.set("tag-table-active", value);
            }}
            options={[
              { label: "Active", value: "active", icon: IconEnum.eye },
              { label: "Arkived", value: "arkive", icon: IconEnum.archive },
            ]}
            placeholder="Active or arkived"
            value={arkived}
          />
        </div>
        <div className="w-fit lg:w-52">
          <Button
            icon={IconEnum.add}
            isDisabled={!permissions.create_tags}
            label="Create new tags"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id: project_id as string },
                title: "Create new tags",
                type: "tags",
                size: "lg",
              }))
            }
            tooltip={isMd ? undefined : "Create new tags"}
          />
        </div>
      </div>
      <div className="max-h-full w-full overflow-hidden">
        <Table
          columns={columns}
          config={{
            hasSelect: true,
            hasArkived: arkived === "arkive",
            expandable: true,
            orderBy,
            filters,
            selection,
            selectedActions,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="tags"
        />
      </div>
    </TablePageLayout>
  );
}
