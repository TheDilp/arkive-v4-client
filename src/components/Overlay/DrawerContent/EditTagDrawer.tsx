import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { TagType } from "../../../types";
import { DefaultTagColor, drawerAtom, IconEnum } from "../../../utils";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Skeleton } from "../../Misc";
import { ColorPicker } from "..";

type Props = {
  data: {
    id: string;
  };
};

export function EditTagDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { data: tagData, isInitialLoading } = useGetEntity<TagType>(data?.id, "tags", {
    fields: ["id", "title", "color", "owner_id", "permissions"],
  });
  const resetDrawer = useResetAtom(drawerAtom);
  const [tag, setTag] = useState<TagType | null>(null);
  const { mutate: update, isLoading } = useUpdateEntity<{ data: Pick<TagType, "id" | "title" | "color"> }>(
    "tags",
    project_id as string,
  );

  function handleSave() {
    if (tag) {
      update({ data: { id: data.id, title: tag?.title, color: tag?.color } });
      resetDrawer();
    }
  }

  const { handleChange } = useHandleChange({ data: tag, setData: setTag });

  useLayoutEffect(() => {
    if (tagData?.data) setTag(tagData?.data);
  }, [tagData]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <div className="flex items-center justify-between gap-x-2">
        <Input label="Title" name="title" onChange={handleChange} value={tag?.title} />
        <div className="mb-2 self-end">
          <ColorPicker name="color" onChange={handleChange} value={tag?.color || DefaultTagColor} />
        </div>
      </div>
      <Button
        icon={IconEnum.save}
        isDisabled={!tag?.title || isLoading}
        isLoading={isLoading}
        label="Save"
        onClick={handleSave}
        variant="success"
      />
    </DrawerLayout>
  );
}
