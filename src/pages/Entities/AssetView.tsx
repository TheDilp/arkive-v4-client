import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useGetImages, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType, ImageType } from "../../types";
import { dialogAtom, drawerAtom, getAvatarInitials, getImageURL, IconEnum, NameFilters } from "../../utils";

const columnHelper = createColumnHelper<ImageType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
) {
  return [
    columnHelper.display({
      id: "image_id",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image={getImageURL(row.original.project_id, "images", row.original?.id || "")}
            isBordered
            isTooltipDisabled
            label={getAvatarInitials(row.original.title)}
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
                label: "Edit image",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: `Edit image ${row.original.title}`,
                    size: "lg",
                    type: "images",
                  }));
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

export function AssetView() {
  const { project_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const [{ orderBy, filters, selection, pagination }, dispatch] = useTable({
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
  });
  const { data: assets, isLoading } = useGetImages(project_id as string, "images", { orderBy, pagination });
  return (
    <TablePageLayout>
      <div className="h-full max-h-[85%] w-full overflow-hidden">
        <Table
          columns={createColumns(setDrawer, setDialog)}
          config={{
            hasSelect: true,
            orderBy,
            filters,
            selection,
          }}
          data={assets?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="characters"
        />
      </div>
    </TablePageLayout>
  );
}
