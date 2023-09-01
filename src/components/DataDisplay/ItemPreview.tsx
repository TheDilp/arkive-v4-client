import { ItemPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/itemPreviewTypes";
import { IconEnum } from "../../utils";
import { Button } from "../Form";
import { Icon } from "../Misc";

export function ItemPreview({ id, title, icon, clearAction }: ItemPreviewType) {
  return (
    <div className="flex items-center gap-x-2 rounded bg-zinc-700 p-2">
      {icon ? (
        <span className="">
          <Icon fontSize={20} icon={icon} />
        </span>
      ) : null}
      <span>{title}</span>
      {clearAction ? (
        <span className="ml-auto w-min">
          <Button hasNoBackground icon={IconEnum.close} isIconOnly onClick={() => clearAction(id)} />
        </span>
      ) : null}
    </div>
  );
}
