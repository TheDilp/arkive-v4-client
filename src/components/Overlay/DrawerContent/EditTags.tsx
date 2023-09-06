import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useUpdateEntity } from "../../../hooks";
import { AvailableEntityType, TagType } from "../../../types";
import { drawerAtom, IconEnum, useNotifications } from "../../../utils";
import { Button, Search } from "../../Form";
import { Badge } from "../../Misc";

type Props = {
  data: { tags: TagType[]; entity: { type: AvailableEntityType; id: string } };
};

export function EditTags({ data }: Props) {
  const createNotification = useNotifications();
  const resetDrawer = useResetAtom(drawerAtom);
  const { project_id } = useParams();
  const [tags, setTags] = useState(data.tags || []);
  const { mutateAsync: updateTags, isLoading: isMutating } = useUpdateEntity<{
    data: { id?: string; parent_id?: string | null };
    relations: { tags: { id: string }[] };
  }>(data.entity.type, project_id as string);
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        name="tags"
        onChange={({ label, value, color }) => {
          if ((data.tags || [])?.some((tag) => tag.id === value)) {
            createNotification({
              title: "Cannot add the same tag twice.",
              variant: "warning",
              icon: IconEnum.info_circle,
              timer: 3,
            });
            return;
          }
          setTags((prev) =>
            (prev || []).concat({
              title: label as string,
              id: value,
              project_id: project_id as string,
              color: color as string,
            }),
          );
        }}
        placeholder="Press enter to search tags"
        searchEntity="tags"
      />

      <div className="flex flex-wrap gap-2">
        {tags?.length
          ? tags.map((tag) => (
              <div key={tag.id} className="w-fit">
                <Badge
                  clearAction={() => {
                    setTags((prev) => prev.filter((t) => t.id !== tag.id));
                  }}
                  customColor={tag.color}
                  label={tag.title}
                  size="lg"
                />
              </div>
            ))
          : null}
      </div>
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
                tags,
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
