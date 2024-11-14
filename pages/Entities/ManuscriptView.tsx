import { useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import React, { Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Icon, Input, Select, Table, TablePageLayout } from "../../components";
import {
  useBreakpoint,
  useBulkUpdate,
  useDeleteMany,
  useGetEntities,
  useHasPermissions,
  useNavbarTitle,
  useTable,
  useUpdateManyPublic,
} from "../../hooks";
import {
  BulkUpdateType,
  DeleteManyType,
  DialogAtomType,
  DrawerAtomType,
  TableDispatch,
  TableSelectedAction,
  TableSelectionType,
  UpdatePublicManyType,
  UserHasPermissionsType,
  WebhookType,
} from "../../types";
import { ManuscriptType } from "../../types/EntityTypes/manuscriptTypes";
import {
  AvailableIcons,
  baseURLS,
  dialogAtom,
  drawerAtom,
  FetchFunction,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  openPublicPage,
  TextFilters,
  userAtom,
} from "../../utils";

const columnHelper = createColumnHelper<ManuscriptType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  updateMany: UpdatePublicManyType,
  webhooks: WebhookType[],
  isProjectOwner: boolean,
  permissions: UserHasPermissionsType,
  user_id: string,
  user_role_id: string | undefined,
  project_id: string | undefined
) {
  return [
    columnHelper.display({
      id: "icon",
      header: "",
      cell: ({ row }) => (
        <div className="flex w-full justify-center">
          <Icon fontSize={24} icon={(row.original.icon as AvailableIcons | undefined) || IconEnum.manuscripts} />
        </div>
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
        filterOptions: TextFilters,
      },
    }),
    columnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
      },
      cell: ({ row }) => (
        <Button
          hasNoBackground
          icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
          isDisabled={
            !!row.original.deleted_at ||
            !hasActionPermission(
              isProjectOwner,
              user_id === row.original.owner_id,
              permissions,
              row.original?.permissions || [],
              "update_manuscripts",
              user_role_id
            )
          }
          isIconOnly
          onClick={() => {
            updateMany({
              data: {
                ids: [row.original.id],
                is_public: !row.original.is_public,
              },
            });
          }}
        />
      ),
      minSize: 3.25,
      maxSize: 3.25,
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
                      title: "Restore manuscript",
                      icon: IconEnum.restore,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "manuscripts",
                          },

                          title: "Restore manuscript",
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
                        "delete_manuscripts",
                        user_role_id
                      ),
                    },
                    {
                      id: "delete_manuscript",
                      title: "Delete manuscript",
                      icon: IconEnum.trash,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_manuscripts",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "manuscripts",
                          },
                          title: "Delete manuscript",
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
                      title: "Edit manuscript",
                      icon: IconEnum.edit,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "update_manuscripts",
                        user_role_id
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: row.original,
                          title: "Edit manuscript",
                          size: "2xl",
                          type: "manuscripts",
                        }));
                      },
                    },

                    {
                      id: "send_to_discord",
                      title: "Send to Discord",
                      icon: IconEnum.discord,
                      isDisabled: !row.original.is_public,
                      subItems: webhooks.map((webhook) => ({
                        id: webhook.id,
                        title: webhook.title,
                        onClick: () =>
                          FetchFunction({
                            url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                            body: JSON.stringify({
                              data: { id: row.original.id, type: "manuscripts" },
                            }),
                            method: "POST",
                          }),
                      })),
                    },
                    {
                      id: "view_public",
                      title: "View public page",
                      icon: IconEnum.public,
                      onClick: () => openPublicPage(`/${project_id}/manuscripts/${row.original.id}`),
                      isDisabled: !row.original.is_public,
                    },
                    {
                      id: "2",
                      title: "Arkive manuscript",
                      icon: IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_manuscripts",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "manuscripts",
                          },
                          title: "Arkive manuscript",
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
    data,
    setDrawer,
    setDialog,
  }: {
    arkived: "active" | "arkive";
    updateMany: BulkUpdateType;
    deleteMany: DeleteManyType;
    selection: TableSelectionType | undefined;
    setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
    setDialog: Dispatch<SetStateAction<DialogAtomType>>;
    resetDialogAtom: () => unknown;
    data: ManuscriptType[];
    dispatch: TableDispatch<ManuscriptType>;
  }
) {
  const selectedActions: TableSelectedAction[] = [];
  if (permissions?.update_manuscripts) {
    selectedActions.push(
      {
        icon: IconEnum.eye,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set public",
        onClick: async () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
          if (entitesNotFolders.length) {
            updateMany({
              data: ids.map((id) => ({ data: { id, is_public: true } })),
            });
            dispatch({ type: "clearSelection" });
          }
        },
      },
      {
        icon: IconEnum.eye_slash,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set private",
        onClick: async () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
          if (entitesNotFolders.length) {
            updateMany({
              data: ids.map((id) => ({ data: { id, is_public: false } })),
            });
            dispatch({ type: "clearSelection" });
          }
        },
      },
      {
        icon: IconEnum.tags,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Add/remove tags",
        onClick: () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const charactersWithTags = (data || [])
            ?.filter((e) => ids.includes(e.id))
            .map((e) => ({ id: e.id, tags: (e.tags || []).map((t) => t.id) }));

          setDrawer((prev) => ({
            ...prev,
            size: "lg",
            title: "Bulk edit tags",
            type: "bulk_tags",
            data: { items: charactersWithTags, dispatch, type: "manuscripts" },
          }));
        },
      },
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
              selectablePermissions: ["read_manuscripts", "update_manuscripts", "delete_manuscripts"],
              type: "manuscripts",
            },
          }));
        },
      }
    );
  }

  if (permissions?.delete_manuscripts) {
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
              description: `Are you sure you want to restore ${ids.length} ${ids.length === 1 ? "manuscript" : "manuscripts"}?`,
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
                    {
                      data: ids.map((id) => ({
                        data: { id, deleted_at: null },
                      })),
                    },
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
              ids.length === 1 ? "character" : "characters"
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
              action: () => {
                deleteMany(
                  { data: { ids } },
                  {
                    onSuccess: () => dispatch({ type: "clearSelection" }),
                  }
                );
                dispatch({ type: "clearSelection" });
              },
              variant: "error",
            },
          }));
        }
      },
    });
  }

  return selectedActions;
}

