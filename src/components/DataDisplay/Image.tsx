/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { DialogAtomType, ImageComponentType } from "../../types";
import { dialogAtom, getImageURL } from "../../utils";

const ImageClasses = tv({
  base: "object-cover h-full w-full rounded object-center",
  variants: {
    isOpenable: {
      true: "transition-all group-hover:scale-125 hover:shadow-md cursor-pointer duration-300",
    },
  },
});

function openImageView(setDialog: Dispatch<SetStateAction<DialogAtomType>>, image: string, title: string) {
  setDialog((prev) => ({ ...prev, data: { image, title }, type: "image_view", title: "Image view" }));
}

export function Image({ image, isOpenable, hasTitle, url }: ImageComponentType) {
  const { project_id } = useParams();
  const imageUrl = url || getImageURL(project_id as string, "images", image.id);
  const classes = ImageClasses({ isOpenable });
  const setDialog = useSetAtom(dialogAtom);

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-md">
      {hasTitle ? (
        <h2 className="pointer-events-none absolute top-[20%] z-10 w-full max-w-full select-none truncate px-4 text-center font-merriweather text-4xl font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-all ">
          {image.title}
        </h2>
      ) : null}
      <img
        alt={image.title}
        className={classes}
        onClick={() => {
          if (isOpenable) openImageView(setDialog, imageUrl, image.title);
        }}
        src={imageUrl}
      />
    </div>
  );
}
