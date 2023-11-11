import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useGetEntities, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType } from "../../types";
import { RandomTableOptionType } from "../../types/EntityTypes/randomTableTypes";
import { dialogAtom, drawerAtom, IconEnum, useNotifications } from "../../utils";
import { getRollValue } from "../../utils/ui/diceRollerUtils";

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
                id: "edit_option",
                label: "Edit option",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: `Edit option - ${row.original.title}`,
                    size: "lg",
                    type: "random_table_option",
                  }));
                },
              },
              {
                id: "expand",
                label: `${!row.getIsExpanded() ? "Show" : "Hide"} suboptions`,
                icon: IconEnum.random_table,
                onClick: row.getToggleExpandedHandler(),
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
                      entity_title: "random_table_options",
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
  const [{ selection }, dispatch] = useTable({
    selection: {},
  });
  const { project_id, item_id } = useParams();
  const { data, isLoading } = useGetEntities<RandomTableOptionType>(
    {
      data: { parent_id: item_id as string, project_id: project_id as string },
      relations: { random_table_suboptions: true },
    },
    "random_table_options",
    {
      staleTime: 5 * 60 * 1000,
      prefetch: false,
    },
  );

  async function rollOnTable() {
    const selectedItems = Object.values(selection || {}).flatMap((a) => a);
    const value = await getRollValue(`1d${selectedItems?.length || data?.data?.length}`);
    const idx = value - 1;
    if (idx > -1) {
      const optionIdx = selectedItems?.[idx];
      const option = data?.data?.[optionIdx ?? idx];

      if (option) {
        if (option?.random_table_suboptions?.length) {
          const subOptionRoll = await getRollValue(`1d${option.random_table_suboptions.length}`, true);
          const subIdx = subOptionRoll - 1;
          const subOption = option.random_table_suboptions[subIdx];
          if (subOption) {
            createNotification({
              title: `${option.title} - ${subOption.title}`,
              timer: 15,
              description: `${option?.description || ""} ${subOption?.description || ""}`,
              variant: "info",
              icon: IconEnum.d20,
              hasTitleBorder: true,
              position: "top",
            });
          } else {
            createNotification({
              title: option.title,
              timer: 15,
              description: option?.description || "",
              variant: "info",
              icon: IconEnum.d20,
              hasTitleBorder: true,
              position: "top",
            });
          }
        } else {
          createNotification({
            title: option.title,
            timer: 15,
            description: option?.description || "",
            variant: "info",
            icon: IconEnum.d20,
            hasTitleBorder: true,
            position: "top",
          });
        }
      }
    }
  }

  function handleOpenNew() {
    setDrawer((prev) => ({
      ...prev,
      data: { project_id, parent_id: item_id as string },
      title: "Create new options",
      type: "random_table_options",
      size: "lg",
    }));
  }

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
            onClick={rollOnTable}
            tooltip={Object.values(selection || {})?.length > 0 ? "Roll from selected." : ""}
            variant="info"
          />
        </div>
        <div className="w-52">
          <Button icon={IconEnum.add} label="Create new options" onClick={handleOpenNew} />
        </div>
      </div>
      <div className="h-full w-full overflow-hidden">
        <Table
          columns={createColumns(setDrawer, setDialog)}
          config={{
            hasSelect: true,
            expandable: true,
            selection,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          type="random_table_options"
        />
      </div>
    </TablePageLayout>
  );
}
