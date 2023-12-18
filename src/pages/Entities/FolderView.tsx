import { UseMutateFunction } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { Dispatch, MouseEvent, useLayoutEffect, useState } from "react";
import { Link, NavigateFunction, useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  createColumnHelper,
  Dropdown,
  Icon,
  Select,
  Skeleton,
  Table,
  TablePageLayout,
} from "../../components";
import {
  useBreakpoint,
  useChangeNavbarTitle,
  useDeleteMany,
  useGetEntities,
  useGetEntity,
  useTable,
  useUpdateEntity,
} from "../../hooks";
import {
  AvailableEntityType,
  BaseEntityType,
  DialogAtomType,
  DrawerAtomType,
  DrawerContentCreateNewType,
  WebhookType,
} from "../../types";
import {
  baseURLS,
  breadcrumbsAtom,
  capitalizeFirstLetter,
  contextMenuAtom,
  dialogAtom,
  drawerAtom,
  EntitiesWithTags,
  FetchFunction,
  getDefaultEntityIcon,
  getEntityFields,
  getImageURL,
  getNavbarEntityType,
  getPluralEntityType,
  getSingularEntityType,
  IconEnum,
  PublicEntities,
  savePDF,
  userAtom,
  userSettingsAtom,
} from "../../utils";
import { ProjectSettingsView } from "../Projects";
import { AssetView } from "./AssetView";
import { BlueprintView } from "./BlueprintView";
import { CharactersView } from "./CharactersView";
import { TagView } from "./TagView";
import { TemplatesView } from "./TemplatesView";

const noFetchTypes = [
  "random_table_options",
  "blueprints",
  "tags",
  "characters",
  "character_fields_templates",
  "settings",
  "assets",
];

type EntityItemType = {
  id: string;
  is_folder: boolean | null;
  title: string;
  icon?: string | null;
  image_id?: string;
};
const columnHelper = createColumnHelper<BaseEntityType>();

function columns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  entityName: string,
  entityType: "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "random_tables",
  project_id: string,
  navigate: NavigateFunction,
  webhooks: WebhookType[],
  show_image?: boolean,
) {
  return [
    columnHelper.display({
      id: "is_folder",
      header: "",
      cell: ({ row }) =>
        "image_id" in row.original && row.original?.image_id && show_image ? (
          <Avatar
            image={getImageURL(
              project_id,
              entityType === "maps" ? "map_images" : "images",
              (row.original?.image_id as string) || "",
            )}
            isBordered
            isTooltipDisabled
            size="sm"
          />
        ) : (
          <Icon
            fontSize={24}
            icon={row.original.is_folder ? IconEnum.folder : row.original.icon || getDefaultEntityIcon(entityType)}
          />
        ),
      maxSize: 3.25,
      minSize: 3.25,
      meta: {
        centered: true,
      },
    }),
    columnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className=" truncate">{row.original.title}</div>,
      size: 15,
    }),
    columnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => {
        const actions: {
          id: string;
          title: string;
          icon: string;
          onClick?: () => void;
          isDisabled?: boolean;
          subItems?: {
            id: string;
            title: string;
            onClick: () => Promise<any>;
          }[];
        }[] = [
          {
            id: "1",
            title: row.original.is_folder ? "Edit folder" : `Edit ${entityName}`,
            icon: IconEnum.edit,
            onClick: () => {
              setDrawer((prev) => ({
                ...prev,
                data: row.original,
                title: `Edit ${entityName} - ${row.original.title}`,
                size: "lg",
                type: entityType,
              }));
            },
          },
        ];

        if (entityType === "documents") {
          actions.push({
            id: "mentioned_in",
            title: "Mentioned in",
            icon: IconEnum.graph,
            onClick: () => {
              setDrawer((prev) => ({
                ...prev,
                title: "Mentioned in",
                data: { id: row.original.id, title: row.original.title, icon: row.original.icon ?? undefined },
                type: "mentioned_in",
                size: "half",
              }));
            },
          });
        }
        if (PublicEntities.includes(entityType)) {
          actions.push(
            {
              id: "view_public",
              title: "View public page",
              icon: IconEnum.public,
              onClick: () => window.open(`/public/${project_id}/documents/${row.original.id}`, "_blank"),
              isDisabled: !row.original.is_public,
            },
            {
              id: "send_to_discord",
              title: "Send to Discord",
              icon: IconEnum.discord,
              isDisabled: !row.original.is_public,
              subItems: webhooks.map((webhook) => ({
                id: webhook.id,
                title: webhook.title,
                onClick: () =>
                  FetchFunction({
                    url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                    body: JSON.stringify({
                      data: { id: row.original.id, type: entityType },
                    }),
                    method: "POST",
                  }),
              })),
            },
          );
        }
        if (entityType === "dictionaries") {
          actions.push({
            id: "download_dictionary",
            title: "Download PDF dictionary",
            icon: IconEnum.pdf,
            onClick: () => savePDF(row.original.title, row.original.id),
          });
        }

        // ALWAYS GOES LAST
        actions.push({
          id: "delete_entity",
          title: row.original.is_folder ? "Delete folder" : `Delete ${entityName}`,
          icon: IconEnum.trash,
          onClick: () => {
            setDialog((prev) => ({
              ...prev,
              data: {
                ...row.original,
                entity_title: entityType,
              },
              title: `Delete ${getSingularEntityType(entityType)}`,
              size: "sm",
              type: "delete_entity",
              isOverlay: true,
            }));
          },
        });

        return (
          <div className="flex items-center justify-center">
            <Dropdown allowedPlacements={["left", "left-start", "left-end"]} items={actions}>
              <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
            </Dropdown>
          </div>
        );
      },
    }),
  ];
}

