import { useSetAtom } from "jotai";
import { MouseEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { Breadcrumbs, Button, Dropdown, Graph, Icon, Skeleton } from "../../components";
import { Editor } from "../../components/Complex/Editor/Editor";
import Alert from "../../components/Misc/Alert";
import { useChangeNavbarTitle, useGetAllEntities, useGetEntity } from "../../hooks";
import { AvailableEntityType, BaseEntityType, GraphType } from "../../types";
import { capitalizeFirstLetter, contextMenuAtom, dialogAtom, drawerAtom, getImageURL, IconEnum } from "../../utils";
import { getDefaultEntityIcon, getEntityNameFromType } from "../../utils/ui/entityUtils";
import { CharactersView } from ".";

type EntityItemType = {
  id: string;
  is_folder: boolean | null;
  title: string;
  icon?: string | null;
  image_id?: string;
};

function ItemDisplay({
  id,
  is_folder,
  title,
  type,
  icon,
  image_id,
  showContextMenu,
}: EntityItemType & {
  type: AvailableEntityType;

  showContextMenu: (event: MouseEvent<HTMLDivElement, MouseEvent>, item_id: string) => void;
}) {
  const { project_id } = useParams();
  return (
    <Link to={`../${type}/${id}`}>
      <div
        className="col-span-1 flex cursor-pointer flex-col items-center justify-center hover:text-blue-400"
        onContextMenu={(e) => {
          e.preventDefault();
          showContextMenu(e as any, id);
        }}>
        <div className="pointer-events-none h-24 w-24">
          {image_id ? (
            <img alt={title} className="object-contain" src={getImageURL(project_id as string, "images", image_id)} />
          ) : (
            <Icon fontSize={100} icon={is_folder ? IconEnum.folder : icon || getDefaultEntityIcon(type)} />
          )}
        </div>
        <span className="max-w-full truncate font-lato text-white hover:text-white">{title}</span>
      </div>
    </Link>
  );
}

export function EntitiesView() {
  const { project_id, type, item_id } = useParams();

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  const fields: string[] = ["id", "title", "icon", "is_folder", "parent_id"];

  if (type === "documents") fields.push("image_id");

  const { data: base, isFetching: isFetchingRoot } = useGetAllEntities<BaseEntityType & { image_id?: string }>(
    {
      pagination: {
        limit: 10,
        page: 0,
      },
      data: {
        project_id,
        item_id,
      },
      fields,
      orderBy: {
        field: "is_folder",
        sort: "desc",
      },
    },
    type as AvailableEntityType,
    {
      enabled: !item_id,
      staleTime: 5 * 60 * 1000,
    },
  );

  const { data, isFetching } = useGetEntity<BaseEntityType & { image_id?: string }>(
    item_id,
    type as AvailableEntityType,
    {
      data: {
        project_id,
      },

      relations: {
        children: true,
        parents: true,
        ...(type === "graphs" ? { nodes: true, edges: true } : {}),
      },
    },
    {
      enabled: !!item_id,
      staleTime: 5 * 60 * 1000,
    },
  );

  const setContextMenuAtom = useSetAtom(contextMenuAtom);
  const entityName = getEntityNameFromType(type as AvailableEntityType);

  useChangeNavbarTitle(`The Arkive | ${capitalizeFirstLetter(type || "")}`);

  if (!item_id && type === "characters") return <CharactersView />;

  if (isFetchingRoot || isFetching) return <Skeleton type="breadcrumbs" />;

  return (
    <>
      <div className="flex h-10 items-center justify-between">
        <Breadcrumbs items={data?.data?.parents?.length ? data.data.parents : []} />
        {!item_id || data?.data?.is_folder ? (
          <div className="w-fit">
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
                      data: { project_id },
                      title: `Create new ${entityName}`,
                      type: "documents",
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
                      data: { project_id, type },
                      type: "folder",
                      size: "sm",
                    }));
                  },
                },
              ]}>
              <Button
                icon={IconEnum.add}
                label="Create new"
                onClick={undefined}

                // }
              />
            </Dropdown>
          </div>
        ) : null}
      </div>
      {!item_id || data?.data?.is_folder ? (
        <div className="grid h-full w-full grid-cols-2 content-start gap-2 md:grid-cols-4 lg:grid-cols-10">
          {(base?.data?.length ? base.data : []).map((item) => (
            <ItemDisplay
              key={item.id}
              icon={item.icon}
              id={item.id}
              image_id={item?.image_id}
              is_folder={item?.is_folder ?? false}
              showContextMenu={(event: MouseEvent<HTMLDivElement, MouseEvent>, id: string) =>
                setContextMenuAtom({
                  event,
                  items: [
                    {
                      title: `Edit ${entityName}`,
                      icon: IconEnum.edit,
                      onClick: () =>
                        setDrawer((prev) => ({
                          ...prev,
                          size: "sm",
                          title: `Edit ${entityName} - ${item.title}`,
                          type: type as AvailableEntityType,
                          data: { id },
                        })),
                    },
                    {
                      title: `Delete ${entityName}`,
                      icon: IconEnum.trash,
                      onClick: () =>
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...item,
                            entity_title: type,
                          },
                          title: `Delete ${entityName}`,
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
          {(data?.data?.children?.length && data?.data?.is_folder ? data.data.children : []).map((item) => (
            <ItemDisplay
              key={item.id}
              icon={item.icon}
              id={item.id}
              is_folder={item?.is_folder ?? false}
              showContextMenu={(event: MouseEvent<HTMLDivElement, MouseEvent>, id: string) =>
                setContextMenuAtom({
                  event,
                  items: [
                    {
                      title: `Edit ${entityName}`,
                      icon: IconEnum.edit,
                      onClick: () =>
                        setDrawer((prev) => ({
                          ...prev,
                          size: "md",
                          title: `Edit ${entityName} - ${item.title}`,
                          type: type as AvailableEntityType,
                          data: { id, parent_id: item_id },
                        })),
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
                          title: `Delete ${entityName}`,
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
          {!base?.data?.length && !data?.data?.children?.length && data?.data?.is_folder ? (
            <div className="col-span-1 mt-2 md:col-span-4 lg:col-span-10">
              <Alert label="There is no content." variant="info" />
            </div>
          ) : null}
        </div>
      ) : null}
      {!!item_id && !data?.data?.is_folder && type === "documents" ? <Editor editable /> : null}
      {!!item_id && !data?.data?.is_folder && type === "graphs" ? <Graph data={data?.data as GraphType} /> : null}
    </>
  );
}
