import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetSubEntity, useHandleChange } from "../../../hooks";
import { WordStateType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertWordSchema, InsertWordType } from "../../../validation";
import { Button, Input, Textarea } from "../../Form";

type Props = {
  data: {
    id?: string;
  };
};

export function WordDrawer({ data }: Props) {
  const { item_id } = useParams();
  const resetDrawer = useResetAtom(drawerAtom);
  const [word, setWord] = useState<WordStateType>({ parent_id: item_id });
  const { data: existingWord } = useGetSubEntity(data?.id, "words", { data: { parent_id: item_id } }, { enabled: !!data?.id });
  const { mutateAsync: createWord, isLoading: isCreating } = useCreateSubEntity<InsertWordType>("words");
  const { handleChange } = useHandleChange({ data: word, setData: setWord });
  useLayoutEffect(() => {
    if (existingWord?.data) setWord(existingWord?.data);
  }, [existingWord]);

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertWordSchema.parse({ data: word });
      await createWord(parsedData, { onSuccess: resetDrawer });
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Input label="Word (required)" name="title" onChange={handleChange} value={word?.title || ""} />
      <Input label="Translation (required)" name="translation" onChange={handleChange} value={word?.translation || ""} />
      <Textarea label="Context (required)" name="description" onChange={handleChange} value={word?.description || ""} />
      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isCreating}
          isLoading={isCreating}
          label={data?.id ? "Save" : "Create"}
          onClick={handleSave}
          variant="success"
        />
      </div>
    </div>
  );
}