function EntityItem({
  id,
  is_folder,
  title,
  type,
  icon,
  image_id,
  show_image,
  showContextMenu,
  changeParent,
}: EntityItemType & {
  type: AvailableEntityType;
  show_image?: boolean;
  changeParent: UseMutateFunction<
    any,
    unknown,
    {
      data: {
        id?: string | undefined;
        parent_id?: string | null | undefined;
      };
    },
    unknown
  >;

  showContextMenu: (event: MouseEvent<HTMLDivElement, MouseEvent>, item_id: string) => void;
}) {
  const { project_id } = useParams();

  return (
    <Link
      draggable
      onDragLeave={(e) => {
        e.preventDefault();
        // eslint-disable-next-line no-param-reassign
        e.currentTarget.className = "";
      }}
      onDragOver={(e) => {
        e.preventDefault();
        // eslint-disable-next-line no-param-reassign
        if (is_folder) e.currentTarget.className = "text-blue-400";
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData("item_move_data", id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (!is_folder) {
          return;
        }
        const child_id = e.dataTransfer.getData("item_move_data");
        if (child_id === id) return;
        changeParent({ data: { id: child_id, parent_id: id } });
        e.dataTransfer.clearData("item_move_data");
      }}
      to={`../${type}${is_folder ? "/folder" : ""}/${id}`}>
      <div
        className="col-span-1 flex cursor-pointer flex-col items-center justify-center hover:text-blue-400"
        onContextMenu={(e) => {
          e.preventDefault();
          showContextMenu(e as any, id);
        }}>
        <div className="pointer-events-none h-24 w-24">
          {image_id && show_image ? (
            <img
              alt={title}
              className="h-full w-full object-contain"
              src={getImageURL(project_id as string, type === "maps" ? "map_images" : "images", image_id)}
            />
          ) : (
            <Icon fontSize={100} icon={is_folder ? IconEnum.folder : icon || getDefaultEntityIcon(type)} />
          )}
        </div>
        <span className="max-w-full truncate font-lato text-white hover:text-white">{title}</span>
      </div>
    </Link>
  );
}

export function FolderView() {
  const { project_id, type, item_id } = useParams();
  const breakpoints = useBreakpoint();
  const user = useAtomValue(userAtom);
  const entityName = getSingularEntityType(type as AvailableEntityType);
  const { show_image_folder_view, show_image_table_view } = useAtomValue(userSettingsAtom);
  const [{ selection }, dispatch] = useTable({ selection: [] });
  const navigate = useNavigate();
  const [view, setView] = useState<"table" | "folders">(ls.get(`${entityName}-table`) || "table");

  const {
    data: base,
    isFetching,
    isInitialLoading,
  } = useGetEntities<BaseEntityType & { image_id?: string }>(
    {
      pagination: {
        limit: 10,
        page: 0,
      },
      data: {
        project_id,
        item_id,
      },
      filters: {
        and: [
          {
            field: "parent_id",
            operator: "is",
            value: null,
          },
        ],
      },
      relations: {
        tags: EntitiesWithTags.includes(type as string),
      },
      // @ts-ignore
      fields: getEntityFields(type as AvailableEntityType),
      orderBy: [
        {
          field: "is_folder",
          sort: "asc",
        },
        {
          field: "title",
          sort: "asc",
        },
      ],
    },
    type as AvailableEntityType,
    {
      enabled: !item_id && !!type && !noFetchTypes.includes(type),
      staleTime: 5 * 60 * 1000,
    },
  );
  const {
    data,
    isFetching: isFetchingFolder,
    isInitialLoading: isInitialLoadingFolder,
  } = useGetEntity<BaseEntityType & { image_id?: string }>(
    item_id,
    type as AvailableEntityType,
    {
      data: {
        project_id,
      },
      // @ts-ignore
      fields: getEntityFields(type as AvailableEntityType),
      relations: {
        children: true,
        parents: true,
      },
    },
    {
      enabled: !!item_id && !!type && !noFetchTypes.includes(type),
      staleTime: 5 * 60 * 1000,
      queryKeyConcat: [item_id as string],
    },
  );
  const { mutateAsync: deleteMany } = useDeleteMany(type as AvailableEntityType, project_id);

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);

  const resetDialogAtom = useResetAtom(dialogAtom);

  const { mutate: changeParent } = useUpdateEntity(type as AvailableEntityType, project_id as string);

  const setContextMenuAtom = useSetAtom(contextMenuAtom);

  useChangeNavbarTitle(
    `${capitalizeFirstLetter(getNavbarEntityType(type as AvailableEntityType | "settings") || "")} ${
      data?.data?.title ? `| ${data.data.title}` : ""
    }`,
  );

  useLayoutEffect(() => {
    if (!item_id) {
      setBreadcrumbs({ items: [], type: type as AvailableEntityType });
    } else if (data?.data?.parents && data?.data?.parents?.length) {
      setBreadcrumbs({ items: data?.data?.parents, type: type as AvailableEntityType });
    }
  }, [data, type, setBreadcrumbs, item_id]);

  if (!item_id && type === "characters") return <CharactersView />;
  if (!item_id && type === "blueprints") return <BlueprintView />;
  if (type === "tags") return <TagView />;
  if (type === "character_fields_templates") return <TemplatesView />;
  if (type === "assets") return <AssetView />;
  if (type === "settings") return <ProjectSettingsView />;
  return (
    <TablePageLayout>
      <div className="flex h-12 max-h-[3rem] min-h-[3rem] flex-col items-center justify-center">
        <div className="flex w-full items-start justify-between">
          <Breadcrumbs />
          {!item_id || data?.data?.is_folder ? (
            <div className="flex min-w-fit gap-x-2">
              <div className="w-10">
                <Button
                  icon={IconEnum.graph}
                  isIconOnly
                  onClick={() =>
                    setDrawer((prev) => ({
                      ...prev,
                      size: "half",
                      type: "mentioned_in",
                      title: "All document mentions",
                      data: { id: "", title: "", icon: "", isAll: true },
                    }))
                  }
                  tooltip="View all document connections"
                />
              </div>

              <div className="w-32">
                <Select
                  name="view"
                  onChange={({ value }) => {
                    setView(value as "folders" | "table");
                    ls.set(`${entityName}-table`, value);
                  }}
                  options={[
                    { label: "Folders", value: "folders", icon: IconEnum.folder },
                    { label: "Table", value: "table", icon: IconEnum.table },
                  ]}
                  placeholder="View"
                  value={view}
                />
              </div>
              <div className="lg:w-52">
                <Dropdown
                  allowedPlacements={["bottom-end"]}
                  items={[
                    {
                      id: "1",
                      title: `Create new ${entityName}`,
                      icon: getDefaultEntityIcon(type as AvailableEntityType),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: { project_id: project_id as string },
                          title: `Create new ${entityName}`,
                          type: type as DrawerContentCreateNewType,
                          size: "lg",
                        }));
                      },
                    },
                    {
                      id: "2",
                      title: "Create new folder",
                      icon: IconEnum.folder,
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          title: `Create new ${entityName} folder`,
                          data: { project_id, type: type as AvailableEntityType },
                          type: "folder",
                          size: "sm",
                        }));
                      },
                    },
                  ]}>
                  <div className="lg:w-52">
                    <Button
                      icon={IconEnum.add}
                      label={`Create new ${entityName}`}
                      onClick={undefined}
                      tooltip={breakpoints.isMd ? undefined : `Create new ${entityName}`}
                    />
                  </div>
                </Dropdown>
              </div>

              {(item_id || data?.data?.is_folder) && !isFetching ? (
                <div className="w-52 max-w-[208px]">
                  <Button
                    icon={IconEnum.edit}
                    label={`Edit current ${data?.data?.is_folder ? "folder" : entityName}`}
                    onClick={() => {
                      setDrawer((prev) => ({
                        ...prev,
                        size: "lg",
                        title: `Edit ${entityName}`,
                        type: type as DrawerContentCreateNewType,
                        data: { id: item_id as string, project_id: project_id as string },
                      }));
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {(isFetching || isFetchingFolder) && view === "folders" ? (
          <div className="mt-6 w-full">
            <Skeleton entity_type={type as AvailableEntityType} type="folder_view" />
          </div>
        ) : null}
      </div>
      {!isFetching && view === "folders" ? (
        <div className="grid h-full w-full grid-cols-2 content-start gap-8 md:grid-cols-4 lg:grid-cols-10">
          {(base?.data?.length && !item_id ? base.data : []).map((item) => (
            <EntityItem
              key={item.id}
              changeParent={changeParent}
              icon={item.icon}
              id={item.id}
              image_id={item?.image_id}
              is_folder={item?.is_folder ?? false}
              show_image={show_image_folder_view}
              showContextMenu={(event: MouseEvent<HTMLDivElement, MouseEvent>, id: string) =>
                setContextMenuAtom({
                  event,
                  items: [
                    {
                      id: "1",
                      title: `Edit ${item.is_folder ? "folder" : entityName}`,
                      icon: IconEnum.edit,
                      onClick: () => {
                        if (item?.is_folder)
                          setDrawer((prev) => ({
                            ...prev,
                            size: "lg",
                            title: `Edit ${entityName} - ${item.title}`,
                            type: "folder",
                            data: { id, type: type as AvailableEntityType },
                          }));
                        else
                          setDrawer((prev) => ({
                            ...prev,
                            size: "lg",
                            title: `Edit ${entityName} - ${item.title}`,
                            type: type as DrawerContentCreateNewType,
                            data: { id, project_id: project_id as string },
                          }));
                      },
                    },
                    {
                      id: "2",

                      title: `Delete ${item.is_folder ? "folder" : entityName}`,
                      icon: IconEnum.trash,
                      onClick: () =>
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...item,
                            entity_title: type,
                          },
                          title: `Delete ${item.is_folder ? "folder" : entityName}`,
                          size: "sm",
                          type: "delete_entity",
                        })),
                    },
                  ],
                })
              }
              title={item.title}
              type={type as AvailableEntityType}
            />
          ))}
          {(data?.data?.children?.length && data?.data?.is_folder ? data.data.children : []).map((item) => {
            return (
              <EntityItem
                key={item.id}
                changeParent={changeParent}
                icon={item.icon}
                id={item.id}
                image_id={item?.image_id}
                is_folder={item?.is_folder ?? false}
                show_image={show_image_folder_view}
                showContextMenu={(event: MouseEvent<HTMLDivElement, MouseEvent>, id: string) =>
                  setContextMenuAtom({
                    event,
                    items: [
                      {
                        id: "1",
                        title: `Edit ${item.is_folder ? "folder" : entityName}`,
                        icon: IconEnum.edit,
                        onClick: () => {
                          if (item?.is_folder)
                            setDrawer((prev) => ({
                              ...prev,
                              size: "sm",
                              title: `Edit ${entityName} - ${item.title}`,
                              type: "folder",
                              data: { id, type: type as AvailableEntityType },
                            }));
                          else
                            setDrawer((prev) => ({
                              ...prev,
                              size: "sm",
                              title: `Edit ${entityName} - ${item.title}`,
                              type: type as DrawerContentCreateNewType,
                              data: { id, project_id: project_id as string },
                            }));
                        },
                      },
                      {
                        id: "2",
                        title: `Delete ${entityName}`,
                        icon: IconEnum.trash,
                        onClick: () =>
                          setDialog((prev) => ({
                            ...prev,
                            data: {
                              ...item,
                              parent_id: item_id,
                              entity_title: type,
                            },
                            title: `Delete ${item.is_folder ? "folder" : entityName}`,
                            size: "sm",
                            type: "delete_entity",
                          })),
                      },
                    ],
                  })
                }
                title={item.title}
                type={type as AvailableEntityType}
              />
            );
          })}
          {!base?.data?.length && !data?.data?.children?.length && !isFetchingFolder ? (
            <div className="col-span-10 mt-2">
              <Alert label="There is no content." variant="info" />
            </div>
          ) : null}
        </div>
      ) : null}
      {view === "table" ? (
        <div className="h-full w-full">
          <Table
            columns={columns(
              setDrawer,
              setDialog,
              entityName,
              type as "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "random_tables",
              project_id as string,
              navigate,
              user?.webhooks || [],
              show_image_table_view,
            )}
            config={{
              selectedActions: [
                {
                  icon: IconEnum.trash,
                  variant: "error",
                  hasNoBackground: true,
                  isIconOnly: true,
                  tooltip: "Delete selected rows.",
                  onClick: () => {
                    const ids = Object.values(selection || {}).flatMap((id) => id);
                    if (ids.length) {
                      setDialog((prev) => ({
                        ...prev,
                        title: "Delete many",
                        description: `Are you sure you want to delete ${ids.length} ${getPluralEntityType(
                          type as AvailableEntityType,
                        )}?`,
                        warning: "This action cannot be undone.",
                        isOverlay: true,
                        cancel: {
                          label: "Cancel",
                          variant: "primary",
                          action: resetDialogAtom,
                        },
                        confirm: {
                          label: "Delete",
                          icon: IconEnum.trash,
                          action: async () =>
                            deleteMany(
                              { data: { ids } },
                              {
                                onSuccess: () => dispatch({ type: "clearSelection" }),
                              },
                            ),
                          variant: "error",
                        },
                      }));
                    }
                  },
                },
              ],
              hasSelect: true,
              hasTags: EntitiesWithTags.includes(type as string),
              selection,
              getLink: (rowData: any) => `/projects/${project_id}/${type}${rowData.is_folder ? "/folder" : ""}/${rowData.id}`,
            }}
            data={base?.data || data?.data?.children || []}
            dispatch={dispatch}
            isLoading={isInitialLoading || isInitialLoadingFolder}
            type={type as AvailableEntityType}
          />
        </div>
      ) : null}
    </TablePageLayout>
  );
}
