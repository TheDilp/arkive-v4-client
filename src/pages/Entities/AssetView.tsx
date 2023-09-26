import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, createColumnHelper, Dropdown, Image, Input, Select, Table, TablePageLayout } from "../../components";
import { useDownloadImage, useGetImages, useGetInfiniteAssets, useTable } from "../../hooks";
import { DialogAtomType, DrawerAtomType, ImageType } from "../../types";
import { dialogAtom, drawerAtom, getAvatarInitials, getImageURL, IconEnum, NameFilters } from "../../utils";

const columnHelper = createColumnHelper<ImageType>();
type downloadImageMutationType = UseMutateAsyncFunction<
  any,
  unknown,
  {
    data: {
      id: string;
      title: string;
    };
  },
  unknown
>;
function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  downloadImage: downloadImageMutationType,
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
                id: "2",
                label: "Download",
                icon: IconEnum.download,
                onClick: () => downloadImage({ data: row.original }),
              },
              {
                id: "delete_image",
                label: "Delete image",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "images",
                      asset_type: "images",
                    },
                    title: "Delete image",
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
  const { mutateAsync: downloadImage } = useDownloadImage(project_id, "images");
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"card" | "table">("table");
  const [{ orderBy, filters, selection, pagination }, dispatch] = useTable({
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
  });

  const { data: assets, isLoading } = useGetImages(
    project_id as string,
    "images",
    { orderBy, filters, pagination },
    { enabled: view === "table" },
  );

  const {
    data: infiniteAssets,
    isFetching,
    fetchNextPage,
  } = useGetInfiniteAssets<ImageType>(
    {
      filters,
      pagination: {
        limit: 12,
      },
      orderBy: [
        {
          field: "title",
          sort: "asc",
        },
      ],
    },
    "images",
    project_id,
    {
      enabled: view === "card",
      keepPreviousData: true,
      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    },
  );

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
  }, [filter, dispatch, view]);

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
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setView(value as "card" | "table");
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
          {(infiniteAssets?.pages || [])?.map((page) =>
            page.data.map((img: ImageType) => (
              <div className="overflow-hidden">
                <Image image={img} isOpenable />
              </div>
            )),
          )}
        </div>
      ) : (
        <div className="h-full max-h-[85%] w-full overflow-hidden">
          <Table
            columns={createColumns(setDrawer, setDialog, downloadImage)}
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
      )}
    </TablePageLayout>
  );
}
