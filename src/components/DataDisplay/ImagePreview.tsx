import { useParams } from "react-router-dom";

import { ImagePreviewType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";
import { Avatar } from "..";
import { Button } from "../Form/Button";

export function ImagePreview({ id, title, url }: ImagePreviewType) {
  const { project_id } = useParams();
  return (
    <div className="flex h-16 max-h-16 min-h-[4rem] items-center gap-x-2">
      <div className="col-span-1">
        <Avatar image={id ? getImageURL(project_id as string, "images", id) : url} label={title} />
      </div>
      <div className="ml-2 truncate font-lato">{title}</div>
      <div className="ml-auto">
        <Button
          hasNoBackground
          icon={IconEnum.close}
          iconSize={28}
          onClick={undefined}
          tooltip="Remove image"
          variant="error"
        />
      </div>
    </div>
  );
}
