import { useSetAtom } from "jotai";
import { Link, useParams } from "react-router-dom";

import { useGetAllEntities, useGetItem } from "../../hooks";
import { AvailableEntityType, BaseEntityType } from "../../types";
import { ContextMenuItemType } from "../../types/ComponentTypes/OverlayTypes/contextMenuTypes";
import { drawerAtom, IconEnum } from "../../utils";
import { getDefaultEntityIcon } from "../../utils/ui/entityUtils";
import { Breadcrumbs, Button, Icon } from "..";
import { ContextMenu } from "../Overlay/ContextMenu";

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
        className="col-span-1 flex h-36 cursor-pointer flex-col items-center justify-center hover:text-blue-400"
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

export function FolderView({ contextMenuItems }: { contextMenuItems: ContextMenuItemType[] }) {
  const { project_id, type, item_id } = useParams();

  const setDrawer = useSetAtom(drawerAtom);

  const { data: base } = useGetAllEntities<BaseEntityType>(
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
    },
  );

  const { data } = useGetItem<BaseEntityType>(
    item_id,
    type as AvailableEntityType,
    {
      data: {
        project_id,
      },

      relations: {
        children: true,
        parents: true,
      },
    },
    {
      enabled: !!item_id,
    },
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <Breadcrumbs items={data?.data?.parents?.length ? data.data.parents : []} />
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
      </div>
      <div className="grid h-full w-full grid-cols-1 content-start md:grid-cols-4 lg:grid-cols-10">
        {contextMenuItems?.length ? <ContextMenu items={contextMenuItems} /> : null}
        {(base?.data?.length ? base.data : data?.data?.children || []).map((item) => (
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
      </div>
    </>
  );
}
