import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { HandleChangePropsType } from "../../../types";
import { RandomTableOptionType, RandomTableType } from "../../../types/EntityTypes/randomTableTypes";
import { drawerAtom, IconEnum } from "../../../utils";
import {
  InsertRandomTableSchema,
  InsertRandomTableType,
  UpdateRandomTableSchema,
  UpdateRandomTableType,
} from "../../../validation/random_tables";
import { FolderSelect } from "../../Complex";
import { Button, Checkbox, Input, Textarea } from "../../Form";
import { Collapsible, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data?: {
    id?: string;
  };
};

function isSaveDisabled(random_table: Partial<RandomTableType>) {
  if (!random_table.title) return true;
  if (!random_table?.random_table_options?.length) return true;
  return random_table?.random_table_options?.some((opt) => !opt.title);
}

const tabs = [
  {
    id: "1",
    label: "Basic info",
    icon: IconEnum.info_circle,
  },
  {
    id: "2",
    label: "Options",
    icon: IconEnum.random_table,
  },
];

function OptionInput({
  name,
  title,
  description,
  handleChange,
  removeSuboption,
}: {
  name: string;
  title: string;
  description: string;
  handleChange: (newValue: HandleChangePropsType) => void;
  removeSuboption?: (newValue: HandleChangePropsType) => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-x-2 border-zinc-700">
        <div className="flex w-full items-center gap-x-2">
          <Input label="Title (required)" name={`${name}.title`} onChange={handleChange} value={title || ""} />
          {removeSuboption ? (
            <div className="mb-2 h-6 w-6 self-end">
              <Button hasNoBackground icon={IconEnum.trash} isIconOnly onClick={removeSuboption} variant="error" />
            </div>
          ) : null}
        </div>
      </div>
      <div>
        <Textarea
          label="Description (optional)"
          name={`${name}.description`}
          onChange={handleChange}
          value={description || ""}
        />
      </div>
    </>
  );
}

export function RandomTableDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const [selectTab, setSelectedTab] = useState(0);
  const resetDrawerAtom = useResetAtom(drawerAtom);

  const { data: existingRandomTable, isInitialLoading } = useGetEntity<RandomTableType>(
    data?.id,
    "random_tables",
    {
      data: { project_id },
      relations: {
        random_table_options: true,
      },
      fields: ["id", "title", "description", "icon", "is_public"],
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
    if (existingRandomTable?.data && !randomTable?.title) {
      setRandomTable(existingRandomTable?.data);
    }
  }, [existingRandomTable]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectTab} tabs={tabs} />
      {selectTab === 0 ? (
        <>
          <div className="w-full">
            <Input
              label="Random table title (required)"
              name="title"
              onChange={handleChange}
              placeholder="Eg. Character classes"
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
          <FolderSelect handleChange={handleChange} parent_id={randomTable?.parent_id ?? null} type="random_tables" />
          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={randomTable?.is_public ?? false} />
          </div>
        </>
      ) : null}

      {selectTab === 1 ? (
        <>
          <div className="flex w-full items-center justify-between">
            <span>Insert new option:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                onClick={() =>
                  handleChange({
                    name: "random_table_options",
                    value: (randomTable?.random_table_options || []).concat({
                      id: crypto.randomUUID(),
                      title: "New option",
                      description: "",
                      parent_id: randomTable.id,
                    } as RandomTableOptionType),
                  })
                }
                variant="info"
              />
            </div>
          </div>
          <div className="flex max-h-full flex-col gap-y-2 overflow-y-auto">
            {randomTable.random_table_options?.map((option, optionIndex) => (
              <Collapsible
                key={option.id}
                actions={[
                  {
                    icon: IconEnum.trash,
                    variant: "error",
                    onClick: () => {
                      handleChange({
                        name: "random_table_options",
                        value: randomTable.random_table_options?.filter((opt) => opt.id !== option.id),
                      });
                    },
                    isIconOnly: true,
                    hasNoBackground: true,
                  },
                ]}
                initialOpen={option.title === "New option"}
                label={option.title}>
                <div className="flex flex-col gap-y-2 p-2">
                  <OptionInput
                    description={option?.description || ""}
                    handleChange={handleChange}
                    name={`random_table_options[${optionIndex}]`}
                    title={option.title}
                  />
                </div>
              </Collapsible>
            ))}
          </div>
        </>
      ) : null}

      <Button
        icon={randomTable?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(randomTable) || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={randomTable?.id ? "Save" : "Create"}
        onClick={async () => {
          if (changedData) {
            if (randomTable?.id) {
              const parsed = UpdateRandomTableSchema.parse({
                data: randomTable,
                relations: { random_table_options: (randomTable?.random_table_options || [])?.map((opt) => ({ data: opt })) },
              });
              await update(parsed, {
                onSuccess: (res) => {
                  if (res?.ok) resetDrawerAtom();
                },
              });
            } else {
              const parsed = InsertRandomTableSchema.parse({
                data: randomTable,
                relations: { random_table_options: (randomTable?.random_table_options || [])?.map((opt) => ({ data: opt })) },
              });
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
