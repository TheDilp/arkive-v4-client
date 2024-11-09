import { useQueryClient } from "@tanstack/react-query";
import omit from "lodash.omit";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntities, useHandleChange, useToggledResetAtom } from "../../../hooks";
import { RandomTableOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { IconEnum } from "../../../utils";
import { InsertRandomTableOptionSchema, InsertRandomTableOptionType } from "../../../validation/random_tables";
import { Button, Input, Textarea } from "../../Form";

export function RandomTableOptionsDrawer({ data }: { data: { parent_id: string } }) {
  const queryClient = useQueryClient();
  const { project_id } = useParams();
  const [options, setOptions] = useState<Pick<RandomTableOptionType, "id" | "title" | "description" | "icon" | "icon_color">[]>(
    []
  );
  const resetDrawerAtom = useToggledResetAtom();
  const { mutateAsync: create, isLoading: isCreating } = useCreateSubEntities<{ data: InsertRandomTableOptionType[] }>(
    "random_table_options",
    data.parent_id
  );
  const { handleChange } = useHandleChange({ data: options, setData: setOptions });
  return (
    <div className="flex h-full flex-col gap-y-2">
      <div className="flex w-full items-center justify-between">
        <span>Insert new option:</span>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            onClick={() => setOptions((prev) => [...prev, { id: crypto.randomUUID(), title: "", parent_id: data.parent_id }])}
            variant="info"
          />
        </div>
      </div>
      <div className="flex flex-col gap-y-2 overflow-auto">
        {options.map((opt, idx) => (
          <div key={opt.id} className="flex flex-col gap-y-1">
            <hr className="mb-2 border-zinc-700" />
            <div className="flex flex-nowrap items-center gap-x-2">
              <Input label="Title (required)" name={`[${idx}].title`} onChange={handleChange} value={opt?.title || ""} />
              {/* <div className="mb-2 h-6 w-6 self-end rounded-full border border-dashed" /> */}
              <div className="h-10 w-8 self-end">
                <Button
                  hasNoBackground
                  icon={IconEnum.trash}
                  onClick={() => setOptions((prev) => prev.filter((o) => o.id !== opt.id))}
                  variant="error"
                />
              </div>
            </div>
            <div>
              <Textarea
                label="Description"
                name={`[${idx}].description`}
                onChange={handleChange}
                value={opt?.description || ""}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="w-full">
        <Button
          icon={IconEnum.add}
          isDisabled={!options.length || options.some((opt) => !opt.title) || isCreating}
          isLoading={isCreating}
          label="Add"
          onClick={async () => {
            const optionsToCreate = options.map((opt) => {
              return { data: omit(opt, "id") };
            });
            const parsedData = InsertRandomTableOptionSchema.array().parse(optionsToCreate);
            await create(
              { data: parsedData },
              {
                onSuccess: (res) => {
                  if (res?.ok) {
                    resetDrawerAtom();
                    setOptions([]);
                    queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, "random_table_options"] });
                  }
                },
              }
            );
          }}
          variant="success"
        />
      </div>
    </div>
  );
}
