import { useParams } from "react-router-dom";

import { ImagePreviewType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";
import { Avatar } from "..";
import { Button } from "../Form/Button";

export function ImagePreview({ id, title, url, clearAction }: ImagePreviewType) {
  const { project_id } = useParams();
  return (
    <div className="flex h-12 max-h-12 min-h-[3rem] items-center gap-x-2 rounded bg-zinc-700 px-2">
      <div className="col-span-1 flex items-center">
        <Avatar image={id ? getImageURL(project_id as string, "images", id) : url} label={title} />
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
