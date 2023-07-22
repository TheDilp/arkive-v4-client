import { useParams } from "react-router-dom";

import { ImagePreviewType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";
import { Button } from "../Form/Button";

export function ImagePreview({ id, title, url }: ImagePreviewType) {
  const { project_id } = useParams();
  return (
    <div className="grid h-24 max-h-24 min-h-[6rem] grid-cols-4 items-center gap-x-2">
      <div className="col-span-1">
        <img
          alt={id}
          className="h-full w-full rounded object-cover"
          src={id ? getImageURL(project_id as string, "images", id) : url}
        />
      </div>
      <div className="col-span-2 truncate font-lato">{title}</div>
      <div className="col-span-1">
        <Button
          hasNoBackground
          icon={IconEnum.trash}
          iconSize={28}
          onClick={undefined}
          tooltip="Remove image"
          variant="error"
        />
      </div>
    </div>
  );
}
