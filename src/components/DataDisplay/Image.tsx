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
      true: "transition-all hover:scale-105 hover:shadow-md cursor-pointer",
    },
  },
});

function openImageView(setDialog: Dispatch<SetStateAction<DialogAtomType>>, image: string) {
  setDialog((prev) => ({ ...prev, data: { image }, type: "image_view", title: "Image view" }));
}

export function Image({ image, isOpenable }: ImageComponentType) {
  const { project_id } = useParams();
  const imageUrl = getImageURL(project_id as string, "images", image.id);
  const classes = ImageClasses({ isOpenable });
  const setDialog = useSetAtom(dialogAtom);

  return (
    <img
      alt={image.title}
      className={classes}
      onClick={() => {
        if (isOpenable) openImageView(setDialog, imageUrl);
      }}
      src={imageUrl}
    />
  );
}
