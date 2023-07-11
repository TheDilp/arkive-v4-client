import { useState } from "react";
import { IconEnum, drawerAtom, useResetAtom } from "../../../utils";
import { Button, Input } from "../../Form";
import { useCreateEntities, useHandleChange } from "../../../hooks";
import { useParams } from "react-router-dom";

function isDisabled(tags: { id: string; title: string }[]) {
  if (!tags.length) return true;
  if (tags.some((tag) => !tag.title)) return true;
  const tagTitles = tags.map((tag) => tag.title.toLowerCase());
  if (new Set(tagTitles).size !== tagTitles.length) return true;

  return false;
}

export function TagsDrawer({ data }: { data: { id?: string } }) {
  const { project_id } = useParams();
  const [tags, setTags] = useState<{ id: string; title: string }[]>([]);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: create } = useCreateEntities<{ data: { project_id: string; title: string }[] }>(
    "tags",
    project_id as string,
  );

  const { handleChange } = useHandleChange({ data: tags, setData: setTags });

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex h-8 w-full justify-between">
        <span>Insert new tag:</span>
        <div className="h-8 w-8">
          <Button
            variant="info"
            tooltip="Add new tag"
            icon={IconEnum.add}
            onClick={() => setTags((prev) => [...(prev || []), { id: crypto.randomUUID(), title: "" }])}
          />
        </div>
      </div>
      {tags.map((tag, index) => (
        <Input
          label="Tag name (required, must be unique)"
          key={tag.id}
          value={tag.title}
          name={`[${index}].title`}
          onChange={handleChange}
        />
      ))}
      <Button
        icon={IconEnum.add}
        onClick={async () => {
          if (!data?.id) await create({ data: tags.map((tag) => ({ title: tag.title, project_id: project_id as string })) });

          resetDrawerAtom();
        }}
        label={"Create"}
        variant="success"
        isDisabled={isDisabled(tags)}
      />
    </div>
  );
}
