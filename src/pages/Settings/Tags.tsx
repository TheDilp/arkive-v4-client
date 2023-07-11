import { useParams } from "react-router-dom";
import { useGetAllEntities, useTable } from "../../hooks";
import { Button, Dropdown, Table, TablePageLayout, createColumnHelper } from "../../components";
import { IconEnum, NameFilters, dialogAtom, drawerAtom, useSetAtom } from "../../utils";
import { Dispatch, SetStateAction } from "react";
import { DialogAtomType, DrawerAtomType, TagType } from "../../types";

type Props = {};
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
                id: "2",
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

export function Tags({}: Props) {
  const { projectId } = useParams();
  const { data } = useGetAllEntities({ data: { projectId } }, "tags");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const columns = createColumns(setDrawer, setDialog);
  const [, dispatch] = useTable({});
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
                data: { projectId },
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
            filters: {},
          }}
          data={data?.data || []}
          dispatch={dispatch}
          type="tags"
        />
      </div>
    </TablePageLayout>
  );
}
