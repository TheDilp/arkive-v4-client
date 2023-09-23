import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { ImagePreviewType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";
import { Avatar } from "..";
import { Button } from "../Form/Button";

const ImagePreviewClasses = tv({
  base: "flex h-12 min-h-[3rem] items-center gap-x-2 rounded bg-zinc-700 p-2 w-full",
  variants: {
    size: {
      md: "h-12 max-h-12 min-h-[3rem]",
      lg: "h-16 max-h-16 min-h-[4rem]",
    },
  },
});

export function ImagePreview({ id, title, url, size = "md", clearAction }: ImagePreviewType) {
  const { project_id } = useParams();
  const classes = ImagePreviewClasses({ size });
  return (
    <div className={classes}>
      <div className="col-span-1 flex items-center">
        <Avatar image={id ? getImageURL(project_id as string, "images", id) : url} label={title} size={size} />
      </div>
      <div className="ml-2 truncate font-lato">{title}</div>
      {clearAction ? (
        <div className="ml-auto">
          <Button
            hasNoBackground
            icon={IconEnum.close}
            iconSize={24}
            onClick={() => {
              if (id) clearAction(id);
              else if (url) clearAction(url);
            }}
            tooltip="Remove image"
          />
        </div>
      ) : null}
    </div>
  );
}
