import { useSetAtom } from "jotai";
import { Dispatch, SetStateAction } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useChangeNavbarTitle, useGetEntities, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType, TagType } from "../../types";
import { dialogAtom, drawerAtom, IconEnum, NameFilters } from "../../utils";

const columnHelper = createColumnHelper<TagType>();

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
    columnHelper.accessor("color", {
      id: "color",
      header: "Color",
      cell: (info) => (
        <div className="flex w-full justify-center">
          <div className="h-6 w-6 select-none rounded-full shadow" style={{ backgroundColor: info.getValue() }} />
        </div>
      ),
      meta: {
        sortable: true,
        noLink: true,
        centered: true,
      },
      maxSize: 5,
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
                label: "Edit tag",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: "Edit tag",
                    size: "lg",
                    type: "tags",
                  }));
                },
              },
              {
                id: "expand",
                icon: IconEnum.tags,
                label: `${!row.getIsExpanded() ? "Show" : "Hide"} entities with this tag`,
                onClick: row.getToggleExpandedHandler(),
              },
              {
                id: "3",
                label: "Delete tag",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "tags",
                    },
                    title: "Delete tag",
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

export function TagView() {
  const { project_id } = useParams();
  useChangeNavbarTitle("The Arkive | Tags");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const columns = createColumns(setDrawer, setDialog);
  const [{ selection, orderBy, pagination }, dispatch] = useTable({
    selection: {},
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
  });
  const { data, isLoading } = useGetEntities({ data: { project_id }, pagination, orderBy }, "tags");

  return (
    <TablePageLayout>
      <div className="flex w-full items-center justify-end gap-x-2">
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
            label="Create new tags"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id: project_id as string },
                title: "Create new tags",
                type: "tags",
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
            orderBy,
            filters: {},
            selection,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="tags"
        />
      </div>
    </TablePageLayout>
  );
}
