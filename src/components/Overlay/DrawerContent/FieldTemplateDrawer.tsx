import { SetStateAction } from "jotai";
import { useResetAtom } from "jotai/utils";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { FieldTemplate, FieldType, InputOnChangeValue, onChangeValue } from "../../../types";
import { drawerAtom, FieldTypesEnum, getSentenceCase, IconEnum, MessageEnum, sortEntities } from "../../../utils";
import { DiceRollRegex } from "../../../utils/ui/diceRollerUtils";
import { Button, Input, Select } from "../../Form";

type insertTemplateType = Partial<FieldTemplate> & { project_id: string };

function removeField(
  index: number,
  setFields: Dispatch<SetStateAction<(Omit<FieldType, "options"> & { options?: { id: string; title: string }[] })[]>>,
) {
  setFields((prev) => {
    const temp = [...prev];
    temp.splice(index, 1);
    return temp;
  });
}

function isSaveDisabled(
  title: string | undefined,
  fields: (Omit<FieldType, "options"> & { options?: { id: string; title: string }[] })[],
) {
  if (!title) return true;
  if (!fields.length) return true;
  if (
    fields.some(
      (field) =>
        !field.title ||
        !field.field_type ||
        (field.field_type === "select_multiple" && !field?.options?.length) ||
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
  options,
  formula,
  index,
  changeField,
  deleteField,
}: (Omit<FieldType, "options" | "parentId"> & { options?: { id: string; title: string }[] }) & {
  index: number;
  changeField: ({
    name,
    value,
  }: onChangeValue | InputOnChangeValue | { name: string; value: { id: string; title: string }[] }) => void;
  deleteField: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex w-full items-center justify-between gap-x-2">
        <div className="h-full flex-1">
          <Input
            label="Field title"
            name={`[${index}].title`}
            onChange={changeField}
            placeholder="Eg. Location"
            value={title}
          />
        </div>
        <div className="h-full flex-1">
          <Select
            label="Field type"
            name={`[${index}].field_type`}
            onChange={changeField}
            options={FieldTypesEnum.map((t) => ({ label: getSentenceCase(t), value: t }))}
            placeholder="Field type"
            value={field_type}
          />
        </div>
        <div className="h-full w-20">
          <Input label="Sort weight" name={`[${index}].sort`} onChange={changeField} placeholder="Eg. 10" value={sort} />
        </div>
        {field_type === "select" || field_type === "select_multiple" ? (
          <div className="h-10 w-8 self-end">
            <Button
              hasNoBackground
              icon={IconEnum.add}
              onClick={() =>
                changeField({
                  name: `[${index}].options`,
                  value: (options || []).concat({ id: crypto.randomUUID(), title: `New option ${(options?.length || 0) + 1}` }),
                })
              }
              tooltip="Add new option"
              variant="info"
            />
          </div>
        ) : null}
        <div className="h-10 w-8 self-end">
          <Button hasNoBackground icon={IconEnum.trash} onClick={() => deleteField(index)} variant="error" />
        </div>
      </div>
      {field_type === "select" || field_type === "select_multiple" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          {options?.map((opt, optIndex) => (
            <div key={opt.id} className="flex w-full flex-nowrap">
              <div className="w-[calc(100%-5rem)]">
                <Input name={`[${index}].options[${optIndex}].title`} onChange={changeField} value={opt.title} />
              </div>
              <div className="flex flex-1 justify-end">
                <div className="h-10 w-8">
                  <Button
                    hasNoBackground
                    icon={IconEnum.trash}
                    onClick={() =>
                      changeField({ name: `[${index}].options`, value: (options || []).filter((o) => o.id !== opt.id) })
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
              label="Dice formula"
              name={`[${index}].formula`}
              onChange={changeField}
              placeholder="E.g. 4d6dl1"
              value={formula}
              variant={formula?.match?.(DiceRollRegex) ? "primary" : "error"}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FieldTemplateDrawer({ data }: { data: { id?: string } }) {
  const { project_id } = useParams();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: insertTemplateType;
    relations?: { character_fields: Omit<FieldType, "id">[] };
  }>("character_fields_templates");

  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<{
    data: Partial<Omit<FieldTemplate, "fields">>;
    relations?: { character_fields?: FieldType[] };
  }>("character_fields_templates", project_id as string);

  const { data: existingTemplate } = useGetEntity<FieldTemplate & { fields: FieldType[] }>(
    data?.id,
    "character_fields_templates",
    {
      data: {
        id: data?.id,
      },
      relations: {
        character_fields: true,
      },
    },
    {
      enabled: !!data?.id,
    },
  );

  const [template, setTemplate] = useState<{ title: string; sort: number }>({ title: "", sort: 0 });
  const [fields, setFields] = useState<(Omit<FieldType, "options"> & { options?: { id: string; title: string }[] })[]>([]);
  const { handleChange } = useHandleChange({ data: template, setData: setTemplate });
  const { handleChange: handleChangeFields } = useHandleChange({ data: fields, setData: setFields });

  useLayoutEffect(() => {
    if (existingTemplate?.data) {
      setTemplate(existingTemplate.data);
      setFields(
        existingTemplate?.data?.character_fields?.map((f) => ({
          ...f,
          options: (f.options || [])?.map((opt) => ({ title: opt, id: crypto.randomUUID() })),
        })) || [],
      );
    }
  }, [existingTemplate]);

  return (
    <div className="flex h-screen max-h-screen flex-col gap-y-4 overflow-auto text-white">
      <div className="flex flex-nowrap items-center gap-x-2">
        <div className="flex-1">
          <Input label="Template title (required)" name="title" onChange={handleChange} value={template?.title || ""} />
        </div>
        <div className="w-20">
          <Input label="Sort weight" name="sort" onChange={handleChange} type="number" value={template?.sort || 0} />
        </div>
      </div>
      <h5 className="border-b border-zinc-600 text-lg">Fields</h5>
      <div className="flex items-center justify-between">
        <span>Insert new field:</span>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            onClick={() =>
              setFields((prev) => [
                ...prev,
                { id: crypto.randomUUID(), title: "", project_id: project_id as string, field_type: "text", sort: 0 },
              ])
            }
            variant="info"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-y-4 overflow-y-auto">
        {fields.sort(sortEntities).map((field, index) => (
          <FieldRow
            key={field.id}
            changeField={handleChangeFields}
            deleteField={(i: number) => removeField(i, setFields)}
            field_type={field.field_type}
            formula={field?.formula}
            id={field.id}
            index={index}
            options={field?.options}
            project_id={field?.project_id}
            sort={field.sort}
            title={field.title}
          />
        ))}
      </div>
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(template?.title, fields) || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={data?.id ? "Update" : "Create"}
        onClick={async () => {
          if (!data?.id)
            await create(
              {
                data: {
                  ...template,
                  project_id: project_id as string,
                },
                relations: {
                  character_fields: fields.map((field) => ({
                    project_id: project_id as string,
                    title: field.title,
                    field_type: field.field_type,
                    sort: field.sort,
                    options: field?.options?.map((opt) => opt.title),
                  })),
                },
              },
              {
                onSuccess: resetDrawerAtom,
              },
            );
          else
            await update({
              data: {
                id: data?.id,
                title: template.title,
                sort: template.sort,
              },
              relations: {
                character_fields: fields.map((field) => ({
                  ...field,
                  project_id: project_id as string,
                  options: field.options?.map((opt) => opt.title),
                })),
              },
            });

          resetDrawerAtom();
        }}
        variant="success"
      />
    </div>
  );
}
