import { Link } from "react-router-dom";
import { tv } from "tailwind-variants";

import { ItemPreviewType } from "../../types/ComponentTypes/DataDisplayTypes/itemPreviewTypes";
import { AvailableIcons, getDefaultEntityIcon, IconEnum } from "../../utils";
import { Button } from "../Form";
import { Avatar, Icon } from "../Misc";

const EntityPreviewClasses = tv({
  slots: {
    container: "flex flex-col min-h-fit max-w-full col-span-12",
    label: "block min-h-[20px] truncate text-sm text-zinc-300",
    base: "flex items-center gap-x-1 rounded p-2",
    link: "flex max-h-10 mr-auto items-center gap-x-1 rounded p-2 ",
    linkTitle: "truncate max-w-56",
    action: "w-min min-w-[2rem]",
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
      info: {},
      success: {},
      warning: {},
      error: {},
      "primary-bordered": {},
      "secondary-bordered": {},
      "info-bordered": {},
      "success-bordered": {},
      "warning-bordered": {},
      "error-bordered": {},
    },
    size: {
      "4xs": "h-8 min-h-[2rem] max-h-8",
      "3xs": "h-8 min-h-[2rem] max-h-8",
      "2xs": "h-8 min-h-[2rem] max-h-8",
      xs: "h-8 min-h-[2rem] max-h-8",
      sm: "h-8 min-h-[2rem] max-h-8",
      md: "h-10 min-h-[2.5rem] max-h-10",
      lg: "h-10 min-h-[2.5rem] max-h-10",
      xl: "h-10 min-h-[2.5rem] max-h-10",
      "2xl": "h-10 min-h-[2.5rem] max-h-10",
      "3xl": "h-10 min-h-[2.5rem] max-h-10",
      "4xl": "h-10 min-h-[2.5rem] max-h-10",
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
  hasNoBackground = false,
  otherActionIcon,
  manual_project_id,
  variant = "secondary",
  size = "md",
  previewAction,
  clearAction,
  otherAction,
}: ItemPreviewType) {
  const {
    container,
    base,
    label: labelClasses,
    link: linkClasses,
    linkTitle,
    action: actionClasses,
    otherAction: otherActionClasses,
  } = EntityPreviewClasses({ hasNoBackground, variant, size, hasLink: !!link });
  return (
    <div className={container()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}
      <span className={base()}>
        {image_id ? (
          <Avatar
            hasShowImage
            imageType={type === "maps" ? "map_images" : "images"}
            image_id={image_id}
            isTooltipDisabled
            label={title}
            manual_project_id={manual_project_id}
            size={size === "md" ? "sm" : "xs"}
          />
        ) : null}
        {!image_id && type !== "images" ? (
          <span>
            <Icon fontSize={size === "md" ? 32 : 24} icon={(icon as AvailableIcons) || getDefaultEntityIcon(type)} />
          </span>
        ) : null}
        <Link className={linkClasses()} to={link || "#"}>
          <span className={linkTitle()}>{title} </span>
        </Link>
        {previewAction ? (
          <span className={actionClasses()} tabIndex={0}>
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
              icon={(otherActionIcon as AvailableIcons) || IconEnum.warning}
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
