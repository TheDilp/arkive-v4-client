import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { ImagePreviewType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";
import { Avatar } from "..";
import { Button } from "../Form/Button";

const ImagePreviewClasses = tv({
  slots: {
    container: "flex flex-col",
    base: "flex max-h-10 min-h-[2.5rem] items-center gap-x-1 rounded p-2 bg-zinc-700 border-0",
    label: "block min-h-[20px] truncate text-sm text-zinc-300",
    title: "ml-2 truncate font-lato",
    link: "flex max-h-10 mr-auto items-center gap-x-1 rounded p-2 ",
    linkTitle: "truncate",
    action: "ml-auto w-min",
    otherAction: "w-min",
  },
});

export function ImagePreview({ id, title, label, url, hasShowImage, clearAction }: ImagePreviewType) {
  const { project_id } = useParams();
  const { container, action, title: titleClasses, label: labelClasses, base } = ImagePreviewClasses();
  return (
    <div className={container()}>
      {label ? <div className={labelClasses()}>{label}</div> : null}
      <span className={base()}>
        <Avatar
          hasShowImage={hasShowImage}
          image={url || getImageURL(project_id as string, "images", id) || ""}
          isPreview
          label={title}
          size="sm"
        />
        <div className={titleClasses()}>{title}</div>
        {clearAction ? (
          <div className={action()}>
            <Button
              hasNoBackground
              icon={IconEnum.close}
              onClick={() => {
                if (id) clearAction(id);
                else if (url) clearAction(url);
              }}
              tooltip="Remove image"
            />
          </div>
        ) : null}
      </span>
    </div>
  );
}
