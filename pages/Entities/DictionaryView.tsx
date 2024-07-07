import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { Dispatch, useEffect, useLayoutEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Input, Select, Table } from "../../components";
import { useDeleteMany, useGetEntities, useGetEntity, useHasPermissions, useNavbarTitle, useTable } from "../../hooks";
import { DialogAtomType, DictionaryType, DrawerAtomType, WebhookType, WordType } from "../../types";
import {
  baseURLS,
  dialogAtom,
  drawerAtom,
  FetchFunction,
  getPluralEntityType,
  hasActionPermission,
  hasEntityUpdatePermissionForEntityView,
  IconEnum,
  isProjectOwnerAtom,
  TextFilters,
  useNotifications,
  userAtom,
} from "../../utils";

type FilterType = "title" | "translation";
const columnHelper = createColumnHelper<WordType>();
function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  parent_id: string,
  webhooks: WebhookType[],
  is_public?: boolean
) {
  const columns: ColumnDef<any, any>[] = [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => <div className="pr-1 italic">{info.getValue()}</div>,
      meta: {
        sortable: true,
        filterOptions: TextFilters,
      },
    }),
    columnHelper.accessor("translation", {
      id: "translation",
      header: "Translation",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: TextFilters,
      },
    }),
  ];
  if (!is_public)
    columns.push(
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
                  title: "Edit Word",
                  icon: IconEnum.edit,
                  onClick: () => {
                    setDrawer((prev) => ({
                      ...prev,
                      data: { id: row.original.id },
                      title: `Edit word - ${row.original.title}`,
                      size: "lg",
                      type: "words",
                    }));
                  },
                },
                {
                  id: "expand",
                  title: `${!row.getIsExpanded() ? "Show" : "Hide"} context`,
                  icon: IconEnum.text_align_justify,
                  onClick: row.getToggleExpandedHandler(),
                },
                {
                  id: "send_to_discord",
                  title: "Send to Discord",
                  icon: IconEnum.discord,
                  isDisabled: !is_public,
                  subItems: webhooks.map((webhook) => ({
                    id: webhook.id,
                    title: webhook.title,
                    onClick: () =>
                      FetchFunction({
                        url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                        body: JSON.stringify({
                          data: {
                            id: row.original.id,
                            type: "words",
                          },
                        }),
                        method: "POST",
                      }),
                  })),
                },
                {
                  id: "delete_word",
                  title: "Delete word",
                  icon: IconEnum.trash,
                  onClick: () => {
                    setDialog((prev) => ({
                      ...prev,
                      data: {
                        ...row.original,
                        parent_id,
                        entity_title: "words",
                      },
                      title: "Delete word",
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
      })
    );

  if (is_public)
    columns.push(
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
                  id: "expand",
                  title: `${!row.getIsExpanded() ? "Show" : "Hide"} context`,
                  icon: IconEnum.text_align_justify,
                  onClick: row.getToggleExpandedHandler(),
                },
              ]}>
              <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
            </Dropdown>
          </div>
        ),
      })
    );

  return columns;
}

