import { Fragment, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useHandleChange } from "../../../hooks";
import {
  AvailableEntityType,
  AvailableSubEntityType,
  CharacterFieldTemplateType,
  FieldTypes,
  HandleChangePropsType,
  RequestFilterType,
  SearchableEntities,
  TableDispatch,
} from "../../../types";
import {
  getDefaultEntityIcon,
  getFieldValueFromType,
  getSearchType,
  getSentenceCase,
  IconEnum,
  NumberFilters,
  relationFiltersList,
  TextFilters,
} from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search, Select, Title } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";
import { Badge } from "../../Misc";
import { Dropdown } from "../Dropdown";

const nonFilterableEntities = ["textarea", "date", "random_table", "dice_roll"];
const resourceEntities = ["documents", "maps", "events", "images", "tags"];
type CharacterFilterField = {
  id: string;
  field_id: string;
  field_type: string;
  title: string;
  options?: { id: string; value: string }[];
  blueprint_id?: string;
  filter: RequestFilterType;
};

type CharacterFilter = {
  id: string;
  template: {
    id: string;
    title: string;
  };
  fields: {
    and: CharacterFilterField[];
    or: CharacterFilterField[];
  };
};

function formatCharacterFilter(field: CharacterFilterField): RequestFilterType {
  return {
    id: field.field_id || field.field_type,
    field: getFieldValueFromType(field.field_type as FieldTypes) || field.field_type || "",
    operator: field.filter.operator,
    header_name: field?.filter?.header_name || field.title,
    value: field.filter.value,
    relationalData: { character_field_id: field.field_id, label: field?.filter?.relationalData?.label },
  };
}

function isApplyDisabled(filters: CharacterFilter[]) {
  if (!filters.length) return true;
  if (filters.some((filt) => !filt.fields.and.length && !filt.fields.or.length)) return true;
  for (let index = 0; index < filters.length; index += 1) {
    for (let andIndex = 0; andIndex < filters[index].fields.and.length; andIndex += 1) {
      if (!filters[index].fields.and[andIndex].filter.value) {
        return true;
      }
    }
    for (let orIndex = 0; orIndex < filters[index].fields.or.length; orIndex += 1) {
      if (!filters[index].fields.or[orIndex].filter.value) {
        return true;
      }
    }
  }
  return false;
}

