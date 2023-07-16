import { AvailableEntityType } from "../../types";
import { IconEnum } from "../../utils";
import { Icon } from "..";

type EntityItemType = {
  id: string;
  type: AvailableEntityType;
  is_folder: string;
  title: string;
  icon?: string;
  image?: string;
};

function ItemDisplay({ id, type, is_folder, title, icon, image }: EntityItemType) {
  return (
    <div className="col-span-1 flex h-36 flex-col items-center justify-center">
      <div>
        <Icon fontSize={100} icon={is_folder ? IconEnum.folder : icon || "ph:files"} />
      </div>
      <span className="max-w-full truncate">ajksdjaksjdklasjdklajsdklajsdklajsdklajsdkljs</span>
    </div>
  );
}

export function FolderView({ items }: { items: EntityItemType[] }) {
  return (
    <div className="grid h-full w-full grid-cols-1 content-start md:grid-cols-4 lg:grid-cols-10">
      <div className="col-span-1 flex h-36 flex-col items-center justify-center">
        <div>
          <Icon fontSize={100} icon={IconEnum.folder} />
        </div>
        <span className="max-w-full truncate">ajksdjaksjdklasjdklajsdklajsdklajsdklajsdkljs</span>
      </div>
    </div>
  );
}
