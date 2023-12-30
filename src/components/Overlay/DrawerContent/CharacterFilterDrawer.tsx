import { useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useHandleChange } from "../../../hooks";
import {
  AvailableEntityType,
  CharacterFieldTemplateType,
  FieldTypes,
  HandleChangePropsType,
  RequestFilterType,
  SearchableEntities,
  TableDispatch,
} from "../../../types";
import {
  getFieldValueFromType,
  getSearchType,
  IconEnum,
  NumberFilters,
  relationFiltersList,
  TextFilters,
} from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search, Select } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Badge } from "../../Misc";

const nonFilterableEntities = ["textarea", "date", "random_table", "dice_roll"];

type CharacterFilter = {
  id: string;
  template: { id: string; title: string };
  field: { id: string; field_type: string; title: string; options?: { id: string; value: string }[] };
  filter: RequestFilterType;
};

function formatCharacterFilter(filt: CharacterFilter) {
  return {
    ...filt.filter,
    field: getFieldValueFromType(filt.field.field_type as FieldTypes) || "",
    header_name: `${filt.template.title} - ${filt.field.title}`,
    relationalData: { character_field_id: filt.field.id, label: filt?.filter?.relationalData?.label || "" },
  };
}

function isApplyDisabled(filters: { and: CharacterFilter[]; or: CharacterFilter[] }) {
  if (!filters.and.length && !filters.or.length) return true;
  if (filters.and.some((f) => !f.filter.value)) return true;
  if (filters.or.some((f) => !f.filter.value)) return true;
  return false;
}

function CharacterFiltersList({
  filters,
  existingTemplates,
  handleChange,
  type,
}: {
  filters: CharacterFilter[];
  existingTemplates:
    | {
        data: CharacterFieldTemplateType[];
      }
    | undefined;
  handleChange: (newData: HandleChangePropsType) => void;
  type: "and" | "or";
}) {
  return filters.map((f, i) => (
    <li key={f.id} className="flex gap-x-1">
      <div className="grid flex-1 grid-cols-2 gap-1">
        {i !== 0 ? (
          <div className="col-span-2 flex justify-center">
            <div className="max-w-fit">
              <Badge label={type.toUpperCase()} variant="info" />
            </div>
          </div>
        ) : null}
        <div className="col-span-1">
          <Select
            label="Template"
            name={`${type}[${i}].template`}
            onChange={({ name, value }) => {
              const template = (existingTemplates?.data || [])?.find((t) => t.id === value);
              if (template) {
                handleChange([
                  { name, value: { id: template.id, title: template.title } },
                  { name: `${type}[${i}].field`, value: null },
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
            name={`${type}[${i}].field`}
            onChange={({ name, value }) => {
              const field = existingTemplates?.data
                ?.find((t) => t.id === f.template.id)
                ?.character_fields?.find((char_field) => char_field.id === value);

              if (field) {
                handleChange({
                  name,
                  value: { id: field.id, field_type: field.field_type, title: field.title, options: field.options },
                });
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
        {f?.field?.field_type === "number" || f?.field?.field_type === "text" ? (
          <div className="col-span-1">
            <Select
              label="Filter value"
              name={`${type}[${i}].filter.operator`}
              onChange={handleChange}
              options={f?.field?.field_type === "number" ? NumberFilters : TextFilters}
              value={(f?.filter?.operator || "") as string | number}
            />
          </div>
        ) : null}

        {f?.field?.field_type === "number" || f?.field?.field_type === "text" ? (
          <div className="col-span-1">
            <Input
              label="Filter value"
              name={`${type}[${i}].filter.value`}
              onChange={handleChange}
              type={f?.field?.field_type}
              value={(f?.filter?.value || "") as string | number}
            />
          </div>
        ) : null}
        {f?.field?.field_type === "select" || f?.field?.field_type === "select_multiple" ? (
          <div className="col-span-2">
            <Select
              label="Filter value"
              name={`${type}[${i}].filter.value`}
              onChange={(newValue) => {
                const opt = f.field.options?.find((o) => o.id === newValue.value);
                handleChange([newValue, { name: `${type}[${i}].filter.relationalData.label`, value: opt?.value }]);
              }}
              options={(f.field.options || []).map((opt) => ({ label: opt.value, value: opt.id }))}
              value={(f?.filter?.value || "") as string | number}
            />
          </div>
        ) : null}
        {relationFiltersList.includes(f?.field?.field_type) ? (
          <>
            <div className="col-span-1 flex items-center">Includes:</div>
            <div className="col-span-1">
              {f.filter.value ? (
                <EntityPreview
                  clearAction={() =>
                    handleChange([
                      { name: `${type}[${i}].filter.value`, value: "" },
                      { name: `${type}[${i}].filter.relationalData`, value: undefined },
                    ])
                  }
                  icon={f.filter.relationalData?.icon}
                  id={f.filter.relationalData?.value}
                  image_id={f.filter.relationalData?.image}
                  size="sm"
                  title={f.filter.relationalData?.label}
                  type={getSearchType(f.field.field_type) as AvailableEntityType}
                />
              ) : (
                <Search
                  name={`${type}[${i}].filter.value`}
                  onChange={({ name, value, label, image, icon }) =>
                    handleChange([
                      { name, value },
                      {
                        name: `${type}[${i}].filter.relationalData`,
                        value: { value, label, image, icon, character_field_id: f.field.id },
                      },
                    ])
                  }
                  searchEntity={getSearchType(f.field.field_type) as SearchableEntities}
                  size="sm"
                  value={f.filter.value as string | undefined}
                />
              )}
            </div>
          </>
        ) : null}
      </div>
      <div className="mt-5 h-10 w-10 self-center">
        <Button
          hasNoBackground
          icon={IconEnum.trash}
          isIconOnly
          onClick={() => {
            handleChange({
              name: type,
              value: filters.filter((filt) => filt.id !== f.id),
            });
          }}
          variant="error"
        />
      </div>
    </li>
  ));
}

export function CharacterFilterDrawer({ data }: { data: { dispatch: TableDispatch } }) {
  const { project_id } = useParams();
  const { dispatch } = data;
  const [filters, setFilters] = useState<{
    and: CharacterFilter[];
    or: CharacterFilter[];
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
      <ul className="flex flex-col gap-y-2">
        <li className="flex items-center justify-between">
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
        </li>
        <CharacterFiltersList
          existingTemplates={existingTemplates}
          filters={filters.and}
          handleChange={handleChange}
          type="and"
        />
      </ul>
      {/* <hr className="border-zinc-600" />
      <ul className="flex flex-col gap-y-2">
        <li className="flex items-center justify-between">
          <div>Add new OR filter:</div>
          <div className="h-8 w-8">
            <Button
              icon={IconEnum.add}
              isDisabled={!existingTemplates?.data?.length || isInitialLoading}
              isLoading={isInitialLoading}
              onClick={() => {
                setFilters((prev) => ({
                  or: prev.or.concat({
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
                  and: prev.and,
                }));
              }}
              variant="info"
            />
          </div>
        </li>
        <CharacterFiltersList
          existingTemplates={existingTemplates}
          filters={filters.or}
          handleChange={handleChange}
          type="or"
        />
      </ul> */}

      <div>
        <Button
          icon={IconEnum.filter}
          isDisabled={isApplyDisabled(filters)}
          label="Apply filter"
          onClick={() => {
            const andFilters = filters.and.map(formatCharacterFilter);
            const orFilters = filters.or.map(formatCharacterFilter);
            dispatch({ type: "setRelationFilters", payload: { and: andFilters, or: orFilters } });
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
