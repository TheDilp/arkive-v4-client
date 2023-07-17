import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import omit from "lodash.omit";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntities, useCreateEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { TagType } from "../../../types";
import { drawerAtom, EntitiesWithTags, IconEnum } from "../../../utils";
import { DefaultTagColor } from "../../../utils/enums/ColorEnums";
import { Button, Input } from "../../Form";
import { ColorPicker } from "../ColorPicker";

function isDisabled(tags: TagType | TagType[]) {
  if (Array.isArray(tags)) {
    if (!tags.length) return true;
    if (tags.some((tag) => !tag.title)) return true;
    const tagTitles = tags.map((tag) => tag.title.toLowerCase());
    if (new Set(tagTitles).size !== tagTitles.length) return true;
  } else {
    if (!tags.title) return true;
    if (!tags.color) return true;
  }

  return false;
}

export function TagsDrawer({ data }: { data: TagType }) {
  const queryClient = useQueryClient();
  const { project_id } = useParams();
  const [tags, setTags] = useState<TagType | TagType[]>(data?.id ? data : []);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: createMany } = useCreateEntities<{ data: Omit<TagType, "id">[] }>("tags", project_id as string);
  const { mutateAsync: create } = useCreateEntity<{ data: Omit<TagType, "id"> }>("tags");

  const { mutateAsync: update } = useUpdateEntity<{ data: Omit<TagType, "project_id"> }>("tags", project_id as string);
  const { handleChange } = useHandleChange({ data: tags, setData: setTags });

  return (
    <div className="flex flex-col gap-y-4">
      {data?.id ? null : (
        <div className="flex h-8 w-full justify-between">
          <span>Insert new tag:</span>
          <div className="h-8 w-8">
            <Button
              icon={IconEnum.add}
              onClick={() => {
                setTags((prev) => {
                  if (Array.isArray(prev))
                    return [
                      ...(prev || []),
                      { id: crypto.randomUUID(), title: "", color: "", project_id: project_id as string },
                    ];
                  return prev;
                });
              }}
              tooltip="Add new tag"
              variant="info"
            />
          </div>
        </div>
      )}
      {Array.isArray(tags) ? (
        tags.map((tag, index) => (
          <div key={tag.id} className="flex items-end gap-x-2">
            <Input
              label="Tag name (required, must be unique)"
              name={`[${index}].title`}
              onChange={handleChange}
              value={tag.title}
            />
            <div className="self-end pb-2">
              <ColorPicker name={`[${index}].color`} onChange={handleChange} value={tag.color} />
            </div>
          </div>
        ))
      ) : (
        <div className="flex gap-x-2">
          <Input label="Tag name (required, must be unique)" name="title" onChange={handleChange} value={tags?.title} />
          <div className="self-end pb-2">
            <ColorPicker name="color" onChange={handleChange} value={tags?.color || DefaultTagColor} />
          </div>
        </div>
      )}
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isDisabled(tags)}
        label={data?.id ? "Save" : "Create"}
        onClick={async () => {
          if (!data?.id) {
            if (Array.isArray(tags)) {
              await createMany({ data: tags.map((tag) => omit(tag, ["id"])) });
            } else {
              await create({ data: tags });
            }
          } else if (!Array.isArray(tags)) {
            await update({ data: omit(tags, ["project_id"]) });
            queryClient.invalidateQueries({
              predicate: (query) =>
                EntitiesWithTags.includes(query.queryKey[2] as string) ||
                EntitiesWithTags.includes(query.queryKey[3] as string),
            });
          }

          resetDrawerAtom();
        }}
        variant="success"
      />
    </div>
  );
}
