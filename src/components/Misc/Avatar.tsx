/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useSetAtom } from "jotai";
import { tv } from "tailwind-variants";

import { AvatarType } from "../../types";
import { dialogAtom, getFirstLetters } from "../../utils";
import { Tooltip } from "../Overlay/Tooltip";

const AvatarClasses = tv({
  slots: {
    base: "relative group inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-600 shadow ",
    image: "h-full w-full object-cover",
    text: "font-lato font-bold text-white absolute",
  },
  variants: {
    size: {
      xxs: {
        base: "w-4 h-4 min-w-[1rem] min-h-[1rem]",
      },
      xs: {
        base: "w-6 h-6 min-w-[1.5rem] min-h-[1.5rem]",
      },
      sm: {
        base: "w-8 h-8 min-w-[2rem] min-h-[2rem]",
      },
      md: {
        base: "w-10 h-10 min-w-[2.5rem] min-h-[2.5rem]",
      },
      "2xl": {
        base: "w-16 h-16 min-w-[4rem] min-h-[4rem]",
      },
      "3xl": {
        base: "w-20 h-20 min-w-[5rem] min-h-[5rem]",
      },
      "4xl": {
        base: "w-24 h-24 min-w-[6rem] min-h-[6rem] text-[2.5rem]",
      },
    },
    shape: {
      circle: {
        base: "rounded-full",
      },
      rounded: {
        base: "rounded",
      },
      square: {
        base: "rounded-none",
      },
    },
    hasShowImage: {
      true: {
        image: "cursor-pointer transition-all",
      },
    },
    isBordered: {
      true: {
        base: "border border-zinc-400",
      },
    },
  },
});

export function Avatar({
  label,
  image,
  imageLoading,
  isTooltipDisabled,
  initials,
  isBordered,
  hasShowImage = false,
  tooltipAllowedPlacements = [],
  shape = "circle",
  size = "md",
}: AvatarType) {
  const setDialog = useSetAtom(dialogAtom);
  const { base, image: imageClasses, text } = AvatarClasses({ isBordered, size, hasShowImage, shape });
  return (
    <Tooltip
      allowedPlacements={tooltipAllowedPlacements}
      content={label || ""}
      delay={{ openDelay: 0 }}
      isDisabled={!label || isTooltipDisabled}
      isIgnoringHover>
      <div className={base()}>
        {image ? (
          <img
            alt={label}
            className={imageClasses()}
            loading={imageLoading}
            onClick={() => {
              if (hasShowImage) setDialog((prev) => ({ ...prev, data: { image }, type: "image_view", title: "Image view" }));
            }}
            src={image}
          />
        ) : (
          <span className={text()}>{initials || getFirstLetters(label || "")}</span>
        )}
      </div>
    </Tooltip>
  );
}
