import { useSetAtom } from "jotai";
import { MouseEvent } from "react";
import { Link, useParams } from "react-router-dom";

import { Breadcrumbs, Button, Graph, Icon, Skeleton } from "../../components";
import { Editor } from "../../components/Complex/Editor/Editor";
import Alert from "../../components/Misc/Alert";
import { useGetAllEntities, useGetEntity } from "../../hooks";
import { AvailableEntityType, BaseEntityType, GraphType } from "../../types";
import { contextMenuAtom, dialogAtom, drawerAtom, IconEnum } from "../../utils";
import { getDefaultEntityIcon, getEntityNameFromType } from "../../utils/ui/entityUtils";
import { CharactersView } from ".";

type EntityItemType = {
  id: string;
  is_folder: boolean | null;
  title: string;
  icon?: string | null;
  // image?: string;
};

function ItemDisplay({
  id,
  is_folder,
  title,
  type,
  icon,
  showContextMenu,
}: EntityItemType & {
  type: AvailableEntityType;

  showContextMenu: (event: MouseEvent<HTMLDivElement, MouseEvent>, item_id: string) => void;
}) {
  return (
    <Link to={`../${type}/${id}`}>
      <div
        className="col-span-1 flex cursor-pointer flex-col items-center justify-center hover:text-blue-400"
        onContextMenu={(e) => {
          e.preventDefault();
          showContextMenu(e as any, id);
        }}>
        <div className="pointer-events-none">
          <Icon fontSize={100} icon={is_folder ? IconEnum.folder : icon || getDefaultEntityIcon(type)} />
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

  const { data: base, isFetching: isFetchingRoot } = useGetAllEntities<BaseEntityType>(
    {
      pagination: {
        limit: 10,
        page: 0,
      },
      data: {
        project_id,
        item_id,
      },
      fields: ["id", "title", "icon", "is_folder", "parent_id"],
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

  const { data, isFetching } = useGetEntity<BaseEntityType>(
    item_id,
    type as AvailableEntityType,
    {
      data: {
        project_id,
      },

      relations: {
        children: true,
        parents: true,
        ...{ nodes: true, edges: true },
      },
    },
    {
      enabled: !!item_id,
      staleTime: 5 * 60 * 1000,
    },
  );

  const setContextMenuAtom = useSetAtom(contextMenuAtom);

  if (!item_id && type === "characters") return <CharactersView />;

  if (isFetchingRoot || isFetching) return <Skeleton type="breadcrumbs" />;

  const entityName = getEntityNameFromType(type as AvailableEntityType);

  console.log(type);

  return (
    <>
      <div className="flex h-10 items-center justify-between">
        <Breadcrumbs items={data?.data?.parents?.length ? data.data.parents : []} />
        {!item_id || data?.data?.is_folder ? (
          <div className="w-fit">
            <Button
              icon={IconEnum.add}
              label="Create new graph"
              onClick={() =>
                setDrawer((prev) => ({
                  ...prev,
                  data: { project_id },
                  title: "Create new graph",
                  type: "graphs",
                  size: "lg",
                }))
              }
            />
          </div>
        ) : null}
      </div>
      {!item_id || data?.data?.is_folder ? (
        <div className="grid h-full w-full grid-cols-2 content-start md:grid-cols-4 lg:grid-cols-10">
          {(base?.data?.length ? base.data : []).map((item) => (
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
