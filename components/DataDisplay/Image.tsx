import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useImageURL } from "../../hooks/ui/useImageURL";
import { DialogAtomType, ImageComponentType } from "../../types";
import { dialogAtom, getAssetURL } from "../../utils";

const ImageClasses = tv({
  base: "h-full w-full rounded object-center",
  variants: {
    isOpenable: {
      true: "transition-all group-hover:scale-125 hover:shadow-md cursor-pointer duration-300",
    },
    objectFit: {
      cover: "object-cover",
      contain: "object-contain",
    },
  },
});

function openImageView(setDialog: Dispatch<SetStateAction<DialogAtomType>>, image: string, title: string) {
  setDialog((prev) => ({
    ...prev,
    data: { url: image, image_type: "images", title },
    type: "image_view",
    title: "Image view",
  }));
}

export function Image({
  image,
  isOpenable,
  hasTitle,
  isLazyLoading = true,
  url,
  type,
  objectFit = "cover",
}: ImageComponentType) {
  const { project_id } = useParams();

  const classes = ImageClasses({ isOpenable, objectFit });
  const setDialog = useSetAtom(dialogAtom);

  const fetchedUrl = useImageURL(image?.id ? getAssetURL(project_id as string, type, image?.id) : null);
  return (
    <div className="group relative h-full w-full overflow-hidden rounded-md">
      {hasTitle && image?.title ? (
        <h2 className="pointer-events-none absolute top-[20%] z-10 w-full max-w-full select-none truncate px-4 text-center font-merriweather font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-all">
          {image.title}
        </h2>
      ) : null}
      {url || fetchedUrl ? (
        <img
          alt={image?.title || ""}
          className={classes}
          loading={isLazyLoading ? "lazy" : "eager"}
          onClick={() => {
            if (isOpenable) openImageView(setDialog, url || fetchedUrl, image?.title || "");
          }}
          src={url || fetchedUrl}
        />
      ) : (
        <div className={classes} />
      )}
    </div>
  );
}
