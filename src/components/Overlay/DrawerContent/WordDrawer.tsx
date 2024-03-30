import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetEntities, useGetSubEntity, useHandleChange, useUpdateSubEntity } from "../../../hooks";
import { WordStateType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertWordSchema, InsertWordType, UpdateWordSchema } from "../../../validation";
import { Button, Input, Select, Textarea } from "../../Form";

type Props = {
  data: {
    id?: string;
    title?: string;
  };
};

function isSaveDisabled(word: WordStateType) {
  if (!word.title) return true;
  if (!word.translation) return true;
  if (!word.parent_id) return true;
  return false;
}

export function WordDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const resetDrawer = useResetAtom(drawerAtom);
  const [word, setWord] = useState<WordStateType>({
    title: data?.title || undefined,
    parent_id: data?.title ? undefined : item_id,
  });
  const { data: dictionaries } = useGetEntities({ fields: ["id", "title"], data: { project_id } }, "dictionaries", {
    enabled: !!data?.title,
  });
  const { data: existingWord } = useGetSubEntity(
    data?.id,
    "words",
    { data: { id: data?.id }, fields: ["id", "title", "description", "translation", "parent_id"] },
    { enabled: !!data?.id },
  );
  const { mutateAsync: createWord, isLoading: isCreating } = useCreateSubEntity<InsertWordType>("words", project_id);
  const { mutateAsync: updateWord, isLoading: isUpdating } = useUpdateSubEntity("words", project_id, item_id);
  const { handleChange } = useHandleChange({ data: word, setData: setWord });
  useLayoutEffect(() => {
    if (existingWord?.data) setWord(existingWord?.data);
  }, [existingWord]);

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertWordSchema.parse({ data: word });
      await createWord(parsedData, { onSuccess: resetDrawer });
    } else {
      const parsedData = UpdateWordSchema.parse({ data: word });
      await updateWord(parsedData, { onSuccess: resetDrawer });
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      {data?.title ? (
        <Select
          name="parent_id"
          onChange={handleChange}
          options={(dictionaries?.data || []).map((dict) => ({ label: dict?.title, value: dict?.id }))}
          value={word?.parent_id || ""}
        />
      ) : null}
      <Input label="Word (required)" name="title" onChange={handleChange} value={word?.title || ""} />
      <Input label="Translation (required)" name="translation" onChange={handleChange} value={word?.translation || ""} />
      <Textarea label="Context (optional)" name="description" onChange={handleChange} value={word?.description || ""} />
      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isCreating || isUpdating || isSaveDisabled(word)}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Save" : "Create"}
          onClick={handleSave}
          variant="success"
        />
      </div>
    </div>
  );
}