function CharacterFieldsFilters({
  filterFields,
  existingTemplates,
  handleChange,
  i,
  f,
  type,
}: {
  filterFields: CharacterFilterField[];
  existingTemplates:
    | {
        data: CharacterFieldTemplateType[];
      }
    | undefined;
  handleChange: (newData: HandleChangePropsType) => void;
  i: number;
  f: CharacterFilter;
  type: "and" | "or";
}) {
  return filterFields.map((field, fIdx) => (
    <Fragment key={field.id}>
      <div className="col-span-12">
        {fIdx !== 0 ? (
          <div className="mt-1.5 flex w-full justify-center">
            <div className="w-16">
              <Badge label={type.toUpperCase()} variant="info" />
            </div>
          </div>
        ) : null}
      </div>
      <div className="col-span-5">
        <Select
          label="Field"
          name={`[${i}].fields.${type}[${fIdx}]`}
          onChange={({ name, value }) => {
            const templateField = existingTemplates?.data
              ?.find((t) => t.id === f.template.id)
              ?.character_fields?.find((char_field) => char_field.id === value);
            if (templateField) {
              handleChange({
                name,
                value: {
                  id: field.id,
                  field_id: templateField.id,
                  field_type: templateField.field_type,
                  title: templateField.title,
                  options: templateField.options,
                  blueprint_id: templateField.blueprint_id,
                  filter: {
                    operator: "eq",
                  },
                },
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
          value={field?.field_id}
        />
      </div>
      {field?.field_type === "number" || field?.field_type === "text" ? (
        <div className="col-span-6">
          <Select
            label="Filter type"
            name={`[${i}].fields.${type}[${fIdx}].filter.operator`}
            onChange={handleChange}
            options={field?.field_type === "number" ? NumberFilters : TextFilters}
            value={(field?.filter?.operator || "") as string | number}
          />
        </div>
      ) : null}

      {field.field_type !== "select" &&
      field.field_type !== "select_multiple" &&
      !relationFiltersList.includes(field.field_type) ? (
        <div className="col-span-1">
          <div className="mt-5 h-10 w-10 self-center">
            <Button
              hasNoBackground
              icon={IconEnum.trash}
              isIconOnly
              onClick={() => {
                handleChange({
                  name: `[${i}].fields.${type}`,
                  value: f.fields[type].filter((filtering_field) => field.id !== filtering_field.id),
                });
              }}
              variant="error"
            />
          </div>
        </div>
      ) : null}

      {field?.field_type === "number" || field?.field_type === "text" ? (
        <div className="col-span-12">
          <Input
            label="Filter value"
            name={`[${i}].fields.${type}[${fIdx}].filter.value`}
            onChange={handleChange}
            type={field?.field_type}
            value={(field?.filter?.value || "") as string | number}
          />
        </div>
      ) : null}
      {field?.field_type === "select" || field?.field_type === "select_multiple" ? (
        <div className="col-span-6">
          <Select
            label="Filter value"
            name={`[${i}].fields.${type}[${fIdx}].filter.value`}
            onChange={(newValue) => {
              const opt = field.options?.find((o) => o.id === newValue.value);
              handleChange([
                newValue,
                { name: `[${i}].fields.${type}[${fIdx}].filter.relationalData.label`, value: opt?.value },
              ]);
            }}
            options={(field.options || []).map((opt) => ({ label: opt.value, value: opt.id }))}
            value={(field?.filter?.value || "") as string | number}
          />
        </div>
      ) : null}
      {field.field_type === "select" || field.field_type === "select_multiple" ? (
        <div className="col-span-1">
          <div className="mt-5 h-10 w-10 self-center">
            <Button
              hasNoBackground
              icon={IconEnum.trash}
              isIconOnly
              onClick={() => {
                handleChange({
                  name: `[${i}].fields.${type}`,
                  value: f.fields[type].filter((filtering_field) => field.id !== filtering_field.id),
                });
              }}
              variant="error"
            />
          </div>
        </div>
      ) : null}
      {relationFiltersList.includes(field?.field_type) ? (
        <div className="col-span-6">
          <div className="flex items-center [&>div>*>span>a>span]:max-w-[5.5rem]">
            {field?.filter?.value ? (
              <div className="w-full">
                <EntityPreview
                  clearAction={() =>
                    handleChange([
                      { name: `[${i}].fields.${type}[${fIdx}].filter.value`, value: "" },
                      { name: `[${i}].fields.${type}[${fIdx}].filter.relationalData`, value: undefined },
                    ])
                  }
                  icon={field.filter.relationalData?.icon}
                  id={field.filter.relationalData?.value}
                  image_id={field.filter.relationalData?.image}
                  label="Includes"
                  title={field.filter.relationalData?.label}
                  type={getSearchType(field.field_type) as AvailableEntityType}
                />
              </div>
            ) : (
              <Search
                label="Includes"
                name={`[${i}].fields.${type}[${fIdx}].filter.value`}
                onChange={({ name, value, label, image, icon }) =>
                  handleChange([
                    { name, value },
                    {
                      name: `[${i}].fields.${type}[${fIdx}].filter.relationalData`,
                      value: { value, label, image, icon, character_field_id: field.id },
                    },
                  ])
                }
                parent_id={field.blueprint_id}
                searchEntity={getSearchType(field.field_type) as SearchableEntities}
                value={field?.filter?.value as string | undefined}
              />
            )}
          </div>
        </div>
      ) : null}
      {relationFiltersList.includes(field.field_type) ? (
        <div className="col-span-1">
          <div className="mt-5 h-10 w-10 self-center">
            <Button
              hasNoBackground
              icon={IconEnum.trash}
              isIconOnly
              onClick={() => {
                handleChange({
                  name: `[${i}].fields.${type}`,
                  value: f.fields[type].filter((filtering_field) => field.id !== filtering_field.id),
                });
              }}
              variant="error"
            />
          </div>
        </div>
      ) : null}
    </Fragment>
  ));
}

function CharacterFieldsFiltersList({
  filters,
  existingTemplates,
  handleChange,
  removeTemplate,
}: {
  filters: CharacterFilter[];
  existingTemplates:
    | {
        data: CharacterFieldTemplateType[];
      }
    | undefined;
  handleChange: (newData: HandleChangePropsType) => void;
  removeTemplate: (id: string) => void;
}) {
  return filters.map((f, i) => (
    <li key={f.id} className="flex flex-col gap-x-1">
      <Collapsible
        actions={[{ onClick: () => removeTemplate(f.id), variant: "error", hasNoBackground: true, icon: IconEnum.trash }]}
        initialOpen
        label={f.template.title}>
        <div className="grid flex-1 grid-cols-12 gap-1 p-2">
          <div className="col-span-12 flex items-center justify-between">
            <div className="flex-1">
              <Title isDrawerTitle label="AND filters" />
            </div>
            <div className="h-6 w-6">
              <Button
                hasNoBackground
                icon={IconEnum.add}
                onClick={() =>
                  handleChange({
                    name: `[${i}].fields.and`,
                    value: (f?.fields.and || []).concat([
                      {
                        id: crypto.randomUUID(),
                        field_type: "",
                        field_id: "",
                        title: "",
                        filter: {
                          id: crypto.randomUUID(),
                          header_name: "",
                          field: "",
                          value: "",
                          operator: "eq",
                          relationalData: { character_field_id: "" },
                        },
                      },
                    ]),
                  })
                }
              />
            </div>
          </div>
          <CharacterFieldsFilters
            existingTemplates={existingTemplates}
            f={f}
            filterFields={f.fields.and}
            handleChange={handleChange}
            i={i}
            type="and"
          />
          <CharacterFieldsFilters
            existingTemplates={existingTemplates}
            f={f}
            filterFields={f.fields.or}
            handleChange={handleChange}
            i={i}
            type="or"
          />
          <div className="col-span-12 flex items-center justify-between">
            <div className="flex-1">
              <Title isDrawerTitle label="OR filters" />
            </div>
            <div className="h-6 w-6">
              <Button
                hasNoBackground
                icon={IconEnum.add}
                onClick={() =>
                  handleChange({
                    name: `[${i}].fields.or`,
                    value: (f?.fields.or || []).concat([
                      {
                        id: crypto.randomUUID(),
                        field_id: "",
                        field_type: "",
                        title: "",
                        filter: {
                          id: crypto.randomUUID(),
                          header_name: "",
                          field: "",
                          value: "",
                          operator: "eq",
                          relationalData: { character_field_id: "" },
                        },
                      },
                    ]),
                  })
                }
              />
            </div>
          </div>
        </div>
      </Collapsible>
    </li>
  ));
}

function CharacterResourceFilter({
  filterFields,
  handleChange,
  i,
  type,
  f,
}: {
  filterFields: CharacterFilterField[];
  handleChange: (newData: HandleChangePropsType) => void;
  i: number;
  f: CharacterFilter;
  type: "and" | "or";
}) {
  return filterFields.map((field, fIdx) => (
    <Fragment key={field.id}>
      <div className="col-span-12">
        {fIdx !== 0 ? (
          <div className="flex w-full justify-center">
            <div className="w-16">
              <Badge label={type.toUpperCase()} variant="info" />
            </div>
          </div>
        ) : null}
      </div>

      <div className="col-span-11">
        <div className="flex flex-1 items-center">
          {field?.filter?.value ? (
            <div className="w-full">
              <EntityPreview
                clearAction={() =>
                  handleChange([
                    { name: `[${i}].fields.${type}[${fIdx}].filter.value`, value: "" },
                    { name: `[${i}].fields.${type}[${fIdx}].filter.relationalData`, value: undefined },
                  ])
                }
                icon={field.filter.relationalData?.icon}
                id={field.filter.relationalData?.value}
                image_id={f.id === "images" ? field.filter.value : field.filter.relationalData?.image}
                title={field.filter.relationalData?.label}
                type={f.id as AvailableEntityType}
              />
            </div>
          ) : (
            <Search
              imageType={f.id === "maps" ? "map_images" : "images"}
              limit={10}
              name={`[${i}].fields.${type}[${fIdx}].filter.value`}
              onChange={({ name, value, label, image, icon }) =>
                handleChange([
                  { name, value },
                  {
                    name: `[${i}].fields.${type}[${fIdx}].filter.relationalData`,
                    value: { value, label, image, icon },
                  },
                ])
              }
              searchEntity={f.id as SearchableEntities}
              value={field?.filter?.value as string | undefined}
            />
          )}
        </div>
      </div>
      <div className="w-10 self-center">
        <Button
          hasNoBackground
          icon={IconEnum.trash}
          isIconOnly
          onClick={() => {
            handleChange({
              name: `[${i}].fields.${type}`,
              value: f.fields[type].filter((filtering_field) => field.id !== filtering_field.id),
            });
          }}
          variant="error"
        />
      </div>
    </Fragment>
  ));
}

function CharacterResourceFiltersList({
  filters,
  handleChange,
  removeTemplate,
}: {
  filters: CharacterFilter[];
  handleChange: (newData: HandleChangePropsType) => void;
  removeTemplate: (id: string) => void;
}) {
  return filters.map((f, i) => (
    <li key={f.id} className="flex flex-col gap-x-1">
      <Collapsible
        actions={[{ onClick: () => removeTemplate(f.id), variant: "error", hasNoBackground: true, icon: IconEnum.trash }]}
        icon={f.id === "maps" ? IconEnum.map_pin : getDefaultEntityIcon(f.id as AvailableEntityType | AvailableSubEntityType)}
        initialOpen
        label={f.template.title}>
        <div className="grid flex-1 grid-cols-12 gap-1 p-2">
          <div className="col-span-12 flex items-center justify-between">
            <div className="flex-1">
              <Title isDrawerTitle label="AND filters" />
            </div>
            <div className="h-6 w-6">
              <Button
                hasNoBackground
                icon={IconEnum.add}
                onClick={() =>
                  handleChange({
                    name: `[${i}].fields.and`,
                    value: (f?.fields.and || []).concat([
                      {
                        id: crypto.randomUUID(),
                        field_type: f.id,
                        field_id: "",
                        title: "",
                        filter: {
                          id: crypto.randomUUID(),
                          header_name: getSentenceCase(f.id),
                          field: f.id,
                          value: "",
                          operator: "eq",
                          relationalData: {},
                        },
                      },
                    ]),
                  })
                }
              />
            </div>
          </div>
          <CharacterResourceFilter f={f} filterFields={f.fields.and} handleChange={handleChange} i={i} type="and" />
          <div className="col-span-12 flex items-center justify-between">
            <div className="flex-1">
              <Title isDrawerTitle label="OR filters" />
            </div>
            <div className="h-6 w-6">
              <Button
                hasNoBackground
                icon={IconEnum.add}
                onClick={() =>
                  handleChange({
                    name: `[${i}].fields.or`,
                    value: (f?.fields.or || []).concat([
                      {
                        id: crypto.randomUUID(),
                        field_id: "",
                        field_type: f.id,
                        title: "",
                        filter: {
                          id: crypto.randomUUID(),
                          header_name: getSentenceCase(f.id),
                          field: f.id,
                          value: "",
                          operator: "eq",
                          relationalData: {},
                        },
                      },
                    ]),
                  })
                }
              />
            </div>
          </div>
          <CharacterResourceFilter f={f} filterFields={f.fields.or} handleChange={handleChange} i={i} type="or" />
        </div>
      </Collapsible>
    </li>
  ));
}

export function CharacterFilterDrawer({ data }: { data: { dispatch: TableDispatch } }) {
  const { project_id } = useParams();
  const { dispatch } = data;
  const [filters, setFilters] = useState<CharacterFilter[]>([]);
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

  const { handleChange } = useHandleChange({ data: filters, setData: setFilters, ignoreDataChange: true });

  return (
    <DrawerLayout>
      <ul className="flex flex-col gap-y-2">
        <li className="flex items-center justify-between">
          <div>Add filters for resources:</div>
          <Dropdown
            allowedPlacements={["left"]}
            items={[
              {
                id: "documents",
                title: "Documents",
                icon: IconEnum.document,
                onClick: () => {
                  setFilters((prev) =>
                    prev.concat({
                      id: "documents",
                      template: { id: "documents", title: "Documents" },
                      fields: {
                        and: [],
                        or: [],
                      },
                    }),
                  );
                },
                isDisabled: filters.some((f) => f.id === "documents"),
              },
              {
                id: "locations",
                title: "Locations",
                icon: IconEnum.map_pin,
                onClick: () => {
                  setFilters((prev) =>
                    prev.concat({
                      id: "maps",
                      template: { id: "maps", title: "Locations" },
                      fields: {
                        and: [],
                        or: [],
                      },
                    }),
                  );
                },
                isDisabled: filters.some((f) => f.id === "maps"),
              },
              {
                id: "events",
                title: "Events",
                icon: IconEnum.event,
                onClick: () => {
                  setFilters((prev) =>
                    prev.concat({
                      id: "events",
                      template: { id: "events", title: "Events" },
                      fields: {
                        and: [],
                        or: [],
                      },
                    }),
                  );
                },
                isDisabled: filters.some((f) => f.id === "events"),
              },
              {
                id: "images",
                title: "Images",
                icon: IconEnum.image,
                onClick: () => {
                  setFilters((prev) =>
                    prev.concat({
                      id: "images",
                      template: { id: "images", title: "Images" },
                      fields: {
                        and: [],
                        or: [],
                      },
                    }),
                  );
                },
                isDisabled: filters.some((f) => f.id === "images"),
              },
              {
                id: "tags",
                title: "Tags",
                icon: IconEnum.tags,
                onClick: () => {
                  setFilters((prev) =>
                    prev.concat({
                      id: "tags",
                      template: { id: "tags", title: "Tags" },
                      fields: {
                        and: [],
                        or: [],
                      },
                    }),
                  );
                },
                isDisabled: filters.some((f) => f.id === "tags"),
              },
            ]}>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isDisabled={!existingTemplates?.data?.length || isInitialLoading}
                isLoading={isInitialLoading}
                onClick={undefined}
                variant="info"
              />
            </div>
          </Dropdown>
        </li>
        <li className="flex items-center justify-between">
          <div>Add filters for template:</div>
          <Dropdown
            allowedPlacements={["left"]}
            items={(existingTemplates?.data || [])
              ?.filter((temp) => !filters.some((f) => f.template.id === temp.id))
              ?.map((temp) => ({
                id: temp.id,
                title: temp.title,
                value: temp.id,

                onClick: () => {
                  setFilters((prev) =>
                    prev.concat({
                      id: temp.id,
                      template: { id: temp.id, title: temp.title },
                      fields: {
                        and: [],
                        or: [],
                      },
                    }),
                  );
                },
              }))}>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isDisabled={!existingTemplates?.data?.length || isInitialLoading}
                isLoading={isInitialLoading}
                onClick={undefined}
                variant="info"
              />
            </div>
          </Dropdown>
        </li>
        <CharacterFieldsFiltersList
          existingTemplates={existingTemplates}
          filters={filters.filter((f) => !resourceEntities.includes(f.id))}
          handleChange={handleChange}
          removeTemplate={(id: string) =>
            setFilters((prev) =>
              prev.toSpliced(
                prev.findIndex((p) => p.id === id),
                1,
              ),
            )
          }
        />
        <CharacterResourceFiltersList
          filters={filters.filter((f) => resourceEntities.includes(f.id))}
          handleChange={handleChange}
          removeTemplate={(id: string) =>
            setFilters((prev) =>
              prev.toSpliced(
                prev.findIndex((p) => p.id === id),
                1,
              ),
            )
          }
        />
      </ul>
      <div>
        <Button
          icon={IconEnum.filter}
          isDisabled={isApplyDisabled(filters)}
          label="Apply filter"
          onClick={() => {
            const andFields = filters.flatMap((f) => f.fields.and);
            const orFields = filters.flatMap((f) => f.fields.or);

            const and = andFields.map(formatCharacterFilter);
            const or = orFields.map(formatCharacterFilter);
            dispatch({ type: "setRelationFilters", payload: { and, or } });
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