export function ManuscriptView() {
  const { project_id } = useParams();
  const { isMd } = useBreakpoint();
  const [arkived, setArkived] = useState<"active" | "arkive">(ls.get("manuscripts-table-active") || "active");
  useNavbarTitle("Manuscripts", true);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const { mutate: updateMany } = useBulkUpdate(project_id as string, "manuscripts");
  const { mutateAsync: deleteMany } = useDeleteMany("manuscripts", arkived === "active", project_id);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const [filter, setFilter] = useState("");
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(["create_manuscripts", "update_manuscripts", "delete_manuscripts"], undefined);
  const { mutateAsync: updatePublicMany } = useUpdateManyPublic("manuscripts", project_id as string);

  const columns = createColumns(
    setDrawer,
    setDialog,
    updatePublicMany,
    user?.webhooks || [],
    isProjectOwner,
    permissions,
    user?.id as string,
    user?.role?.id,
    project_id
  );
  const [{ selection, orderBy, filters, pagination }, dispatch] = useTable<ManuscriptType>({
    selection: {},
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 20, page: 0 },
  });
  const { data, isLoading } = useGetEntities<ManuscriptType>(
    {
      data: { project_id },
      fields: ["id", "deleted_at", "title", "is_public", "icon"],
      relations: {
        tags: true,
        documents: true,
      },
      filters,
      pagination,
      orderBy,
      arkived: arkived === "arkive",
    },
    "manuscripts"
  );
  const selectedActions = getSelectedActions(permissions, {
    deleteMany,
    updateMany,
    selection,
    resetDialogAtom,
    setDialog,
    setDrawer,
    data: data?.data || [],
    dispatch,
    arkived,
  });

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
            isDisabled={!permissions.create_manuscripts}
            label="Create new manuscript"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id: project_id as string },
                title: "Create new manuscript",
                type: "manuscripts",
                size: "2xl",
              }))
            }
            tooltip={isMd ? undefined : "Create new manuscript"}
          />
        </div>
      </div>
      <div className="max-h-full w-full overflow-hidden">
        <Table
          columns={columns}
          config={{
            hasTags: true,
            hasSelect: true,
            hasArkived: arkived === "arkive",
            expandable: true,
            orderBy,
            filters,
            selection,
            selectedActions,
            getLink: (rowData: any) => (arkived === "active" ? `/projects/${project_id}/manuscripts/${rowData.id}` : "#"),
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="manuscripts"
        />
      </div>
    </TablePageLayout>
  );
}
