import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useChangeNavbarTitle, useGetEntities, useTable } from "../../hooks";
import { CharacterFieldTemplateType, DialogAtomType, DrawerAtomType } from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import { dialogAtom, drawerAtom, IconEnum, NameFilters } from "../../utils";

const columnHelper = createColumnHelper<CharacterFieldTemplateType>();

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
    columnHelper.accessor("sort", {
      id: "sort",
      header: "Sort",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
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

export function BlueprintView() {
  const { project_id } = useParams();
  useChangeNavbarTitle("The Arkive | Blueprints");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const columns = createColumns(setDrawer, setDialog);

  const [{ orderBy, filters, pagination, selection }, dispatch] = useTable({
    orderBy: [{ field: "title", sort: "asc" }],
    filters: {},
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const { data, isFetching } = useGetEntities<BlueprintType>(
    {
      filters,
      orderBy,
      pagination,
      data: {
        project_id,
      },
      relations: {
        // tags: true,
      },
    },
    "blueprints",
  );
  return (
    <TablePageLayout>
      <div className="flex w-full items-center justify-end gap-x-2">
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
            label="Create new blueprint"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id },
                title: "Create new blueprint",
                type: "blueprints",
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
            hasTags: true,
            hasTagsWarning: true,
            filters,
            selection,
            orderBy,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isFetching}
          pagination={pagination}
          type="blueprints"
        />
      </div>
    </TablePageLayout>
  );
}
