import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { RandomTableType } from "../../../types/EntityTypes/randomTableTypes";
import { drawerAtom, IconEnum } from "../../../utils";
import {
  InsertRandomTableSchema,
  InsertRandomTableType,
  UpdateRandomTableSchema,
  UpdateRandomTableType,
} from "../../../validation/random_tables";
import { Button, Input, Textarea } from "../../Form";

type Props = {
  data?: {
    id?: string;
  };
};

export function RandomTableDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();

  const resetDrawerAtom = useResetAtom(drawerAtom);

  const { data: existingRandomTable } = useGetEntity<RandomTableType>(
    data?.id,
    "random_tables",
    {
      data: { project_id },
    },
    { enabled: !!data?.id },
  );
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertRandomTableType>("random_tables");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateRandomTableType>(
    "random_tables",
    project_id as string,
  );

  const [randomTable, setRandomTable] = useState<Partial<RandomTableType> & { project_id: string }>(
    existingRandomTable?.data || { project_id: project_id as string, parent_id: item_id },
  );

  const { changedData, handleChange } = useHandleChange({ data: randomTable, setData: setRandomTable });

  useLayoutEffect(() => {
    if (existingRandomTable?.data) {
      setRandomTable(existingRandomTable?.data);
    }
  }, [existingRandomTable]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="w-full">
        <Input
          label="Random table title (required)"
          name="title"
          onChange={handleChange}
          placeholder="Eg. Family tree"
          value={randomTable?.title || ""}
        />
      </div>
      <div className="w-full">
        <Textarea
          label="Random table description (optional)"
          name="description"
          onChange={handleChange}
          value={randomTable?.description || ""}
        />
      </div>

      <Button
        icon={randomTable?.id ? IconEnum.save : IconEnum.add}
        isDisabled={!randomTable?.title || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={randomTable?.id ? "Save" : "Create"}
        onClick={async () => {
          if (changedData) {
            if (randomTable?.id) {
              const parsed = UpdateRandomTableSchema.parse({ data: randomTable });
              await update(parsed, {
                onSuccess: (res) => {
                  if (res?.ok) resetDrawerAtom();
                },
              });
            } else {
              const parsed = InsertRandomTableSchema.parse({ data: randomTable });
              await create(parsed, {
                onSuccess: (res) => {
                  if (res?.ok) resetDrawerAtom();
                },
              });
            }
          }
        }}
        variant="success"
      />
    </div>
  );
}
