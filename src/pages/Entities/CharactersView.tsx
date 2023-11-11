import { SetStateAction, useSetAtom } from "jotai";
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
  useChangeNavbarTitle,
  useDeleteMany,
  useGetEntities,
  useGetInfiniteEntities,
  useTable,
  useUpdateEntity,
} from "../../hooks";
import { CharacterType, DialogAtomType, DrawerAtomType } from "../../types";
import {
  dialogAtom,
  drawerAtom,
  getAvatarInitials,
  getCharacterFullName,
  getImageURL,
  IconEnum,
  NameFilters,
  NumberFilters,
} from "../../utils";

const columnHelper = createColumnHelper<CharacterType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
) {
  return [
    columnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image={getImageURL(row.original.project_id, "images", row.original?.portrait?.id || "")}
            initials={getAvatarInitials(row.original.first_name, row.original?.last_name || "")}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(row.original.first_name, row.original?.last_name || "")}
            size="sm"
          />
        </div>
      ),
      meta: {
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
        sortable: true,
        filterOptions: NameFilters,
      },
    }),
    columnHelper.accessor("last_name", {
      id: "last_name",
      header: "Last name",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
      },
    }),
    columnHelper.accessor("nickname", {
      id: "nickname",
      header: "Nickname",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
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
      minSize: 6,
      maxSize: 6,
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
                label: "Edit character",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: `Edit character - ${getCharacterFullName(row.original.first_name, "", row.original?.last_name)}`,
                    size: "lg",
                    type: "characters",
                  }));
                },
              },

              {
                id: "2",
                label: "View relationship tree",
                icon: IconEnum.family_tree,
                onClick: () => {
                  setDialog({
                    type: "family_tree",
                    title: `Relationship tree of ${getCharacterFullName(
                      row.original.first_name,
                      "",
                      row.original?.last_name || "",
                    )}`,
                    data: { id: row.original.id },
                    size: "lg",
                  });
                },
              },
              {
                id: "delete_character",
                label: "Delete character",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "characters",
                    },
                    title: "Delete character",
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

export function CharactersView() {
  useChangeNavbarTitle("Characters");
  const [view, setView] = useState<"card" | "table">(ls.get("characters_view") ?? "card");
  const [filter, setFilter] = useState("");
  const { project_id } = useParams();
  const [{ orderBy, filters, relationFilters, pagination, selection }, dispatch] = useTable({
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
      },
      orderBy,
      filters,
      relationFilters,
      pagination,
    },
    "characters",
    {
      staleTime: 5 * 60 * 1000,
      prefetch: true,
      enabled: view === "table",
    },
  );
  const { mutateAsync: deleteMany } = useDeleteMany("characters", project_id);
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
      },
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
    },
    "characters",
    {
      enabled: view === "card",
      keepPreviousData: true,
      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    },
  );
  const { mutateAsync } = useUpdateEntity<{ data: Partial<CharacterType> }>("characters", project_id as string);

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const resetDialogAtom = useResetAtom(dialogAtom);
  useLayoutEffect(() => {
    if (!filter || view === "card") {
      dispatch({
        type: "clearAllFilters",
      });
    }
    if (filter.length >= 3) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: {
              and: [{ id: "quick_filter", field: "first_name", operator: "ilike", value: filter }],
              field: "first_name",
            },
          });
        }
      }, 750);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch, view]);

  return (
    <TablePageLayout>
      <div className="sticky top-0 flex h-12 w-full items-center justify-end gap-x-2">
        <div className="w-52">
          <Input
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder="Quick search by first name"
            value={filter}
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
        <div className="w-52">
          <Button
            icon={IconEnum.add}
            label="Create new character"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id },
                title: "Create new character",
                type: "characters",
                size: "lg",
              }))
            }
          />
        </div>
      </div>
      {view === "card" ? (
        <div
          className="grid grid-cols-1 gap-4 overflow-y-auto p-4 pb-36 md:grid-cols-2 lg:grid-cols-4"
          onScroll={(e) => {
            const { target } = e;
            if (target) {
              // @ts-ignore
              const scrollFetchMarker = target.scrollHeight - target.scrollTop - target.clientHeight <= 400;
              if (scrollFetchMarker && !isFetching) {
                fetchNextPage();
              }
            }
          }}>
          {(cardData?.pages || [])?.map((page) =>
            page.data.map((char: CharacterType) => (
              <CharacterCard
                key={char.id}
                first_name={char?.first_name}
                id={char?.id}
                is_favorite={char?.is_favorite}
                last_name={char?.last_name}
                portrait_id={char?.portrait_id}
              />
            )),
          )}
        </div>
      ) : (
        <div className="w-full flex-1 overflow-hidden">
          <Table
            columns={createColumns(setDrawer, setDialog)}
            config={{
              hasSelect: true,
              hasFavorite: true,
              hasTags: true,
              orderBy,
              filters,
              relationFilters,
              selection,
              getLink: (rowData: any) => `/projects/${project_id}/characters/${rowData.id}/resources`,
              setFavorite: async (rowData: any) => {
                await mutateAsync({ data: { id: rowData.id, is_favorite: !rowData.is_favorite } });
              },
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
                          ids.length === 1 ? "character" : "characters"
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
            type="characters"
          />
        </div>
      )}
    </TablePageLayout>
  );
}
