import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { DictionaryStateType, DictionaryType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import {
  InsertDictionarySchema,
  InsertDictionaryType,
  UpdateDictionarySchema,
  UpdateDictionaryType,
} from "../../../validation";
import { Button, Input } from "../../Form";
import { IconPicker } from "../IconPicker";

type Props = {
  data: { id?: string };
};

export function DictionaryDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { data: existingDictionary } = useGetEntity<DictionaryType>(
    data?.id,
    "dictionaries",
    { data },
    { enabled: !!data?.id },
  );
  const { mutateAsync: createDictionary, isLoading: isCreating } = useCreateEntity<{ data: InsertDictionaryType }>(
    "dictionaries",
  );
  const { mutateAsync: updateDictionary, isLoading: isUpdating } = useUpdateEntity<{ data: UpdateDictionaryType }>(
    "dictionaries",
    project_id as string,
  );
  const [dictionary, setDictionary] = useState<DictionaryStateType>({ project_id });

  useLayoutEffect(() => {
    if (existingDictionary?.data) setDictionary(existingDictionary.data);
  }, [existingDictionary]);
  const { handleChange } = useHandleChange({ data: dictionary, setData: setDictionary });
  const resetDrawer = useResetAtom(drawerAtom);
  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertDictionarySchema.parse(dictionary);

      await createDictionary({ data: parsedData }, { onSuccess: resetDrawer });
    } else {
      const parsedData = UpdateDictionarySchema.parse(dictionary);
      await updateDictionary({ data: parsedData });
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-nowrap gap-x-2">
        <Input
          label="Title (required)"
          name="title"
          onChange={handleChange}
          placeholder="Eg. English dictionary"
          value={dictionary?.title || ""}
        />
        <span className="h-8 self-end">
          <IconPicker icon={dictionary?.icon || ""} name="icon" onChange={handleChange} />
        </span>
      </div>
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={!dictionary.title || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={data?.id ? "Save" : "Create"}
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
