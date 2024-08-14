import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, createColumnHelper, Dropdown, Image, Input, Select, Table, TablePageLayout } from "../../components";
import {
  useBreakpoint,
  useDeleteMany,
  useDownloadImages,
  useGetImages,
  useGetInfiniteAssets,
  useHasPermissions,
  useNavbarTitle,
  useTable,
  useUpdateManyPublic,
} from "../../hooks";
import {
  AssetType,
  DeleteManyType,
  DialogAtomType,
  DrawerAtomType,
  ImageType,
  TableDispatch,
  TableSelectedAction,
  TableSelectionType,
  UpdatePublicManyType,
  UserHasPermissionsType,
  UserType,
} from "../../types";
import {
  baseURLS,
  BooleanFilters,
  dialogAtom,
  drawerAtom,
  FetchFunction,
  getAvatarInitials,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  TextFilters,
  userAtom,
} from "../../utils";

const columnHelper = createColumnHelper<ImageType>();
type downloadImageMutationType = UseMutateAsyncFunction<
  any,
  unknown,
  {
    data: {
      id: string;
      title: string;
    }[];
  },
  unknown
>;
function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  downloadImage: downloadImageMutationType,
  user: UserType | null,
  isProjectOwner: boolean,
  type: AssetType,
  project_id: string,
  updatePublic: UseMutateAsyncFunction<
    any,
    unknown,
    {
      data: {
        ids: string[];
        is_public: boolean;
      };
    },
    unknown
  >,
  permissions: UserHasPermissionsType
) {
  return [
    columnHelper.display({
      id: "image_id",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image_id={row.original?.id}
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
        filterOptions: TextFilters,
      },
    }),
    columnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
        filterOptions: BooleanFilters,
      },
      cell: ({ row }) => (
        <Button
          hasNoBackground
          icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
          isDisabled={
            !hasActionPermission(
              isProjectOwner,
              user?.id === row.original.owner_id,
              permissions,
              row.original?.permissions || [],
              "update_assets",
              user?.role?.id
            )
          }
          isIconOnly
          onClick={async () => {
            await updatePublic({
              data: {
                ids: [row.original.id],
                is_public: !row.original.is_public,
              },
            });
          }}
        />
      ),
      minSize: 3.25,
      maxSize: 3.25,
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
                title: "Edit image",
                icon: IconEnum.edit,
                isDisabled: !hasActionPermission(
                  isProjectOwner,
                  user?.id === row.original.owner_id,
                  permissions,
                  row.original?.permissions || [],
                  "update_assets",
                  user?.role?.id
                ),
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
                id: "send_to_discord",
                title: "Send to Discord",
                icon: IconEnum.discord,
                subItems: (user?.webhooks || []).map((webhook) => ({
                  id: webhook.id,
                  title: webhook.title,
                  onClick: () =>
                    FetchFunction({
                      url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                      body: JSON.stringify({
                        data: { id: row.original.id, type: "images" },
                      }),
                      method: "POST",
                    }),
                })),
              },
              {
                id: "2",
                title: "Download",
                icon: IconEnum.download,
                onClick: () => downloadImage({ data: [{ id: row.original.id, title: row.original.title }] }),
              },
              {
                id: "delete_image",
                title: "Delete image",
                icon: IconEnum.trash,
                isDisabled: !hasActionPermission(
                  isProjectOwner,
                  user?.id === row.original.owner_id,
                  permissions,
                  row.original?.permissions || [],
                  "delete_assets",
                  user?.role?.id
                ),
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
function getSelectedActions(
  permissions: UserHasPermissionsType,
  {
    selection,
    updatePublicMany,
    resetDialog,
    deleteMany,
    dispatch,
    data,
    setDrawer,
    setDialog,
    downloadImages,
  }: {
    updatePublicMany: UpdatePublicManyType;
    deleteMany: DeleteManyType;
    selection: TableSelectionType | undefined;
    setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
    setDialog: Dispatch<SetStateAction<DialogAtomType>>;
    resetDialog: () => unknown;
    data: ImageType[];
    downloadImages: downloadImageMutationType;
    dispatch: TableDispatch<ImageType>;
  }
) {
  const selectedActions: TableSelectedAction[] = [];
  if (permissions?.update_assets) {
    selectedActions.push(
      {
        icon: IconEnum.eye,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set public",
        onClick: async () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
          if (entitesNotFolders.length) {
            await updatePublicMany({ data: { ids, is_public: true } });
            dispatch({ type: "clearSelection" });
          }
        },
      },
      {
        icon: IconEnum.eye_slash,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set private",
        onClick: async () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
          if (entitesNotFolders.length) {
            await updatePublicMany({ data: { ids, is_public: false } });
            dispatch({ type: "clearSelection" });
          }
        },
      },
      {
        icon: IconEnum.tags,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Add/remove tags",
        onClick: () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const imagesWithTags = (data || [])
            ?.filter((e) => ids.includes(e.id))
            .map((e) => ({ id: e.id, tags: (e.tags || []).map((t) => t.id) }));

          setDrawer((prev) => ({
            ...prev,
            size: "lg",
            title: "Bulk edit tags",
            type: "bulk_tags",
            data: { items: imagesWithTags, dispatch, type: "images" },
          }));
        },
      }
    );
  }
  selectedActions.push({
    icon: IconEnum.permissions,
    hasNoBackground: true,
    isIconOnly: true,
    tooltip: "Change access",
    onClick: () => {
      const ids = Object.values(selection || {}).flatMap((id) => id);

      setDrawer((prev) => ({
        ...prev,
        size: "lg",
        title: "Edit access",
        type: "bulk_access",
        data: {
          ids,
          selectablePermissions: ["read_assets", "update_assets", "delete_assets"],
          type: "images",
        },
      }));
    },
  });
  selectedActions.push({
    icon: IconEnum.download,
    hasNoBackground: true,
    isIconOnly: true,
    tooltip: "Download selected images",
    onClick: () => {
      const ids = Object.values(selection || {}).flatMap((id) => id);
      downloadImages({
        data: data.filter((image) => ids.includes(image.id)).map((image) => ({ title: image.title, id: image.id })),
      });
    },
  });
  if (permissions?.delete_assets) {
    selectedActions.push({
      icon: IconEnum.trash,
      variant: "error",
      hasNoBackground: true,
      isIconOnly: true,
      tooltip: "Delete selected rows",
      onClick: () => {
        const ids = Object.values(selection || {}).flatMap((id) => id);
        if (ids.length) {
          setDialog((prev) => ({
            ...prev,
            title: "Delete many",
            description: `Are you sure you want to delete ${ids.length} ${ids.length === 1 ? "image" : "images"}?`,
            warning: "This action cannot be undone.",
            isOverlay: true,
            cancel: {
              label: "Cancel",
              variant: "primary",
              action: resetDialog,
            },
            confirm: {
              label: "Delete",
              icon: IconEnum.trash,
              action: async () =>
                deleteMany(
                  { data: { ids } },
                  {
                    onSuccess: () => dispatch({ type: "clearSelection" }),
                  }
                ),
              variant: "error",
            },
          }));
        }
      },
    });
  }

  return selectedActions;
}