export function DictionaryView({ id }: { id?: string }) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const [filter, setFilter] = useState("");
  const user = useAtomValue(userAtom);
  const [filterType, setFilterType] = useState<FilterType>("title");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const resetDialogAtom = useResetAtom(dialogAtom);
  const { mutateAsync: deleteMany } = useDeleteMany("words", false, project_id);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    ["update_dictionaries", "read_words", "create_words", "update_words", "delete_words"],
    undefined
  );

  const [{ orderBy, filters, pagination, selection }, dispatch] = useTable({
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const setEntityUpdatePermission = useSetAtom(hasEntityUpdatePermissionForEntityView);
  const { data, isInitialLoading, error } = useGetEntity<DictionaryType>(
    item_id || id,
    "dictionaries",
    {
      fields: ["id", "owner_id", "title", "is_public"],
      permissions: true,
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );
  const updateDictionaryPermission = hasActionPermission(
    isProjectOwner,
    user?.id === data?.data?.owner_id,
    permissions,
    data?.data?.permissions || [],
    "update_dictionaries",
    user?.role?.id
  );
  const { data: words, isInitialLoading: isInitialLoadingWords } = useGetEntities<WordType>(
    {
      data: {
        parent_id: item_id || id,
      },
      fields: ["id", "title", "translation"],
      filters,
      pagination,
      orderBy,
    },
    "words",
    {
      queryKeyOverwrite: ["allEntities", project_id as string, "words", filters || "filters", pagination || "pagination"],
    }
  );
  useNavbarTitle(`Dictionaries | ${data?.data?.title}`, !!data?.data?.title);

  useEffect(() => {
    setEntityUpdatePermission(updateDictionaryPermission);
  }, [updateDictionaryPermission]);

  useLayoutEffect(() => {
    if (!filter) {
      dispatch({
        type: "clearAllFilters",
      });
    }
    if (filter.length >= 1) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: {
              and: [{ id: "quick_filter", header_name: "title", field: filterType, operator: "ilike", value: filter }],
              field: filterType,
            },
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch, filterType]);

  if ((IS_PUBLIC && !data?.data?.is_public) || error) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });

    return <Navigate to={`/${project_id}/dictionaries`} />;
  }

  return (
    <>
      <div className="sticky top-0 flex w-full items-center justify-end gap-x-2">
        {IS_PUBLIC ? <h2 className="font-lato flex-1 text-3xl">{data?.data?.title || ""}</h2> : null}
        <div className="w-48">
          <Input
            isClearable
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder={`Search by ${filterType}`}
            value={filter}
          />
        </div>
        <div className="w-40">
          <Select
            name="filterType"
            onChange={({ value }) => setFilterType(value as FilterType)}
            options={[
              { label: "Title", value: "title", icon: IconEnum.word },
              { label: "Translation", value: "translation", icon: IconEnum.dictionary },
            ]}
            placeholder="View"
            value={filterType}
          />
        </div>
        {id || IS_PUBLIC ? null : (
          <div className="w-52">
            <Button
              icon={IconEnum.add}
              isDisabled={!updateDictionaryPermission || !permissions?.create_words}
              label="Create new word"
              onClick={() =>
                setDrawer((prev) => ({
                  ...prev,
                  data: {},
                  title: "Create new word",
                  type: "words",
                  size: "lg",
                }))
              }
            />
          </div>
        )}
      </div>
      <div className="overflow-hidden">
        <Table
          columns={createColumns(setDrawer, setDialog, (item_id || id) as string, user?.webhooks || [])}
          config={{
            hasSelect: !id && !IS_PUBLIC,
            orderBy,
            filters,
            selection,
            expandable: true,
            selectedActions: [
              {
                icon: IconEnum.trash,
                variant: "error",
                hasNoBackground: true,
                isIconOnly: true,
                tooltip: "Delete selected rows",
                onClick: () => {
                  const ids = Object.values(selection || {}).flatMap((i) => i);
                  if (ids.length) {
                    setDialog((prev) => ({
                      ...prev,
                      title: "Delete many",
                      description: `Are you sure you want to delete ${ids.length} ${getPluralEntityType("words")}?`,
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
                            }
                          ),
                        variant: "error",
                      },
                    }));
                  }
                },
              },

              ...(permissions?.is_owner
                ? [
                    {
                      icon: IconEnum.permissions,
                      hasNoBackground: true,
                      isIconOnly: true,
                      tooltip: "Change access",
                      onClick: () => {
                        const ids = Object.values(selection || {}).flatMap((i) => i);

                        setDrawer((prev) => ({
                          ...prev,
                          size: "lg",
                          title: "Edit access",
                          type: "bulk_access",
                          data: {
                            ids,
                            selectablePermissions: ["read_words", "update_words", "delete_words"],
                            type: "characters",
                          },
                        }));
                      },
                    },
                  ]
                : []),
            ],
          }}
          data={words?.data || []}
          dispatch={dispatch}
          isLoading={isInitialLoading || isInitialLoadingWords}
          pagination={pagination}
          type="words"
        />
      </div>
    </>
  );
}

