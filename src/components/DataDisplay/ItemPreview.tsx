import { Link } from "react-router-dom";

import { ItemPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/itemPreviewTypes";
import { IconEnum } from "../../utils";
import { Button } from "../Form";
import { Icon } from "../Misc";

export function ItemPreview({ id, title, icon, link, clearAction }: ItemPreviewType) {
  return (
    <Link
      className={`flex items-center gap-x-2 rounded bg-zinc-700 p-2 ${link ? "transition-all hover:text-blue-400" : ""}`}
      to={link ?? "#"}>
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
    </Link>
  );
}
