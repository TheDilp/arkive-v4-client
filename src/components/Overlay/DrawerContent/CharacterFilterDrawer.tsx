import { useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useHandleChange } from "../../../hooks";
import { CharacterFieldTemplateType, FieldTypes, RequestFilterType, TableDispatch } from "../../../types";
import { getFieldValueFromType, IconEnum, NumberFilters, TextFilters } from "../../../utils";
import { Button, Input, Select } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Badge } from "../../Misc";

const nonFilterableEntities = ["textarea", "date", "random_table", "dice_roll"];

export function CharacterFilterDrawer({ data }: { data: { dispatch: TableDispatch } }) {
  const { project_id } = useParams();
  const { dispatch } = data;
  const [filters, setFilters] = useState<{
    and: {
      id: string;
      template: { id: string; title: string };
      field: { id: string; field_type: string; title: string };
      filter: RequestFilterType;
    }[];
    or: {
      id: string;
      template: { id: string; title: string };
      field: { id: string; field_type: string };
      filter: RequestFilterType;
    }[];
  }>({ and: [], or: [] });
  const { data: existingTemplates, isInitialLoading } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: {
        project_id,
      },
      fields: ["id", "title"],
      relations: {
        character_fields: true,
      },
    },
    "character_fields_templates",
  );

  const { handleChange } = useHandleChange({ data: filters, setData: setFilters });

  return (
    <DrawerLayout>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <div>Add new AND filter:</div>
          <div className="h-8 w-8">
            <Button
              icon={IconEnum.add}
              isDisabled={!existingTemplates?.data?.length || isInitialLoading}
              isLoading={isInitialLoading}
              onClick={() => {
                setFilters((prev) => ({
                  and: prev.and.concat({
                    id: crypto.randomUUID(),
                    template: { id: "", title: "" },
                    field: { id: "", field_type: "", title: "" },
                    filter: {
                      id: crypto.randomUUID(),
                      header_name: "",
                      field: "",
                      value: "",
                      operator: "eq",
                      relationalData: { character_field_id: "" },
                    },
                  }),
                  or: prev.or,
                }));
              }}
              variant="info"
            />
          </div>
        </div>
        {filters.and.map((f, i) => (
          <div key={f.id} className="flex gap-x-1">
            <div className="grid flex-1 grid-cols-2 gap-1">
              {i !== 0 ? (
                <div className="col-span-2 flex justify-center">
                  <div className="max-w-fit">
                    <Badge label="AND" variant="info" />
                  </div>
                </div>
              ) : null}
              <div className="col-span-1">
                <Select
                  label="Template"
                  name={`and[${i}].template`}
                  onChange={({ name, value }) => {
                    const template = (existingTemplates?.data || [])?.find((t) => t.id === value);
                    if (template) {
                      handleChange([
                        { name, value: { id: template.id, title: template.title } },
                        { name: `and[${i}].field`, value: null },
                      ]);
                    }
                  }}
                  options={(existingTemplates?.data || [])?.map((opt) => ({ value: opt.id, label: opt.title }))}
                  value={f.template.id}
                />
              </div>
              <div className="col-span-1">
                <Select
                  label="Field"
                  name={`and[${i}].field`}
                  onChange={({ name, value }) => {
                    const field = existingTemplates?.data
                      ?.find((t) => t.id === f.template.id)
                      ?.character_fields?.find((char_field) => char_field.id === value);

                    if (field) {
                      handleChange({ name, value: { id: field.id, field_type: field.field_type, title: field.title } });
                    }
                  }}
                  options={((existingTemplates?.data || [])?.find((t) => t.id === f.template.id)?.character_fields || [])?.map(
                    (opt) => ({
                      value: opt.id,
                      label: opt.title,
                      isDisabled: nonFilterableEntities.includes(opt.field_type),
                    }),
                  )}
                  value={f?.field?.id}
                />
              </div>
              <div className="col-span-1">
                {f?.field?.field_type === "number" || f?.field?.field_type === "text" ? (
                  <Select
                    label="Filter value"
                    name={`and[${i}].filter.operator`}
                    onChange={handleChange}
                    options={f?.field?.field_type === "number" ? NumberFilters : TextFilters}
                    value={(f?.filter?.operator || "") as string | number}
                  />
                ) : null}
              </div>
              <div className="col-span-1">
                {f?.field?.field_type === "number" || f?.field?.field_type === "text" ? (
                  <Input
                    label="Filter value"
                    name={`and[${i}].filter.value`}
                    onChange={handleChange}
                    type={f?.field?.field_type}
                    value={(f?.filter?.value || "") as string | number}
                  />
                ) : null}
              </div>
            </div>
            <div className="mt-5 h-10 w-10 self-center">
              <Button
                hasNoBackground
                icon={IconEnum.trash}
                isIconOnly
                onClick={() => setFilters((prev) => ({ and: prev.and.filter((filt) => filt.id !== f.id), or: prev.or }))}
                variant="error"
              />
            </div>
          </div>
        ))}
      </div>
      <hr className="border-zinc-600" />
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between">
          <div>Add new OR filter:</div>
          <div className="h-8 w-8">
            <Button
              icon={IconEnum.add}
              isDisabled={!existingTemplates?.data?.length || isInitialLoading}
              isLoading={isInitialLoading}
              onClick={() => {}}
              variant="info"
            />
          </div>
        </div>
      </div>
      <div>
        <Button
          icon={IconEnum.filter}
          label="Apply filter"
          onClick={() => {
            const andFilters = filters.and.map((filt) => ({
              ...filt.filter,
              field: getFieldValueFromType(filt.field.field_type as FieldTypes) || "",
              header_name: `${filt.template.title} - ${filt.field.title}`,
              relationalData: { character_field_id: filt.field.id },
            }));
            dispatch({ type: "setRelationFilter", payload: { and: andFilters } });
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
