import { useSetAtom } from "jotai";
import { Link, useParams } from "react-router-dom";

import { Breadcrumbs, Button, Graph, Icon, Skeleton } from "../../components";
import Alert from "../../components/Misc/Alert";
import { ContextMenu } from "../../components/Overlay/ContextMenu";
import { useGetAllEntities, useGetEntity } from "../../hooks";
import { AvailableEntityType, BaseEntityType, GraphType } from "../../types";
import { ContextMenuItemType } from "../../types/ComponentTypes/OverlayTypes/contextMenuTypes";
import { drawerAtom, IconEnum } from "../../utils";
import { getDefaultEntityIcon } from "../../utils/ui/entityUtils";
import { CharactersView } from ".";

type EntityItemType = {
  id: string;
  is_folder: boolean | null;
  title: string;
  icon?: string | null;
  // image?: string;
};

function ItemDisplay({ id, is_folder, title, type, icon }: EntityItemType & { type: AvailableEntityType }) {
  return (
    <Link to={`../graphs/${id}`}>
      <div
        className="col-span-1 flex cursor-pointer flex-col items-center justify-center hover:text-blue-400"
        data-context-id={id}
        data-context-title={title}
        data-context-type="graphs">
        <div className="pointer-events-none">
          <Icon fontSize={100} icon={is_folder ? IconEnum.folder : icon || getDefaultEntityIcon(type)} />
        </div>
        <span className="max-w-full truncate font-lato text-white hover:text-white">{title}</span>
      </div>
    </Link>
  );
}

export function EntitiesView({ contextMenuItems }: { contextMenuItems: ContextMenuItemType[] }) {
  const { project_id, type, item_id } = useParams();

  const setDrawer = useSetAtom(drawerAtom);

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
    "graphs",
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

  if (!item_id && type === "characters") return <CharactersView />;

  if (isFetchingRoot || isFetching) return <Skeleton type="breadcrumbs" />;

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
          {contextMenuItems?.length && !item_id ? <ContextMenu items={contextMenuItems} /> : null}
          {(base?.data?.length ? base.data : []).map((item) => (
            <ItemDisplay
              key={item.id}
              icon={item.icon}
              id={item.id}
              // image={item?.image}
              is_folder={item?.is_folder ?? false}
              title={item.title}
              type={type as AvailableEntityType}
            />
          ))}
          {(data?.data?.children?.length && data?.data?.is_folder ? data.data.children : []).map((item) => (
            <ItemDisplay
              key={item.id}
              icon={item.icon}
              id={item.id}
              // image={item?.image}
              is_folder={item?.is_folder ?? false}
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
      {!!item_id && !data?.data?.is_folder && type === "graphs" ? <Graph data={data?.data as GraphType} /> : null}
    </>
  );
}
