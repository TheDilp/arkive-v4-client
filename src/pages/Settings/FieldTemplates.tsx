import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useChangeNavbarTitle, useGetAllEntities, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType, FieldTemplate } from "../../types";
import { dialogAtom, drawerAtom, IconEnum, NameFilters } from "../../utils";

const columnHelper = createColumnHelper<FieldTemplate>();

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
                label: "Edit field template",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: "Edit field template",
                    size: "lg",
                    type: "character_fields_templates",
                  }));
                },
              },
              {
                id: "expand",
                label: `${!row.getIsExpanded() ? "Show" : "Hide"} template fields`,
                icon: IconEnum.additional_fields,
                onClick: row.getToggleExpandedHandler(),
              },
              {
                id: "3",
                label: "Delete field template",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "character_fields_templates",
                    },
                    title: "Delete field template",
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

export function FieldTemplates() {
  const { project_id } = useParams();
  useChangeNavbarTitle("The Arkive | Field templates");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const columns = createColumns(setDrawer, setDialog);

  const [{ orderBy, filters, pagination }, dispatch] = useTable({
    orderBy: { field: "title", sort: "asc" },
    filters: {},
    pagination: { limit: 10, page: 0 },
  });

  const { data } = useGetAllEntities<FieldTemplate>(
    {
      filters,
      orderBy,
      pagination,
      data: {
        project_id,
      },
    },
    "character_fields_templates",
  );
  return (
    <TablePageLayout>
      <div className="flex w-full items-center justify-end gap-x-2">
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
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
          />
        </div>
      </div>
      <div className="h-[75%] max-h-full w-full overflow-hidden lg:h-[85%]">
        <Table
          columns={columns}
          config={{
            hasSelect: true,
            expandable: true,
            filters,
            orderBy,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          pagination={pagination}
          type="character_fields_templates"
        />
      </div>
    </TablePageLayout>
  );
}
