import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import {
  CharacterFieldTemplateType,
  CharacterFieldType,
  InputOnChangeValue,
  onChangeValue,
  TemplateStateType,
} from "../../../types";
import { drawerAtom, FieldTypesEnum, IconEnum, MessageEnum } from "../../../utils";
import { DiceRollRegex } from "../../../utils/ui/diceRollerUtils";
import { InsertTemplateSchema, InsertTemplateType, UpdateTemplateSchema, UpdateTemplateType } from "../../../validation";
import { Button, Input, Search, Select, TagInput } from "../../Form";
import { Skeleton } from "../../Misc";

function isSaveDisabled(template: TemplateStateType) {
  if (!template?.title) return true;
  if (!template?.character_fields?.length) return true;
  if (!template?.tags?.length) return true;
  if (
    template.character_fields.some(
      (field) =>
        !field.title ||
        !field.field_type ||
        ((field.field_type === "select_multiple" || field.field_type === "select") && !field?.options?.length) ||
        (field.field_type === "dice_roll" && !field?.formula),
    )
  )
    return true;

  return false;
}

function FieldRow({
  title,
  sort,
  field_type,
  random_table_id,
  options,
  formula,
  index,
  changeField,
  deleteField,
  random_table,
  isLoading,
}: (Omit<CharacterFieldType, "options" | "parentId"> & { options?: { id: string; value: string }[] }) & {
  index: number;
  changeField: ({
    name,
    value,
  }: onChangeValue | InputOnChangeValue | { name: string; value: { id: string; value: string }[] }) => void;
  deleteField: (i: number) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex w-full items-center justify-between gap-x-2">
        <div className="h-full flex-1">
          <Input
            isDisabled={isLoading}
            label="Field title"
            name={`character_fields[${index}].title`}
            onChange={changeField}
            placeholder="Eg. Location"
            value={title}
          />
        </div>
        <div className="h-full flex-1">
          <Select
            isDisabled={isLoading}
            label="Field type"
            name={`character_fields[${index}].field_type`}
            onChange={changeField}
            options={FieldTypesEnum}
            placeholder="Field type"
            value={field_type}
          />
        </div>
        <div className="h-full w-20">
          <Input
            label="Sort weight"
            name={`character_fields[${index}].sort`}
            onChange={changeField}
            placeholder="Eg. 10"
            type="number"
            value={sort ?? 0}
          />
        </div>
        {field_type === "select" || field_type === "select_multiple" ? (
          <div className="h-10 w-8 self-end">
            <Button
              hasNoBackground
              icon={IconEnum.add}
              isDisabled={isLoading}
              onClick={() =>
                changeField({
                  name: `character_fields[${index}].options`,
                  value: (options || []).concat({ id: crypto.randomUUID(), value: `New option ${(options?.length || 0) + 1}` }),
                })
              }
              tooltip="Add new option"
              variant="info"
            />
          </div>
        ) : null}
        <div className="h-10 w-8 self-end">
          <Button
            hasNoBackground
            icon={IconEnum.trash}
            isDisabled={isLoading}
            onClick={() => deleteField(index)}
            variant="error"
          />
        </div>
      </div>
      {field_type === "select" || field_type === "select_multiple" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          {options?.map((opt, optIndex) => (
            <div key={opt.id} className="flex w-full flex-nowrap">
              <div className="w-[calc(100%-5rem)]">
                <Input
                  isDisabled={isLoading}
                  name={`character_fields[${index}].options[${optIndex}].value`}
                  onChange={changeField}
                  value={opt.value}
                />
              </div>
              <div className="flex flex-1 justify-end">
                <div className="h-10 w-8">
                  <Button
                    hasNoBackground
                    icon={IconEnum.trash}
                    isDisabled={isLoading}
                    onClick={() =>
                      changeField({
                        name: `character_fields[${index}].options`,
                        value: (options || []).filter((o) => o.id !== opt.id),
                      })
                    }
                    variant="error"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {field_type === "dice_roll" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <div className="flex flex-col gap-y-2">
            <Input
              helperText={formula?.match?.(DiceRollRegex) ? "" : MessageEnum.dice_notation_not_valid}
              isDisabled={isLoading}
              label="Dice formula"
              name={`character_fields[${index}].formula`}
              onChange={changeField}
              placeholder="E.g. 4d6dl1"
              value={formula || ""}
              variant={formula?.match?.(DiceRollRegex) ? "primary" : "error"}
            />
          </div>
        </div>
      ) : null}
      {field_type === "random_table" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          <div className="flex flex-col gap-y-2">
            <Search
              hasShownOption
              initialDisplayValue={random_table?.[0]?.title || ""}
              isDisabled={isLoading}
              label="Random table"
              name={`character_fields[${index}].random_table_id`}
              onChange={changeField}
              searchEntity="random_tables"
              value={random_table_id || ""}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FieldTemplateDrawer({ data }: { data: { id?: string } }) {
  const queryClient = useQueryClient();
  const { project_id } = useParams();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertTemplateType>("character_fields_templates");

  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateTemplateType>(
    "character_fields_templates",
    project_id as string,
  );

  const { data: existingTemplate, isFetching } = useGetEntity<CharacterFieldTemplateType>(
    data?.id,
    "character_fields_templates",
    {
      data: {
        id: data?.id,
      },
      relations: {
        character_fields: true,
        tags: true,
      },
    },
    {
      enabled: !!data?.id,
    },
  );

  const [template, setTemplate] = useState<TemplateStateType>({
    title: "",
    project_id: project_id as string,
    sort: 0,
    tags: [],
  });

  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });

  const isLoading = isFetching || isCreating || isUpdating;

  useLayoutEffect(() => {
    if (existingTemplate?.data) {
      setTemplate(existingTemplate?.data);
    }
  }, [existingTemplate]);

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex h-screen max-h-screen flex-col gap-y-4 overflow-auto text-white">
      <div className="flex flex-nowrap items-center gap-x-2">
        <div className="flex-1">
          <Input
            isDisabled={isLoading}
            label="Template title (required)"
            name="title"
            onChange={handleChange}
            value={template?.title || ""}
          />
        </div>
        <div className="w-20">
          <Input
            isDisabled={isLoading}
            label="Sort"
            name="sort"
            onChange={handleChange}
            type="number"
            value={template?.sort || 0}
          />
        </div>
      </div>
      <div>
        <TagInput
          handleChange={handleChange}
          label="Used for entities with these tags (required)"
          tags={template?.tags || []}
        />
      </div>
      <h5 className="border-b border-zinc-600 text-lg">Fields</h5>
      <div className="flex items-center justify-between">
        <span>Insert new field:</span>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            isDisabled={isLoading}
            onClick={() =>
              handleChange({
                name: "character_fields",
                value: (template.character_fields || []).concat({
                  id: crypto.randomUUID(),
                  title: "",
                  project_id: project_id as string,
                  field_type: "text",
                  sort: 0,
                }),
              })
            }
            variant="info"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-y-4 overflow-y-auto">
        {template.character_fields?.length
          ? template.character_fields.map((field, index) => (
              <FieldRow
                key={field.id}
                changeField={handleChange}
                deleteField={() =>
                  handleChange({
                    name: "character_fields",
                    value: template?.character_fields?.filter((f) => f.id !== field.id),
                  })
                }
                field_type={field.field_type}
                formula={field?.formula}
                id={field.id}
                index={index}
                isLoading={isLoading}
                options={field?.options || []}
                project_id={field?.project_id}
                random_table={field?.random_table}
                random_table_id={field?.random_table_id}
                sort={field.sort}
                title={field.title}
              />
            ))
          : null}
      </div>
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(template) || isLoading}
        isLoading={isLoading}
        label={data?.id ? "Update" : "Create"}
        onClick={async () => {
          if (!data?.id) {
            const { tags, character_fields, ...rest } = template;
            const parsedData = InsertTemplateSchema.parse({
              data: rest,
              relations: {
                tags,
                character_fields: character_fields?.map((field) => ({
                  ...field,
                  project_id,
                })),
              },
            });
            await create(parsedData, {
              onSuccess: () => {
                queryClient.invalidateQueries({
                  predicate: (query) => query.queryKey.includes("character_fields_templates"),
                });
                resetDrawerAtom();
              },
            });
          } else {
            const { tags, character_fields, ...rest } = template;
            const parsedData = UpdateTemplateSchema.parse({
              data: rest,
              relations: {
                tags,
                character_fields: character_fields?.map((field) => ({
                  ...field,
                  project_id,
                })),
              },
            });
            await update(parsedData, {
              onSuccess: () => {
                queryClient.invalidateQueries({
                  predicate: (query) => query.queryKey.includes("character_fields_templates"),
                });
                resetDrawerAtom();
              },
            });
          }
        }}
        variant="success"
      />
    </div>
  );
}
