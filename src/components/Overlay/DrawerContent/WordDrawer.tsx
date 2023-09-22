import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetSubEntity, useHandleChange, useUpdateSubEntity } from "../../../hooks";
import { WordStateType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertWordSchema, InsertWordType, UpdateWordSchema } from "../../../validation";
import { Button, Input, Textarea } from "../../Form";

type Props = {
  data: {
    id?: string;
  };
};

function isSaveDisabled(word: WordStateType) {
  if (!word.title) return true;
  if (!word.translation) return true;
  return false;
}

export function WordDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const resetDrawer = useResetAtom(drawerAtom);
  const [word, setWord] = useState<WordStateType>({ parent_id: item_id });
  const { data: existingWord } = useGetSubEntity(data?.id, "words", { data: { id: data?.id } }, { enabled: !!data?.id });
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
