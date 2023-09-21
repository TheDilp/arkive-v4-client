import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useHandleChange, useUpdateImage } from "../../../hooks";
import { ImageType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { Button, Input } from "../../Form";

type Props = {
  data: ImageType;
};

export function ImageDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [image, setImage] = useState(data);
  const resetDrawer = useResetAtom(drawerAtom);
  const { handleChange } = useHandleChange({ data: image, setData: setImage });
  const { mutateAsync: update, isLoading: isMutating } = useUpdateImage(data.id, project_id, image.type);
  return (
    <div className="flex flex-col gap-y-2">
      <Input name="title" onChange={handleChange} value={image.title} />
      <Button
        icon={IconEnum.save}
        isDisabled={isMutating}
        isLoading={isMutating}
        label="Save"
        onClick={async () => update({ data: { title: image.title } }, { onSuccess: resetDrawer })}
        variant="success"
      />
    </div>
  );
}
