import { useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useHandleChange } from "../../../hooks";
import { CharacterFieldTemplateType, RequestFilterType } from "../../../types";
import { IconEnum, NumberFilters, TextFilters } from "../../../utils";
import { Button, Input, Select } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Badge } from "../../Misc";

const nonFilterableEntities = ["textarea", "date", "random_table", "dice_roll"];

export function CharacterFilterDrawer() {
  const { project_id } = useParams();
  const [filters, setFilters] = useState<
    {
      id: string;
      template: { id: string };
      field: { id: string; field_type: string };
      filter: RequestFilterType;
    }[]
  >([]);
  const { data, isInitialLoading } = useGetEntities<CharacterFieldTemplateType>(
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
      <div className="flex items-center justify-between">
        <div>Add new filter:</div>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            isDisabled={!data?.data?.length || isInitialLoading}
            isLoading={isInitialLoading}
            onClick={() => {
              setFilters((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  template: { id: "" },
                  field: { id: "", field_type: "" },
                  filter: {
                    id: crypto.randomUUID(),
                    header_name: "",
                    field: "",
                    value: "",
                    operator: "eq",
                    relationalData: { character_field_id: "" },
                  },
                },
              ]);
            }}
            variant="info"
          />
        </div>
      </div>
      {filters.map((f, i) => (
        <div key={f.id} className="grid grid-cols-2 gap-1">
          <div className="col-span-1">
            <Select
              label="Template"
              name={`[${i}].template.id`}
              onChange={({ name, value }) => {
                handleChange([
                  { name, value },
                  { name: `[${i}].field`, value: undefined },
                ]);
              }}
              options={(data?.data || [])?.map((opt) => ({ value: opt.id, label: opt.title }))}
              value={f.template.id}
            />
          </div>
          <div className="col-span-1">
            <Select
              label="Field"
              name={`[${i}].field`}
              onChange={({ name, value }) => {
                const field = data?.data
                  ?.find((t) => t.id === f.template.id)
                  ?.character_fields?.find((char_field) => char_field.id === value);
                if (field) {
                  handleChange({ name, value: { id: field.id, field_type: field.field_type } });
                }
              }}
              options={((data?.data || [])?.find((t) => t.id === f.template.id)?.character_fields || [])?.map((opt) => ({
                value: opt.id,
                label: opt.title,
                isDisabled: nonFilterableEntities.includes(opt.field_type),
              }))}
              value={f?.field?.id}
            />
          </div>
          <div className="col-span-1">
            {f?.field?.field_type === "number" || f?.field?.field_type === "text" ? (
              <Select
                label="Filter value"
                name={`[${i}].filter.value`}
                onChange={handleChange}
                options={f?.field?.field_type === "number" ? NumberFilters : TextFilters}
                value={(f?.filter?.value || "") as string | number}
              />
            ) : null}
          </div>
          <div className="col-span-1">
            {f?.field?.field_type === "number" || f?.field?.field_type === "text" ? (
              <Input
                label="Filter value"
                name={`[${i}].filter.value`}
                onChange={handleChange}
                type={f?.field?.field_type}
                value={(f?.filter?.value || "") as string | number}
              />
            ) : null}
          </div>
          <div className="col-span-2 flex justify-center">
            <div className="max-w-fit">
              <Badge label="AND" variant="info" />
            </div>
          </div>
        </div>
      ))}
      <div>
        <Button
          icon={IconEnum.filter}
          label="Apply filter"
          onClick={() => {
            // console.log(filters);
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
