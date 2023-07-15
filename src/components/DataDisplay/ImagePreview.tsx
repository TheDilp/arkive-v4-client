import { ImagePreviewType } from "../../types";
import { IconEnum } from "../../utils";
import { Button } from "../Form/Button";

export function ImagePreview({ name, url }: ImagePreviewType) {
  return (
    <div className="grid h-24 max-h-24 min-h-[6rem] grid-cols-4 items-center gap-x-2">
      <div className="col-span-1">
        <img alt={name} className="h-full w-full rounded object-cover" src={url} />
      </div>
      <div className="col-span-2 truncate font-lato">{name}</div>
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
