import { tv } from "tailwind-variants";

import { AvatarType } from "../../types";
import { getFirstLetters } from "../../utils";
import { Tooltip } from "../Overlay/Tooltip";

const AvatarClasses = tv({
  slots: {
    base: "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-600 shadow ",
    label: "h-full w-full object-cover",
    text: "font-lato font-bold text-white",
  },
  variants: {
    size: {
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
        base: "w-16 h-16 min-w-[2.5rem] min-h-[2.5rem]",
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
  tooltipAllowedPlacements = [],
  size = "md",
}: AvatarType) {
  const { base, label: labelClasses, text } = AvatarClasses({ isBordered, size });
  return (
    <Tooltip allowedPlacements={tooltipAllowedPlacements} content={label || ""} isDisabled={!label || isTooltipDisabled}>
      <div className={base()}>
        {image ? (
          <img alt={label} className={labelClasses()} loading={imageLoading} src={image} />
        ) : (
          <span className={text()}>{initials || getFirstLetters(label || "")}</span>
        )}
      </div>
    </Tooltip>
  );
}
