import {
  useCreateAdditionalFieldTemplate as useCreateFieldTemplate,
  useGetItem,
  useHandleChange,
  useUpdateEntity,
} from "../../../hooks";
import { FieldTemplate, FieldType, InputOnChangeValue, onChangeValue } from "../../../types";
import { drawerAtom, FieldTypesEnum, getSentenceCase, IconEnum, SetStateAction, useResetAtom } from "../../../utils";
import { Dispatch, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, Input, Select } from "../../Form";

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
      (field) => !field.title || !field.fieldType || (field.fieldType === "select_multiple" && !field?.options?.length),
    )
  )
    return true;
  return false;
}

function FieldRow({
  title,
  fieldType,
  options,
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
            name={`[${index}].fieldType`}
            onChange={changeField}
            options={FieldTypesEnum.map((t) => ({ label: getSentenceCase(t), value: t }))}
            placeholder="Field type"
            value={fieldType}
          />
        </div>
        {fieldType === "select" || fieldType === "select_multiple" ? (
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
      {fieldType === "select" || fieldType === "select_multiple" ? (
        <div className="flex flex-col gap-y-2 pl-8">
          {options?.map((opt, optIndex) => (
            <div key={opt.id} className="flex w-full flex-nowrap">
              <div className="w-[calc(100%-5rem)]">
                <Input name={`[${index}].options[${optIndex}].title`} onChange={changeField} value={opt.title} />
              </div>
              <div className="flex flex-1 justify-end">
                <div className="h-10 w-8">
                  <Button hasNoBackground icon={IconEnum.trash} onClick={() => deleteField(index)} variant="error" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function FieldTemplateDrawer({ data }: { data: { id?: string } }) {
  const { projectId } = useParams();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: create } = useCreateFieldTemplate<{
    title: string;
    projectId: string;
    fields: (Omit<FieldType, "options" | "parentId" | "id"> & { options?: string[] })[];
  }>();

  const { mutateAsync: update } = useUpdateEntity<{
    data: Partial<Omit<FieldTemplate, "id" | "fields">>;
    relations?: { fields?: FieldType[] };
  }>("characterFieldsTemplates", projectId as string, data?.id);

  const { data: existingTemplate } = useGetItem<FieldTemplate & { fields: FieldType[] }>(data?.id, "characterFieldsTemplates", {
    enabled: !!data?.id,
  });

  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<(Omit<FieldType, "options"> & { options?: { id: string; title: string }[] })[]>([]);
  const { handleChange } = useHandleChange({ data: fields, setData: setFields });

  useEffect(() => {
    if (existingTemplate?.data) {
      setTitle(existingTemplate.data.title);
      setFields(
        existingTemplate?.data?.fields.map((f) => ({
          ...f,
          options: (f.options || [])?.map((opt) => ({ title: opt, id: crypto.randomUUID() })),
        })) || [],
      );
    }
  }, [existingTemplate]);

  return (
    <div className="flex flex-col gap-y-4 text-white">
      <Input label="Template title (required)" name="title" onChange={({ value }) => setTitle(value as string)} value={title} />
      <h5 className="border-b border-zinc-600 text-lg">Fields</h5>
      <div className="flex items-center justify-between">
        <span>Insert new field:</span>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            variant="info"
            onClick={() =>
              setFields((prev) => [...prev, { id: crypto.randomUUID(), title: "", parentId: "", fieldType: "text" }])
            }
          />
        </div>
      </div>
      <div className="flex max-h-[30rem] flex-col gap-y-4 overflow-y-auto">
        {fields.map((field, index) => (
          <FieldRow
            key={field.id}
            changeField={handleChange}
            deleteField={(i: number) => removeField(i, setFields)}
            fieldType={field.fieldType}
            id={field.id}
            index={index}
            options={field?.options}
            title={field.title}
          />
        ))}
      </div>
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(title, fields)}
        label={data?.id ? "Update" : "Create"}
        onClick={async () => {
          if (!data?.id)
            await create(
              {
                title,
                projectId: projectId as string,
                fields: fields.map((field) => ({
                  title: field.title,
                  fieldType: field.fieldType,
                  options: field?.options?.map((opt) => opt.title),
                })),
              },
              {
                onSuccess: resetDrawerAtom,
              },
            );
          else
            await update({
              data: {
                title,
              },
              relations: { fields: fields.map((field) => ({ ...field, options: field.options?.map((opt) => opt.title) })) },
            });

          resetDrawerAtom();
        }}
        variant="success"
      />
    </div>
  );
}
