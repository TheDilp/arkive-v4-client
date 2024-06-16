import { useState } from "react";
import { useParams } from "react-router-dom";

import { useBulkUpdateTags, useToggledResetAtom } from "../../../hooks";
import { AvailableEntityType, AvailableSubEntityType, TableDispatch, TagType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
import { Button, TagInput, Title } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    items: { id: string; tags: string[] }[];
    dispatch: TableDispatch;
    type: AvailableEntityType | AvailableSubEntityType;
  };
};

export function BulkTagsDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const resetDrawer = useToggledResetAtom();
  const [tagsToAdd, setTagsToAdd] = useState<Omit<TagType, "owner_id" | "permissions" | "deleted_at">[]>([]);
  const addedTagIds = tagsToAdd.map((t) => t.id);
  const [tagsToRemove, setTagsToRemove] = useState<Omit<TagType, "owner_id" | "permissions" | "deleted_at">[]>([]);
  const removedTagIds = tagsToRemove.map((t) => t.id);

  const { mutate, isLoading: isMutating } = useBulkUpdateTags(data.type, project_id as string, item_id as string);

  function handleSave() {
    const finalToAdd: { A: string; B: string }[] = [];
    const finalToRemove: { A: string; B: string }[] = [];

    for (let i = 0; i < data.items.length; i += 1) {
      for (let j = 0; j < tagsToAdd.length; j += 1) {
        if (!data.items[i].tags.includes(tagsToAdd[j].id)) {
          finalToAdd.push({ A: data.items[i].id, B: tagsToAdd[j].id });
        }
      }
      for (let j = 0; j < tagsToRemove.length; j += 1) {
        if (data.items[i].tags.includes(tagsToRemove[j].id)) {
          finalToRemove.push({ A: data.items[i].id, B: tagsToRemove[j].id });
        }
      }
    }

    mutate({ data: { add: finalToAdd, remove: finalToRemove } }, { onSuccess: resetDrawer });

    data.dispatch({ type: "clearSelection" });
  }

  return (
    <DrawerLayout>
      <Title isDrawerTitle label="Add tags" size="xl" />
      <TagInput
        handleChange={(e) => {
          if (removedTagIds.some((id) => id === e.value.at(-1)?.id)) {
            createNotification({
              title: "Cannot add tags set to be removed.",
              variant: "warning",
              icon: IconEnum.warning,
              timer: 5,
            });
            return;
          }

          setTagsToAdd(e.value);
        }}
        isAutofocused={false}
        isMultiple
        tags={tagsToAdd}
      />
      <Title isDrawerTitle label="Remove tags" size="xl" />
      <TagInput
        handleChange={(e) => {
          if (addedTagIds.some((id) => id === e.value.at(-1)?.id)) {
            createNotification({
              title: "Cannot remove tags set to be added.",
              variant: "warning",
              icon: IconEnum.warning,
              timer: 5,
            });
            return;
          }
          setTagsToRemove(e.value);
        }}
        isAutofocused={false}
        isMultiple
        tags={tagsToRemove}
      />

      <div>
        <Button
          icon={IconEnum.tags}
          isDisabled={!tagsToAdd.length && !tagsToRemove.length}
          isLoading={isMutating}
          label="Update"
          onClick={handleSave}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
