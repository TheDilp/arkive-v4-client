import { AvailableEntityType } from "../../types";
import { ContextMenuItemType } from "../../types/ComponentTypes/OverlayTypes/contextMenuTypes";
import { IconEnum } from "../../utils";
import { getDefaultEntityIcon } from "../../utils/ui/entityUtils";
import { Icon } from "..";
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
    <div
      className="col-span-1 flex h-36 cursor-pointer flex-col items-center justify-center hover:text-blue-400"
      data-context-id={id}
      data-context-title={title}
      data-context-type="graphs">
      <div className="pointer-events-none">
        <Icon fontSize={100} icon={is_folder ? IconEnum.folder : icon || getDefaultEntityIcon(type)} />
      </div>
      <span className="max-w-full truncate text-white hover:text-white">{title}</span>
    </div>
  );
}

export function FolderView({
  items,
  contextMenuItems,
  type,
}: {
  items: EntityItemType[];
  contextMenuItems: ContextMenuItemType[];
  type: AvailableEntityType;
}) {
  return (
    <div className="grid h-full w-full grid-cols-1 content-start md:grid-cols-4 lg:grid-cols-10">
      {contextMenuItems?.length ? <ContextMenu items={contextMenuItems} /> : null}
      {items.map((item) => (
        <ItemDisplay
          key={item.id}
          icon={item.icon}
          id={item.id}
          // image={item?.image}
          is_folder={item?.is_folder ?? false}
          title={item.title}
          type={type}
        />
      ))}
    </div>
  );
}
