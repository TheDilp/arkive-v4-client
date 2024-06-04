import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Avatar,
  Button,
  CharacterCard,
  createColumnHelper,
  Dropdown,
  Input,
  Select,
  Table,
  TablePageLayout,
} from "../../components";
import {
  useBreakpoint,
  useBulkUpdate,
  useDeleteMany,
  useGetEntities,
  useGetInfiniteEntities,
  useHasPermissions,
  useNavbarTitle,
  useTable,
  useUpdateEntity,
  useUpdateManyPublic,
} from "../../hooks";
import {
  BulkUpdateType,
  CharacterType,
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
import {
  baseURLS,
  BooleanFilters,
  dialogAtom,
  drawerAtom,
  FetchFunction,
  getAvatarInitials,
  getCharacterFullName,
  getImageURL,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  NumberFilters,
  TextFilters,
  userAtom,
} from "../../utils";

const columnHelper = createColumnHelper<CharacterType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  updatePublicMany: UpdatePublicManyType,
  isMd: boolean,
  webhooks: WebhookType[],
  project_id: string,
  permissions: UserHasPermissionsType,
  isProjectOwner: boolean,
  user_id: string,
  user_role_id: string | undefined
) {
  return [
    columnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image={getImageURL(
              project_id,
              "images",
              row.original?.portrait?.id || ""
            )}
            initials={getAvatarInitials(
              `${row.original.first_name} ${row.original?.last_name || ""}`
            )}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(
              row.original.first_name,
              row.original?.last_name || ""
            )}
            size="sm"
          />
        </div>
      ),
      meta: {
        pinned: true,
        noLink: true,
        centered: true,
      },
      minSize: 4.5,
      maxSize: 4.5,
    }),
    columnHelper.accessor("first_name", {
      id: "first_name",
      header: "First name",
      cell: (info) => info.getValue(),
      meta: {
        pinned: true,
        sortable: true,
        filterOptions: TextFilters,
      },
      minSize: 12,
    }),
    columnHelper.accessor("last_name", {
      id: "last_name",
      header: "Last name",
      cell: (info) => info.getValue(),
      meta: {
        pinned: isMd,
        sortable: true,
        filterOptions: TextFilters,
      },
      minSize: 12,
    }),
    columnHelper.accessor("nickname", {
      id: "nickname",
      header: "Nickname",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: TextFilters,
      },
      maxSize: 15,
    }),
    columnHelper.accessor("age", {
      id: "age",
      header: "Age",
      cell: (info) => info.getValue() || "",
      meta: {
        sortable: true,
        centered: true,
        filterOptions: NumberFilters,
      },
      minSize: 8,
      maxSize: 8,
    }),
    columnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
        filterOptions: BooleanFilters,
      },
      cell: ({ row }) => (
        <Button
          hasNoBackground
          icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
          isDisabled={!!row.original.deleted_at}
          isIconOnly
          onClick={async () => {
            await updatePublicMany({
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
                      title: "Restore character",
                      icon: IconEnum.restore,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "characters",
                          },

                          title: "Restore character",
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
                        "delete_characters",
                        user_role_id
                      ),
                    },
                    {
                      id: "delete_character",
                      title: row.original.deleted_at
                        ? "Delete character"
                        : "Arkive character",
                      icon: row.original.deleted_at
                        ? IconEnum.trash
                        : IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_characters",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "characters",
                          },
                          title: row.original.deleted_at
                            ? "Delete character"
                            : "Arkive character",
                          size: "sm",
                          type: row.original.deleted_at
                            ? "delete_entity"
                            : "arkive_entity",
                          isOverlay: true,
                        }));
                      },
                    },
                  ]
                : [
                    {
                      id: "1",
                      title: "Edit character",
                      icon: IconEnum.edit,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "update_characters",
                        user_role_id
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: row.original,
                          title: `Edit character - ${getCharacterFullName(
                            row.original.first_name,
                            "",
                            row.original?.last_name
                          )}`,
                          size: "2xl",
                          type: "characters",
                        }));
                      },
                    },
                    {
                      id: "2",
                      title: "View relationship tree",
                      icon: IconEnum.family_tree,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "read_characters",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog({
                          type: "family_tree",
                          title: `Relationship tree of ${getCharacterFullName(
                            row.original.first_name,
                            "",
                            row.original?.last_name || ""
                          )}`,
                          data: { id: row.original.id },
                          size: "lg",
                        });
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
                              data: { id: row.original.id, type: "characters" },
                            }),
                            method: "POST",
                          }),
                      })),
                    },
                    {
                      id: "view_public",
                      title: "View public page",
                      icon: IconEnum.public,
                      onClick: () =>
                        window.open(
                          `/public/${project_id}/characters/${row.original.id}`,
                          "_blank"
                        ),
                      isDisabled: !row.original.is_public,
                    },
                    {
                      id: "delete_character",
                      title: row.original.deleted_at
                        ? "Delete character"
                        : "Arkive character",
                      icon: row.original.deleted_at
                        ? IconEnum.trash
                        : IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_characters",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "characters",
                          },
                          title: row.original.deleted_at
                            ? "Delete character"
                            : "Arkive character",
                          size: "sm",
                          type: row.original.deleted_at
                            ? "delete_entity"
                            : "arkive_entity",
                          isOverlay: true,
                        }));
                      },
                    },
                  ]
            }
          >
            <Button
              hasNoBackground
              icon={IconEnum.actions}
              iconSize={28}
              isIconOnly
              onClick={undefined}
            />
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
    data: CharacterType[];
    dispatch: TableDispatch;
  }
) {
  const selectedActions: TableSelectedAction[] = [];
  if (permissions?.update_characters) {
    selectedActions.push(
      {
        icon: IconEnum.eye,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set public",
        onClick: async () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) =>
            ids.includes(e.id)
          );
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
          const entitesNotFolders = (data || [])?.filter((e) =>
            ids.includes(e.id)
          );
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
            data: { items: charactersWithTags, dispatch, type: "characters" },
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
              selectablePermissions: [
                "read_characters",
                "update_characters",
                "delete_characters",
              ],
              type: "characters",
            },
          }));
        },
      }
    );
  }

  if (permissions?.delete_characters) {
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
              description: `Are you sure you want to restore ${ids.length} ${ids.length === 1 ? "character" : "characters"}?`,
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
            warning:
              arkived === "arkive"
                ? "This action cannot be undone."
                : undefined,
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

function CharacterViewHeader({
  setArkived,
  setDrawer,
  setFilter,
  setView,
  dispatch,
  arkived,
  view,
  permissions,
  isMd,
}: {
  isMd: boolean;
  setView: any;
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
  setFilter: Dispatch<SetStateAction<string>>;
  setArkived: Dispatch<SetStateAction<"active" | "arkive">>;
  arkived: "active" | "arkive";
  dispatch: TableDispatch;
  view: "card" | "table";
  permissions: UserHasPermissionsType;
}) {
  const { project_id } = useParams();
  const [localFilter, setLocalFilter] = useState("");

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      setFilter(localFilter);
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [localFilter]);

  return (
    <div className="sticky top-0 flex h-12 max-h-12 min-h-[3rem] w-full items-center justify-end gap-x-2">
      <div className="mr-auto">
        <div className="h-11 w-11">
          <Button
            icon={IconEnum.filter}
            isIconOnly
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                type: "character_filter",
                data: { dispatch },
                size: "xl",
                title: "Character filter",
              }))
            }
            tooltip="Filter characters"
          />
        </div>
      </div>
      <div className="w-52">
        <Input
          isClearable
          name="quick_filter"
          onChange={({ value }) => setLocalFilter(value as string)}
          placeholder="Quick search by first name"
          type="search"
          value={localFilter}
        />
      </div>
      <div className="w-32">
        <Select
          name="view"
          onChange={({ value }) => {
            setArkived(value as "active" | "arkive");
            ls.set("characters-table-active", value);
          }}
          options={[
            { label: "Active", value: "active", icon: IconEnum.eye },
            { label: "Arkived", value: "arkive", icon: IconEnum.archive },
          ]}
          placeholder="Active or arkived"
          value={arkived}
        />
      </div>
      <div className="w-32">
        <Select
          name="view"
          onChange={({ value }) => {
            setView(value as "card" | "table");
            ls.set("characters_view", value);
          }}
          options={[
            { label: "Card", value: "card", icon: IconEnum.card },
            { label: "Table", value: "table", icon: IconEnum.table },
          ]}
          placeholder="View"
          value={view}
        />
      </div>
      <div className="lg:w-52">
        <Button
          icon={IconEnum.add}
          isDisabled={!permissions?.create_characters}
          label="Create new character"
          onClick={() =>
            setDrawer((prev) => ({
              ...prev,
              data: { project_id },
              title: "Create new character",
              type: "characters",
              size: "2xl",
            }))
          }
          tooltip={isMd ? undefined : "Create new character"}
        />
      </div>
    </div>
  );
}

