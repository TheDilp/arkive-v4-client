import { Fragment, useState } from "react";
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
import { Button, Input, Search, Select, Title } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";
import { Badge } from "../../Misc";
import { Dropdown } from "../Dropdown";

const nonFilterableEntities = ["textarea", "date", "random_table", "dice_roll"];

type CharacterFilterField = {
  id: string;
  field_id: string;
  field_type: string;
  title: string;
  options?: { id: string; value: string }[];
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
    id: field.field_id,
    field: getFieldValueFromType(field.field_type as FieldTypes) || "",
    operator: field.filter.operator,
    header_name: field?.filter?.header_name || field.title,
    value: field.filter.value,
    relationalData: { character_field_id: field.field_id },
  };
}

function isApplyDisabled(filters: CharacterFilter[]) {
  if (!filters.length) return true;
  return false;
}

function CharacterFiltersList({
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
          {f.fields.and.map((field, fIdx) => (
            <Fragment key={field.id}>
              <div className="col-span-12">
                {fIdx !== 0 ? (
                  <div className="mt-1.5 flex w-full justify-center">
                    <div className="w-16">
                      <Badge label="AND" variant="info" />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="col-span-4">
                <Select
                  label="Field"
                  name={`[${i}].fields.and[${fIdx}]`}
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
                <div className="col-span-3">
                  <Select
                    label="Filter type"
                    name={`[${i}].fields.and[${fIdx}].filter.operator`}
                    onChange={handleChange}
                    options={field?.field_type === "number" ? NumberFilters : TextFilters}
                    value={(field?.filter?.operator || "") as string | number}
                  />
                </div>
              ) : null}

              {field?.field_type === "number" || field?.field_type === "text" ? (
                <div className="col-span-4">
                  <Input
                    label="Filter value"
                    name={`[${i}].fields.and[${fIdx}].filter.value`}
                    onChange={handleChange}
                    type={field?.field_type}
                    value={(field?.filter?.value || "") as string | number}
                  />
                </div>
              ) : null}
              {field?.field_type === "select" || field?.field_type === "select_multiple" ? (
                <div className="col-span-7">
                  <Select
                    label="Filter value"
                    name={`[${i}].fields.and[${fIdx}].filter.value`}
                    onChange={(newValue) => {
                      const opt = field.options?.find((o) => o.id === newValue.value);
                      handleChange([newValue, { name: `[${i}].filter.relationalData.label`, value: opt?.value }]);
                    }}
                    options={(field.options || []).map((opt) => ({ label: opt.value, value: opt.id }))}
                    value={(field?.filter?.value || "") as string | number}
                  />
                </div>
              ) : null}
              {relationFiltersList.includes(field?.field_type) ? (
                <div className="col-span-7 grid grid-cols-3">
                  <div className="col-span-1 mt-5 flex items-center justify-center">Includes</div>
                  <div className="col-span-2 mt-5 flex items-center [&>div>*>span>a>span]:max-w-[8rem] ">
                    {field?.filter?.value ? (
                      <div className="w-full">
                        <EntityPreview
                          clearAction={() =>
                            handleChange([
                              { name: `[${i}].fields.and[${fIdx}].filter.value`, value: "" },
                              { name: `[${i}].fields.and[${fIdx}].filter.relationalData`, value: undefined },
                            ])
                          }
                          icon={field.filter.relationalData?.icon}
                          id={field.filter.relationalData?.value}
                          image_id={field.filter.relationalData?.image}
                          size="sm"
                          title={field.filter.relationalData?.label}
                          type={getSearchType(field.field_type) as AvailableEntityType}
                        />
                      </div>
                    ) : (
                      <Search
                        name={`[${i}].fields.and[${fIdx}].filter.value`}
                        onChange={({ name, value, label, image, icon }) =>
                          handleChange([
                            { name, value },
                            {
                              name: `[${i}].fields.and[${fIdx}].filter.relationalData`,
                              value: { value, label, image, icon, character_field_id: field.id },
                            },
                          ])
                        }
                        searchEntity={getSearchType(field.field_type) as SearchableEntities}
                        value={field?.filter?.value as string | undefined}
                      />
                    )}
                  </div>
                </div>
              ) : null}
              <div className="col-span-1">
                <div className="mt-5 h-10 w-10 self-center">
                  <Button
                    hasNoBackground
                    icon={IconEnum.trash}
                    isIconOnly
                    onClick={() => {
                      handleChange({
                        name: `[${i}].fields.and`,
                        value: f.fields.and.filter((filtering_field) => field.id !== filtering_field.id),
                      });
                    }}
                    variant="error"
                  />
                </div>
              </div>
            </Fragment>
          ))}
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
          {f.fields.or.map((field, fIdx) => (
            <Fragment key={field.id}>
              <div className="col-span-12">
                {fIdx !== 0 ? (
                  <div className="mt-1.5 flex w-full justify-center">
                    <div className="w-16">
                      <Badge label="OR" variant="info" />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="col-span-4">
                <Select
                  label="Field"
                  name={`[${i}].fields.or[${fIdx}]`}
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
                <div className="col-span-3">
                  <Select
                    label="Filter type"
                    name={`[${i}].fields.or[${fIdx}].filter.operator`}
                    onChange={handleChange}
                    options={field?.field_type === "number" ? NumberFilters : TextFilters}
                    value={(field?.filter?.operator || "") as string | number}
                  />
                </div>
              ) : null}

              {field?.field_type === "number" || field?.field_type === "text" ? (
                <div className="col-span-4">
                  <Input
                    label="Filter value"
                    name={`[${i}].fields.or[${fIdx}].filter.value`}
                    onChange={handleChange}
                    type={field?.field_type}
                    value={(field?.filter?.value || "") as string | number}
                  />
                </div>
              ) : null}
              {field?.field_type === "select" || field?.field_type === "select_multiple" ? (
                <div className="col-span-7">
                  <Select
                    label="Filter value"
                    name={`[${i}].fields.or[${fIdx}].filter.value`}
                    onChange={(newValue) => {
                      const opt = field.options?.find((o) => o.id === newValue.value);
                      handleChange([newValue, { name: `[${i}].filter.relationalData.label`, value: opt?.value }]);
                    }}
                    options={(field.options || []).map((opt) => ({ label: opt.value, value: opt.id }))}
                    value={(field?.filter?.value || "") as string | number}
                  />
                </div>
              ) : null}
              {relationFiltersList.includes(field?.field_type) ? (
                <div className="col-span-7 grid grid-cols-3">
                  <div className="col-span-1 mt-5 flex items-center justify-center">Includes</div>
                  <div className="col-span-2 mt-5 flex items-center [&>div>*>span>a>span]:max-w-[8rem] ">
                    {field?.filter?.value ? (
                      <div className="w-full">
                        <EntityPreview
                          clearAction={() =>
                            handleChange([
                              { name: `[${i}].fields.or[${fIdx}].filter.value`, value: "" },
                              { name: `[${i}].fields.or[${fIdx}].filter.relationalData`, value: undefined },
                            ])
                          }
                          icon={field.filter.relationalData?.icon}
                          id={field.filter.relationalData?.value}
                          image_id={field.filter.relationalData?.image}
                          size="sm"
                          title={field.filter.relationalData?.label}
                          type={getSearchType(field.field_type) as AvailableEntityType}
                        />
                      </div>
                    ) : (
                      <Search
                        name={`[${i}].fields.or[${fIdx}].filter.value`}
                        onChange={({ name, value, label, image, icon }) =>
                          handleChange([
                            { name, value },
                            {
                              name: `[${i}].fields.or[${fIdx}].filter.relationalData`,
                              value: { value, label, image, icon, character_field_id: field.id },
                            },
                          ])
                        }
                        searchEntity={getSearchType(field.field_type) as SearchableEntities}
                        value={field?.filter?.value as string | undefined}
                      />
                    )}
                  </div>
                </div>
              ) : null}
              <div className="col-span-1">
                <div className="mt-5 h-10 w-10 self-center">
                  <Button
                    hasNoBackground
                    icon={IconEnum.trash}
                    isIconOnly
                    onClick={() => {
                      handleChange({
                        name: `[${i}].fields.or`,
                        value: f.fields.or.filter((filtering_field) => field.id !== filtering_field.id),
                      });
                    }}
                    variant="error"
                  />
                </div>
              </div>
            </Fragment>
          ))}
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

  const { handleChange } = useHandleChange({ data: filters, setData: setFilters });

  return (
    <DrawerLayout>
      <ul className="flex flex-col gap-y-2">
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
        <CharacterFiltersList
          existingTemplates={existingTemplates}
          filters={filters}
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