export function AssetView() {
  const { project_id } = useParams();
  useNavbarTitle("Assets", true);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const resetDialog = useResetAtom(dialogAtom);
  const { isMd, isLg } = useBreakpoint();
  const [type, setType] = useState<AssetType>("images");

  const { mutateAsync: downloadImages } = useDownloadImages(project_id, type);
  const { mutateAsync: updatePublicMany } = useUpdateManyPublic("images", project_id as string);
  const { mutateAsync: deleteMany } = useDeleteMany("images", false, project_id);

  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"card" | "table">(ls.get("assets_view") || "table");
  const [{ orderBy, filters, relationFilters, selection, pagination }, dispatch] = useTable<ImageType>({
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
  });
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(["read_assets", "create_assets", "update_assets", "delete_assets"], undefined);

  const user = useAtomValue(userAtom);

  const { data: assets, isLoading } = useGetImages<ImageType>(
    project_id as string,
    type,
    {
      relationFilters,
      relations: { tags: true },
      orderBy,
      fields: ["id", "title", "type", "is_public"],
      filters,
      pagination,
      permissions: true,
    },
    { enabled: view === "table", prefetch: false }
  );

  const {
    data: infiniteAssets,
    isFetching,
    fetchNextPage,
  } = useGetInfiniteAssets<ImageType>(
    {
      filters,
      permissions: true,
      fields: ["id", "title", "type"],
      pagination: {
        limit: isLg ? 24 : 12,
      },
      orderBy: [
        {
          field: "title",
          sort: "asc",
        },
      ],
    },
    type,
    project_id,
    {
      enabled: view === "card",
      keepPreviousData: true,
      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    }
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
              and: [
                {
                  id: "quick_filter",
                  header_name: "title",
                  field: "title",
                  operator: "ilike",
                  value: filter,
                },
              ],
              field: "title",
            },
          });
        }
      }, 500);

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
            isClearable
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder="Quick search by title"
            value={filter}
          />
        </div>
        <div className="w-32">
          <Select
            name="type"
            onChange={({ value }) => {
              setType(value as "images" | "map_images");
            }}
            options={[
              { label: "Images", value: "images", icon: IconEnum.image },
              { label: "Map images", value: "map_images", icon: IconEnum.map },
            ]}
            placeholder="Type"
            value={type}
          />
        </div>
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setView(value as "card" | "table");
              ls.set("assets_view", value);
            }}
            options={[
              { label: "Gallery", value: "card", icon: IconEnum.image },
              { label: "Table", value: "table", icon: IconEnum.table },
            ]}
            placeholder="View"
            value={view}
          />
        </div>
        <div className="lg:w-52">
          <Button
            icon={IconEnum.upload}
            isDisabled={!permissions?.create_assets}
            label="Upload image"
            onClick={() =>
              setDialog((prev: DialogAtomType) => ({
                ...prev,
                type: "image_upload",
                title: "Upload images",
                size: "lg",
                isOverlay: true,
                data: {
                  type: "images",
                },
              }))
            }
            tooltip={isMd ? undefined : "Upload image"}
          />
        </div>
      </div>
      {view === "card" ? (
        <div
          className="grid grid-cols-1 gap-4 overflow-y-auto p-4 pb-36 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-8"
          onScroll={(e) => {
            const { currentTarget } = e;
            if (currentTarget) {
              // @ts-ignore
              const scrollFetchMarker =
                currentTarget.scrollHeight - currentTarget.scrollTop - currentTarget.clientHeight <= 1000;
              if (scrollFetchMarker && !isFetching) {
                fetchNextPage();
              }
            }
          }}>
          {(infiniteAssets?.pages || [])?.map((page) =>
            page.data.map((img: ImageType) => (
              <div
                className="animate-in fade-in relative col-span-1 flex h-[25rem] flex-col items-center justify-center overflow-hidden rounded bg-cover shadow transition-all duration-500"
                key={img.id}>
                <Image
                  hasTitle
                  image={{ title: img.title, project_id: img.project_id, type: "images", id: img.id }}
                  isLazyLoading
                  isOpenable
                  type={type}
                />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="h-full max-h-[95%] w-full overflow-hidden">
          <Table
            columns={createColumns(
              setDrawer,
              setDialog,
              downloadImages,
              user,
              isProjectOwner,
              type,
              project_id as string,
              updatePublicMany,
              permissions
            )}
            config={{
              relationFilters,
              hasSelect: true,
              hasTags: true,
              orderBy,
              filters,
              selection,
              selectedActions: getSelectedActions(permissions, {
                selection,
                setDialog,
                setDrawer,
                resetDialog,
                downloadImages,
                updatePublicMany,
                dispatch,
                deleteMany,
                data: assets?.data || [],
              }),
            }}
            data={assets?.data || []}
            dispatch={dispatch}
            isLoading={isLoading}
            pagination={pagination}
            type={type}
          />
        </div>
      )}
    </TablePageLayout>
  );
}
