import { Dispatch, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, createColumnHelper, Dropdown, Input, Select, Table, TablePageLayout } from "../../components";
import { useChangeNavbarTitle, useGetAllEntities, useTable, useUpdateEntity } from "../../hooks";
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
  SetStateAction,
  useSetAtom,
} from "../../utils";

const columnHelper = createColumnHelper<CharacterType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
) {
  return [
    columnHelper.display({
      id: "imageId",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            image={getImageURL(row.original.project_id, "images", row.original?.portrait?.id || "")}
            initials={getAvatarInitials(row.original.first_name, row.original?.last_name || "")}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(row.original.first_name, row.original?.last_name || "")}
            size="sm"
          />
        </div>
      ),
      minSize: 5,
      maxSize: 5,
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
      maxSize: 20,
    }),
    columnHelper.accessor("age", {
      id: "age",
      header: "Age",
      cell: (info) => info.getValue(),
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
                    title: "Edit character",
                    size: "lg",
                    type: "characters",
                  }));
                },
              },
              {
                id: "2",
                label: "View family tree",
                icon: IconEnum.family_tree,
                onClick: () => {},
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
  useChangeNavbarTitle("The Arkive | Characters");
  const [view, setView] = useState<"card" | "list">("list");
  const [filter, setFilter] = useState("");
  const { project_id } = useParams();
  const [{ orderBy, filters, pagination }, dispatch] = useTable({
    orderBy: { field: "first_name", sort: "asc" },
    filters: {},
    pagination: { limit: 10, page: 0 },
  });
  const { data, isLoading } = useGetAllEntities<CharacterType>(
    {
      data: { project_id: project_id as string },
      relations: {
        portrait: true,
      },
      orderBy,
      filters,
      pagination,
    },
    "characters",
    {
      staleTime: 5 * 60 * 1000,
      prefetch: true,
    },
  );

  const { mutateAsync } = useUpdateEntity<{ data: Partial<CharacterType> }>("characters", project_id as string);

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  useEffect(() => {
    if (!filter) {
      dispatch({
        type: "clearAllFilters",
      });
    }
    const timeout = setTimeout(() => {
      if (filter) {
        dispatch({
          type: "setFilter",
          payload: { and: [{ id: "quick_filter", field: "first_name", operator: "ilike", value: filter }] },
        });
      }
    }, 750);

    return () => {
      clearTimeout(timeout);
    };
  }, [filter]);

  return (
    <TablePageLayout>
      <div className="flex w-full items-center justify-end gap-x-2">
        <div className="w-56">
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
            onChange={({ value }) => setView(value as "card" | "list")}
            options={[
              { label: "Card", value: "card", icon: IconEnum.card },
              { label: "List", value: "list", icon: IconEnum.table },
            ]}
            placeholder="View"
            value={view}
          />
        </div>

        <div className="w-fit">
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
      <div className="h-full max-h-[85%] w-full overflow-hidden">
        <Table
          columns={createColumns(setDrawer, setDialog)}
          config={{
            hasSelect: true,
            hasFavorite: true,
            orderBy,
            filters,
            getLink: (rowData: any) => `/project/${project_id}/characters/${rowData.id}`,
            setFavorite: async (rowData: any) => {
              await mutateAsync({ data: { id: rowData.id, is_favorite: !rowData.is_favorite } });
            },
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="characters"
        />
      </div>
    </TablePageLayout>
  );
}
