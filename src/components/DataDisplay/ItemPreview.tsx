import { Link, useParams } from "react-router-dom";

import { ItemPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/itemPreviewTypes";
import { getDefaultEntityIcon, getImageURL, IconEnum } from "../../utils";
import { Button } from "../Form";
import { Avatar, Icon } from "../Misc";

export function ItemPreview({ id, title, type, link, image_id, label, clearAction }: ItemPreviewType) {
  const { project_id } = useParams();
  return (
    <div className="flex flex-col gap-y-2">
      {label ? <div className="block min-h-[20px] truncate text-sm text-zinc-300">{label}</div> : null}
      <Link
        className={`flex items-center gap-x-2 rounded bg-zinc-700 p-2 ${link ? "transition-all hover:text-blue-400" : ""}`}
        to={link ?? "#"}>
        {type !== "characters" ? (
          <span className="">
            <Icon fontSize={20} icon={getDefaultEntityIcon(type)} />
          </span>
        ) : (
          <Avatar image={getImageURL(project_id as string, "images", image_id)} label={title} size="sm" />
        )}
        <span>{title}</span>
        {clearAction ? (
          <span className="ml-auto w-min">
            <Button
              hasNoBackground
              icon={IconEnum.close}
              isIconOnly
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearAction(id);
              }}
            />
          </span>
        ) : null}
      </Link>
    </div>
  );
}
