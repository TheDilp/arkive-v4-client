import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { Dispatch, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Select, Table, TablePageLayout } from "../../../components";
import {
  useBreakpoint,
  useBulkUpdate,
  useDeleteMany,
  useGetEntities,
  useHasPermissions,
  useNavbarTitle,
  useTable,
} from "../../../hooks";
import { CharacterFieldTemplateType, DialogAtomType, DrawerAtomType, UserHasPermissionsType } from "../../../types";
import {
  dialogAtom,
  drawerAtom,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  TextFilters,
  userAtom,
} from "../../../utils";

const columnHelper = createColumnHelper<CharacterFieldTemplateType>();

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
    columnHelper.accessor("sort", {
      id: "sort",
      header: "Sort",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: TextFilters,
      },
      maxSize: 10,
      minSize: 5,
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
                      title: "Restore character template",
                      icon: IconEnum.restore,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "character_fields_templates",
                          },

                          title: "Restore character template",
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
                        "delete_character_fields_templates",
                        user_role_id
                      ),
                    },
                    {
                      id: "delete_template",
                      title: "Delete character template",
                      icon: IconEnum.trash,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_character_fields_templates",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "character_fields_templates",
                          },
                          title: "Delete character template",
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
                      title: "Edit template",
                      icon: IconEnum.edit,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "update_character_fields_templates",
                        user_role_id
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: row.original,
                          title: "Edit template",
                          size: "lg",
                          type: "character_fields_templates",
                        }));
                      },
                    },
                    {
                      id: "expand",
                      title: `${!row.getIsExpanded() ? "Show" : "Hide"} template fields`,
                      icon: IconEnum.additional_fields,
                      onClick: row.getToggleExpandedHandler(),
                    },
                    {
                      id: "3",
                      title: "Arkive template",
                      icon: IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_character_fields_templates",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "character_fields_templates",
                          },
                          title: "Arkive template",
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

export function CharacterTemplatesView() {
  const { project_id } = useParams();
  const { isMd } = useBreakpoint();
  useNavbarTitle("Character field templates", true);
  const [arkived, setArkived] = useState<"active" | "arkive">(ls.get("character-template-table-active") || "active");

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    ["create_character_fields_templates", "update_character_fields_templates", "delete_character_fields_templates"],
    undefined
  );

  const columns = createColumns(setDrawer, setDialog, isProjectOwner, permissions, user?.id as string, user?.role?.id);
  const { mutate: updateMany } = useBulkUpdate(project_id as string, "character_fields_templates");
  const { mutateAsync: deleteMany } = useDeleteMany("character_fields_templates", arkived === "active", project_id);

  const [{ orderBy, filters, relationFilters, pagination, selection }, dispatch] = useTable({
    orderBy: [{ field: "sort", sort: "desc" }],
    filters: {},
    relationFilters: {},
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const { data, isLoading } = useGetEntities<CharacterFieldTemplateType>(
    {
      filters,
      relationFilters,
      orderBy,
      pagination,
      data: {
        project_id,
      },
      fields: ["id", "deleted_at", "title", "sort"],
      relations: {
        tags: true,
      },
      arkived: arkived === "arkive",
      permissions: true,
    },
    "character_fields_templates"
  );

  const selectedActions = [
    ...(arkived === "arkive" && permissions?.delete_character_fields_templates
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
                  description: `Are you sure you want to restore ${ids.length} ${
                    ids.length === 1 ? "character" : "characters"
                  }?`,
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
              ids.length === 1 ? "character template" : "character templates"
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

  useEffect(() => {
    dispatch({ type: "clearSelection" });
    dispatch({ type: "setPagination", payload: { page: 0 } });
  }, [arkived]);
  return (
    <TablePageLayout>
      <div className="flex h-12 w-full items-center justify-end gap-x-2">
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setArkived(value as "active" | "arkive");
              ls.set("character-template-table-active", value);
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
            isDisabled={!permissions?.create_character_fields_templates}
            label="Create new field template"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id },
                title: "Create new field template",
                type: "character_fields_templates",
                size: "lg",
              }))
            }
            tooltip={isMd ? undefined : "Create new field template"}
          />
        </div>
      </div>
      <div className="max-h-full w-full overflow-hidden">
        <Table
          columns={columns}
          config={{
            relationFilters,
            hasSelect: true,
            hasArkived: arkived === "arkive",
            expandable: true,
            hasTags: true,
            hasTagsWarning: true,
            filters,
            selection,
            orderBy,
            selectedActions,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="character_fields_templates"
        />
      </div>
    </TablePageLayout>
  );
}
