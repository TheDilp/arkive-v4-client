import { Link, useParams } from "react-router-dom";

import { ItemPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/itemPreviewTypes";
import { getDefaultEntityIcon, getImageURL, IconEnum } from "../../utils";
import { Button } from "../Form";
import { Avatar, Icon } from "../Misc";

export function EntityPreview({
  id,
  parent_id,
  title,
  type,
  link,
  icon,
  image_id,
  label,
  hasNoBackground,
  otherActionIcon,
  previewAction,
  clearAction,
  otherAction,
}: ItemPreviewType) {
  const { project_id } = useParams();
  return (
    <div className="flex flex-col">
      {label ? <div className="block min-h-[20px] truncate text-sm text-zinc-300">{label}</div> : null}
      <span className={`flex max-h-10 items-center gap-x-1 rounded p-2  ${hasNoBackground ? "" : "bg-zinc-700"}`}>
        {image_id ? (
          <Avatar
            hasShowImage
            image={getImageURL(project_id as string, type === "maps" ? "map_images" : "images", image_id)}
            isTooltipDisabled
            label={title}
            size="sm"
          />
        ) : null}
        {!image_id && type !== "images" ? (
          <span>
            <Icon fontSize={32} icon={icon || getDefaultEntityIcon(type)} />
          </span>
        ) : null}
        <Link
          className={`flex max-h-10 items-center gap-x-1 rounded p-2 ${
            link ? "truncate transition-all hover:text-blue-400" : "cursor-default"
          } ${hasNoBackground ? "" : "bg-zinc-700"}`}
          to={link || "#"}>
          <span className="truncate">{title}</span>
        </Link>
        {previewAction ? (
          <span className="ml-auto w-min">
            <Button
              hasNoBackground
              icon={IconEnum.eye}
              isIconOnly
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                previewAction(id, parent_id);
              }}
            />
          </span>
        ) : null}
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
        {otherAction ? (
          <div className="w-min">
            <Button
              hasNoBackground
              icon={otherActionIcon || IconEnum.warning}
              isIconOnly
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                otherAction(id);
              }}
            />
          </div>
        ) : null}
      </span>
    </div>
  );
}
