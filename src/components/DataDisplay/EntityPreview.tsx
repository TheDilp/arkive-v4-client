import { Link, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { ItemPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/itemPreviewTypes";
import { getDefaultEntityIcon, getImageURL, IconEnum } from "../../utils";
import { Button } from "../Form";
import { Avatar, Icon } from "../Misc";

const EntityPreviewClasses = tv({
  slots: {
    container: "flex flex-col",
    label: "block min-h-[20px] truncate text-sm text-zinc-300",
    base: "flex max-h-10 min-h-[2.5rem] items-center gap-x-1 rounded p-2",
    link: "flex max-h-10 mr-auto items-center gap-x-1 rounded p-2 ",
    linkTitle: "truncate",
    action: "w-min",
    otherAction: "w-min",
  },
  variants: {
    variant: {
      primary: {
        base: "bg-zinc-900 border-zinc-700 border",
      },
      secondary: {
        base: "bg-zinc-700 border-0",
      },
    },
    hasNoBackground: {
      true: {
        base: "bg-transparent",
      },
    },
    hasLink: {
      true: {
        link: "truncate transition-all hover:text-blue-400",
      },
      false: {
        link: "cursor-default",
      },
    },
  },
});

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
  variant = "secondary",
  previewAction,
  clearAction,
  otherAction,
}: ItemPreviewType) {
  const { project_id } = useParams();
  const {
    container,
    base,
    label: labelClasses,
    link: linkClasses,
    linkTitle,
    action: actionClasses,
    otherAction: otherActionClasses,
  } = EntityPreviewClasses({ hasNoBackground, variant, hasLink: !!link });
  return (
    <div className={container()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}
      <span className={base()}>
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
        <Link className={linkClasses()} to={link || "#"}>
          <span className={linkTitle()}>{title}</span>
        </Link>
        {previewAction ? (
          <span className={actionClasses()}>
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
          <span className={actionClasses()}>
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
          <div className={otherActionClasses()}>
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
