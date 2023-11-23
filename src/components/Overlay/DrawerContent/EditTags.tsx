import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useHandleChange, useUpdateEntity } from "../../../hooks";
import { AvailableEntityType, TagType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { Button, TagInput } from "../../Form";

type Props = {
  data: { tags: TagType[]; entity: { type: AvailableEntityType; id: string } };
};

export function EditTags({ data }: Props) {
  const resetDrawer = useResetAtom(drawerAtom);
  const { project_id } = useParams();
  const [tagsData, setTagsData] = useState<{ tags: TagType[] }>({ tags: data.tags || [] });

  const { handleChange } = useHandleChange({ data: tagsData, setData: setTagsData });

  const { mutateAsync: updateTags, isLoading: isMutating } = useUpdateEntity<{
    data: { id?: string; parent_id?: string | null };
    relations: { tags: { id: string }[] };
  }>(data.entity.type, project_id as string);
  return (
    <div className="flex flex-col gap-y-2">
      <TagInput handleChange={handleChange} isMultiple label="Tags" tags={tagsData.tags} />
      <Button
        icon={IconEnum.save}
        isDisabled={isMutating}
        isLoading={isMutating}
        label="Save"
        onClick={async () =>
          updateTags(
            {
              data: { id: data.entity.id },
              relations: {
                tags: tagsData.tags.map((t) => ({ id: t.id })),
              },
            },
            {
              onSuccess: (d) => {
                if (d?.ok) {
                  resetDrawer();
                }
              },
            },
          )
        }
        variant="success"
      />
    </div>
  );
}
