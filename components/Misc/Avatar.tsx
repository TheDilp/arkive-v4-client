import { useSetAtom } from "jotai";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useImageURL } from "../../hooks/ui/useImageURL";
import { AvatarType } from "../../types";
import { dialogAtom, getAssetURL, getFirstLetters } from "../../utils";
import { Tooltip } from "../Overlay/Tooltip";
import { Spinner } from "./Spinner";

const AvatarClasses = tv({
  slots: {
    base: "relative group inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-zinc-600 shadow ",
    image: "h-full w-full object-cover",
    text: "font-lato font-bold text-white absolute",
    spinner: "absolute z-10 flex h-full w-full items-center justify-center bg-zinc-950 opacity-50",
  },
  variants: {
    size: {
      "4xs": {
        base: "w-3 h-3 min-w-[0.75rem] min-h-[0.75rem]",
      },
      "3xs": {
        base: "w-[14px] h-[14px] min-w-[14px] min-h-[14px]",
      },
      "2xs": {
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
      lg: {
        base: "w-16 h-16 min-w-[4rem] min-h-[4rem]",
      },
      xl: {
        base: "w-16 h-16 min-w-[4rem] min-h-[4rem]",
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
  image_id,
  image_url,
  imageLoading = "eager",
  isTooltipDisabled,
  initials,
  isBordered,
  isLoading,
  hasShowImage = false,
  imageType = "images",
  tooltipAllowedPlacements = [],
  shape = "circle",
  size = "md",
  manual_project_id,
}: AvatarType & { isPreview?: boolean }) {
  const { project_id } = useParams();
  const setDialog = useSetAtom(dialogAtom);
  const { base, image: imageClasses, text, spinner } = AvatarClasses({ isBordered, size, hasShowImage, shape });
  const url = useImageURL(
    image_id && !image_url ? getAssetURL((manual_project_id || project_id) as string, imageType, image_id) : null,
    size
  );
  return (
    <Tooltip
      allowedPlacements={tooltipAllowedPlacements}
      content={label || ""}
      delay={{ openDelay: 0 }}
      isDisabled={!label || isTooltipDisabled}
      isIgnoringHover
      isPortal>
      <div className={base()}>
        {isLoading ? (
          <div className={spinner()}>
            <Spinner />
          </div>
        ) : null}
        {image_url || url ? (
          <img
            alt={label}
            className={imageClasses()}
            loading={imageLoading}
            onClick={() => {
              if (hasShowImage)
                setDialog((prev) => ({
                  ...prev,
                  data: { image_id, url: image_url, image_type: imageType },
                  type: "image_view",
                  title: "Image view",
                }));
            }}
            src={image_url || url}
          />
        ) : (
          <span className={text()}>{initials || getFirstLetters(label || "")}</span>
        )}
      </div>
    </Tooltip>
  );
}
