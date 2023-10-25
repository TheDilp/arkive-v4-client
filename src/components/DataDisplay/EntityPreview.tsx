import { Link, useParams } from "react-router-dom";

import { ItemPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/itemPreviewTypes";
import { getDefaultEntityIcon, getImageURL, IconEnum } from "../../utils";
import { Button } from "../Form";
import { Avatar, Icon } from "../Misc";

export function EntityPreview({ id, title, type, link, icon, image_id, label, hasNoBackground, clearAction }: ItemPreviewType) {
  const { project_id } = useParams();
  return (
    <div className="flex flex-col gap-y-2">
      {label ? <div className="block min-h-[20px] truncate text-sm text-zinc-300">{label}</div> : null}
      <Link
        className={`flex max-h-10 items-center gap-x-2 rounded p-2 ${
          link ? "transition-all hover:text-blue-400" : "cursor-default"
        } ${hasNoBackground ? "" : "bg-zinc-700"}`}
        to={link || "#"}>
        {image_id ? (
          <Avatar
            image={getImageURL(project_id as string, type === "maps" ? "map_images" : "images", image_id)}
            label={title}
            size="sm"
          />
        ) : null}
        {!image_id && type !== "images" ? (
          <span>
            <Icon fontSize={32} icon={icon || getDefaultEntityIcon(type)} />
          </span>
        ) : null}
        <span className="truncate">{title}</span>
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