export function CharactersView() {
  useNavbarTitle("Characters", true);
  const { isMd } = useBreakpoint();
  const [view, setView] = useState<"card" | "table">(
    ls.get("characters_view") || "table"
  );
  const [arkived, setArkived] = useState<"active" | "arkive">(
    ls.get("characters-table-active") || "active"
  );
  const [filter, setFilter] = useState("");
  const { project_id } = useParams();
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    [
      "read_characters",
      "create_characters",
      "update_characters",
      "delete_characters",
    ],
    undefined
  );
  const [
    { orderBy, filters, relationFilters, pagination, selection },
    dispatch,
  ] = useTable({
    orderBy: [{ field: "first_name", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
    selection: {},
  });
  const { data, isLoading } = useGetEntities<CharacterType>(
    {
      data: { project_id: project_id as string },
      relations: {
        portrait: true,
        tags: true,
        is_favorite: true,
      },
      orderBy,
      filters,
      relationFilters,
      pagination,
      fields: [
        "id",
        "deleted_at",
        "first_name",
        "nickname",
        "last_name",
        "portrait_id",
        "is_public",
        "age",
        "owner_id",
      ],
      permissions: true,
      arkived: arkived === "arkive",
    },
    "characters",
    {
      staleTime: 5 * 60 * 1000,
      prefetch: true,
      enabled: view === "table" && !!permissions?.read_characters,
    }
  );
  const { mutateAsync: updatePublicMany } = useUpdateManyPublic(
    "characters",
    project_id as string
  );
  const { mutate: updateMany } = useBulkUpdate(
    project_id as string,
    "characters"
  );

  const { mutateAsync: deleteMany } = useDeleteMany(
    "characters",
    arkived === "active",
    project_id
  );
  const {
    data: cardData,
    isFetching,
    fetchNextPage,
  } = useGetInfiniteEntities<CharacterType>(
    {
      data: {
        project_id,
      },
      relations: {
        portrait: true,
        is_favorite: true,
      },
      fields: ["id", "deleted_at", "full_name", "age", "owner_id"],
      filters,
      pagination: {
        limit: 12,
      },
      orderBy: [
        {
          field: "first_name",
          sort: "asc",
        },
      ],
      permissions: true,
      arkived: arkived === "arkive",
    },
    "characters",
    {
      enabled: view === "card" && permissions?.read_characters,
      keepPreviousData: true,
      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    }
  );
  const { mutate } = useUpdateEntity<{
    data: Partial<CharacterType>;
    relations: { is_favorite: boolean };
  }>("characters", project_id as string);

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const resetDialogAtom = useResetAtom(dialogAtom);

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
    if (!filter || view === "card") {
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
              and: [
                {
                  id: "quick_filter",
                  header_name: "quick_filter",
                  field: "first_name",
                  operator: "ilike",
                  value: filter,
                },
              ],
              field: "first_name",
            },
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch, view, arkived]);

  return (
    <TablePageLayout>
      <CharacterViewHeader
        arkived={arkived}
        dispatch={dispatch}
        isMd={isMd}
        permissions={permissions}
        setArkived={setArkived}
        setDrawer={setDrawer}
        setFilter={setFilter}
        setView={setView}
        view={view}
      />
      {view === "card" ? (
        <div
          className="grid grid-cols-1 gap-4 overflow-y-auto p-4 pb-36 md:grid-cols-2 lg:grid-cols-4"
          onScroll={(e) => {
            const { currentTarget } = e;

            if (currentTarget) {
              // @ts-ignore
              const scrollFetchMarker =
                currentTarget.scrollHeight -
                  currentTarget.scrollTop -
                  currentTarget.clientHeight <=
                600;
              if (scrollFetchMarker && !isFetching) {
                fetchNextPage();
              }
            }
          }}
        >
          {(cardData?.pages || [])?.map((page) =>
            page.data.map((char: CharacterType) => (
              <CharacterCard
                key={char.id}
                full_name={char.full_name}
                id={char?.id}
                is_favorite={char?.is_favorite}
                portrait_id={char?.portrait_id}
              />
            ))
          )}
        </div>
      ) : (
        <div className="w-full flex-1 overflow-hidden">
          <Table
            columns={createColumns(
              setDrawer,
              setDialog,
              updatePublicMany,
              isMd,
              user?.webhooks || [],
              project_id as string,
              permissions,
              isProjectOwner,
              user?.id as string,
              user?.role?.id
            )}
            config={{
              hasSelect: true,
              hasArkived: arkived === "arkive",
              hasFavorite: true,
              hasTags: true,
              orderBy,
              filters,
              relationFilters,
              selection,
              getLink: (rowData: any) =>
                arkived === "active"
                  ? `/projects/${project_id}/characters/${rowData.id}/biography`
                  : "#",
              setFavorite: (rowData: any) => {
                mutate({
                  data: { id: rowData.id },
                  relations: {
                    is_favorite: !rowData.is_favorite,
                  },
                });
              },
              selectedActions,
            }}
            data={data?.data || []}
            dispatch={dispatch}
            isLoading={isLoading}
            pagination={pagination}
            type="characters"
          />
        </div>
      )}
    </TablePageLayout>
  );
}
