import { useSetAtom } from "jotai";
import { Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Input, Table, TablePageLayout } from "../../components";
import { useBreakpoint, useChangeNavbarTitle, useGetEntities, useTable } from "../../hooks";
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
      maxSize: 6,
      minSize: 6,
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
  const { isMd } = useBreakpoint();
  useChangeNavbarTitle("Tags");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const [filter, setFilter] = useState("");
  const columns = createColumns(setDrawer, setDialog);
  const [{ selection, orderBy, filters, pagination }, dispatch] = useTable({
    selection: {},
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
  });
  const { data, isLoading } = useGetEntities({ data: { project_id }, filters, pagination, orderBy }, "tags");

  useLayoutEffect(() => {
    if (!filter) {
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
              and: [{ id: "quick_filter", field: "title", operator: "ilike", value: filter }],
              field: "title",
            },
          });
        }
      }, 750);

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
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder="Quick search by title"
            value={filter}
          />
        </div>
        <div className="w-fit lg:w-52">
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
            tooltip={isMd ? undefined : "Create new tags"}
          />
        </div>
      </div>
      <div className="max-h-full w-full overflow-hidden">
        <Table
          columns={columns}
          config={{
            hasSelect: true,
            expandable: true,
            orderBy,
            filters,
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
