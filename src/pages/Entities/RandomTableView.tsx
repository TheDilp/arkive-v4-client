import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useGetAllEntities, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType } from "../../types";
import { RandomTableOptionType } from "../../types/EntityTypes/randomTableTypes";
import { dialogAtom, drawerAtom, IconEnum, NameFilters, useNotifications } from "../../utils";
import { rollDiceWithNotification } from "../../utils/ui/diceRollerUtils";

const columnHelper = createColumnHelper<RandomTableOptionType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
) {
  return [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
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
                label: "Edit option",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: `Edit option - ${row.original.title}`,
                    size: "lg",
                    type: "random_table_options",
                  }));
                },
              },

              {
                id: "delete_option",
                label: "Delete option",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "random table options",
                    },
                    title: "Delete option",
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

export function RandomTableView() {
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const createNotification = useNotifications();
  const [{ orderBy, filters, pagination, selection }, dispatch] = useTable({
    orderBy: { field: "first_name", sort: "asc" },
    pagination: { limit: 10, page: 0 },
    selection: {},
  });
  const { project_id, item_id } = useParams();
  const { data, isLoading } = useGetAllEntities<RandomTableOptionType>(
    {
      data: { parent_id: item_id as string, project_id: project_id as string },
    },
    "random_table_options",
    {
      staleTime: 5 * 60 * 1000,
      prefetch: false,
    },
  );

  return (
    <TablePageLayout>
      <div className="sticky top-0 flex w-full items-center justify-end gap-x-2">
        {/* <div className="w-56">
          <Input
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder="Quick search by first name"
            value={filter}
          />
        </div> */}
        {/* <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setView(value as "card" | "list");
              ls.set("characters_view", value);
            }}
            options={[
              { label: "Card", value: "card", icon: IconEnum.card },
              { label: "List", value: "list", icon: IconEnum.table },
            ]}
            placeholder="View"
            value={view}
          />
        </div> */}
        <div className="w-fit">
          <Button
            icon={IconEnum.d20}
            isDisabled={!data?.data?.length}
            label="Roll on table"
            onClick={async () => {
              await rollDiceWithNotification(createNotification, `1d${data?.data?.length}`);
            }}
            variant="info"
          />
        </div>
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
            label="Create new options"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id, parent_id: item_id },
                title: "Create new options",
                type: "random_table_options",
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
            hasTags: true,
            orderBy,
            filters,
            selection,
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
