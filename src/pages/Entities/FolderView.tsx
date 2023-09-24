import { UseMutateFunction } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { MouseEvent, useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { Alert, Breadcrumbs, Button, Dropdown, Icon, Skeleton } from "../../components";
import { useChangeNavbarTitle, useGetEntities, useGetEntity, useUpdateEntity } from "../../hooks";
import { AvailableEntityType, BaseEntityType, DrawerContentCreateNewType } from "../../types";
import {
  breadcrumbsAtom,
  capitalizeFirstLetter,
  contextMenuAtom,
  dialogAtom,
  drawerAtom,
  getDefaultEntityIcon,
  getEntityNameFromType,
  getImageURL,
  getNavbarEntityType,
  IconEnum,
} from "../../utils";
import { ProjectSettingsView } from "../Projects";
import { AssetView } from "./AssetView";
import { CharactersView } from "./CharactersView";
import { CharacterFieldTemplates } from "./FieldTemplates";
import { TagView } from "./TagView";

const fields: string[] = ["id", "title", "icon", "is_folder", "parent_id"];
const noFetchTypes = ["random_table_options", "tags", "characters", "character_fields_templates", "project-settings", "assets"];

type EntityItemType = {
  id: string;
  is_folder: boolean | null;
  title: string;
  icon?: string | null;
  image_id?: string;
};

function EntityItem({
  id,
  is_folder,
  title,
  type,
  icon,
  image_id,
  showContextMenu,
  changeParent,
}: EntityItemType & {
  type: AvailableEntityType;
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
          {image_id ? (
            <img
              alt={title}
              className="object-contain"
              src={getImageURL(project_id as string, type === "maps" ? "maps" : "images", image_id)}
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

  // IMAGE_ID MUST BE LAST ELEMENT FOR POP
  // !REWORK WITH SMARTER IMPLEMENTATION

  if ((type === "documents" || type === "maps") && !fields.includes("image_id")) fields.push("image_id");
  if (
    (type === "graphs" || type === "random_tables" || type === "calendars" || type === "dictionaries") &&
    fields.includes("image_id")
  )
    fields.pop();

  const { data: base, isFetching } = useGetEntities<BaseEntityType & { image_id?: string }>(
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
      fields,
      orderBy: [
        {
          field: "is_folder",
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
  const { data, isFetching: isFetchingFolder } = useGetEntity<BaseEntityType & { image_id?: string }>(
    item_id,
    type as AvailableEntityType,
    {
      data: {
        project_id,
      },
      fields,
      relations: {
        children: true,
        parents: true,
      },
    },
    {
      enabled: !!item_id && !!type && !noFetchTypes.includes(type),
      staleTime: 5 * 60 * 1000,
    },
  );

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);

  const { mutate: changeParent } = useUpdateEntity(type as AvailableEntityType, project_id as string);

  const setContextMenuAtom = useSetAtom(contextMenuAtom);
  const entityName = getEntityNameFromType(type as AvailableEntityType);

  useChangeNavbarTitle(
    `The Arkive | ${capitalizeFirstLetter(getNavbarEntityType(type as AvailableEntityType | "project-settings") || "")} ${
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
  if (type === "tags") return <TagView />;
  if (type === "character_fields_templates") return <CharacterFieldTemplates />;
  if (type === "assets") return <AssetView />;
  if (type === "project-settings") return <ProjectSettingsView />;

  return (
    <>
      <div className="flex h-12 items-center justify-between">
        <Breadcrumbs />
        {isFetching || isFetchingFolder ? <Skeleton entity_type={type as AvailableEntityType} type="folder_view" /> : null}
        {(!item_id || data?.data?.is_folder) && !isFetching ? (
          <div className="w-52">
            <Dropdown
              allowedPlacements={["bottom-end"]}
              items={[
                {
                  id: "1",
                  label: `Create new ${entityName}`,
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
                  label: "Create new folder",
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
              <Button icon={IconEnum.add} label={`Create new ${entityName}`} onClick={undefined} />
            </Dropdown>
          </div>
        ) : (
          <div className="w-fit">
            <Button
              icon={IconEnum.edit}
              label={`Edit current ${entityName}`}
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
        )}
      </div>
      {!isFetching ? (
        <div className="grid h-full w-full grid-cols-2 content-start gap-8 px-2 md:grid-cols-4 lg:grid-cols-10">
          {(base?.data?.length && !item_id ? base.data : []).map((item) => (
            <EntityItem
              key={item.id}
              changeParent={changeParent}
              icon={item.icon}
              id={item.id}
              image_id={item?.image_id}
              is_folder={item?.is_folder ?? false}
              showContextMenu={(event: MouseEvent<HTMLDivElement, MouseEvent>, id: string) =>
                setContextMenuAtom({
                  event,
                  items: [
                    {
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
                showContextMenu={(event: MouseEvent<HTMLDivElement, MouseEvent>, id: string) =>
                  setContextMenuAtom({
                    event,
                    items: [
                      {
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
    </>
  );
}
