import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetEntity, useGetSubEntity, useHandleChange, useUpdateSubEntity } from "../../../hooks";
import {
  BlueprintFieldType,
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  BlueprintType,
  EventStateType,
  HandleChangePropsType,
} from "../../../types";
import {
  checkIfDayCorrect,
  checkIfMonthCorrect,
  checkIfYearCorrect,
  drawerAtom,
  getDifferenceForBlueprintInstance,
  getFieldValueFromType,
  IconEnum,
  useNotifications,
} from "../../../utils";
import { InsertBlueprintInstanceSchema, UpdateBlueprintInstanceSchema } from "../../../validation";
import {
  TemplateBlueprintField,
  TemplateBooleanField,
  TemplateCharacterField,
  TemplateDiceRollField,
  TemplateDocumentField,
  TemplateEventField,
  TemplateImageField,
  TemplateInputField,
  TemplateSelectField,
  TemplateTextareaField,
} from "../../Complex";
import { TemplateDateField } from "../../Complex/TemplateFields/TemplateDateField";
import { TemplateLocationsField } from "../../Complex/TemplateFields/TemplateLocationsField";
import { TemplateRandomTableField } from "../../Complex/TemplateFields/TemplateRandomTableField";
import { Button, Checkbox, Input, TagInput } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

type Props = {
  data: { id?: string; parent_id?: string };
};

function isSaveDisabled(blueprint_fields: BlueprintInstanceType["blueprint_fields"], blueprint?: BlueprintType) {
  if (!blueprint) return true;
  const dateFields = blueprint_fields.filter((field) => field.field_type === "date");
  if (dateFields.length) {
    return dateFields.some((field) => {
      const calendarData = blueprint.blueprint_fields.find((f) => f.id === field.id)?.calendar;
      if (!calendarData) return true;
      const startMonthIdx = field?.calendar?.start_month_id
        ? calendarData?.months?.findIndex((m) => m.id === field?.calendar?.start_month_id) || 0
        : 0;
      const endMonthIdx = field?.calendar?.end_month_id
        ? calendarData?.months?.findIndex((m) => m.id === field?.calendar?.end_month_id)
        : null;
      // Not an actual event entity, just used
      // to calculate whether the date is correct
      const event: EventStateType = {
        start_day: field?.calendar?.start_day,
        start_month: startMonthIdx,
        start_year: field?.calendar?.start_year,
        end_day: field?.calendar?.end_day,
        end_month: endMonthIdx,
        end_year: field?.calendar?.end_year,
      };

      const isYearCorrect = checkIfYearCorrect(field?.calendar?.start_year, field?.calendar?.end_year);
      const isMonthCorrect = checkIfMonthCorrect(event, isYearCorrect);
      const isDayCorrect = checkIfDayCorrect(event, isYearCorrect, isMonthCorrect);
      return !(isYearCorrect && isMonthCorrect && isDayCorrect);
    });
  }
  return false;
}

function FieldTemplateRows({
  blueprint_fields = [],
  blueprint_fields_data = [],
  handleChange,
}: {
  blueprint_fields?: BlueprintFieldType[] | undefined;
  blueprint_fields_data: BlueprintInstanceBlueprintFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
}) {
  return (
    <li className="flex flex-col first:mt-0">
      <div className="flex select-none flex-col gap-y-2 pt-2">
        {blueprint_fields.map((template_field) => {
          const blueprintValueKey = getFieldValueFromType(template_field.field_type);
          if (!blueprintValueKey) return null;
          const blueprintValueIndex = blueprint_fields_data.findIndex((f) => f.id === template_field.id);
          const baseName = `blueprint_fields[${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}]`;
          if (template_field.field_type === "text" || template_field.field_type === "number")
            return (
              <TemplateInputField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as string | number | null
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "select" || template_field.field_type === "select_multiple")
            return (
              <TemplateSelectField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as string | string[] | null
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                options={template_field.options || []}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "textarea")
            return (
              <TemplateTextareaField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as any
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "boolean")
            return (
              <TemplateBooleanField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as boolean | null
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "dice_roll")
            return (
              <TemplateDiceRollField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as string
                }
                formula={template_field.formula as string}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "date") {
            return (
              <TemplateDateField
                key={template_field.id}
                calendar={template_field.calendar}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.calendar
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "random_table")
            return (
              <TemplateRandomTableField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.random_table
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                random_table={template_field.random_table}
                title={template_field.title}
              />
            );

          if (template_field.field_type === "characters_single" || template_field.field_type === "characters_multiple") {
            return (
              <TemplateCharacterField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.characters
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "blueprints_single" || template_field.field_type === "blueprints_multiple") {
            return (
              <TemplateBlueprintField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.blueprint_instances
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "documents_single" || template_field.field_type === "documents_multiple") {
            return (
              <TemplateDocumentField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.documents
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "locations_single" || template_field.field_type === "locations_multiple") {
            return (
              <TemplateLocationsField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.map_pins
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "events_single" || template_field.field_type === "events_multiple") {
            return (
              <TemplateEventField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.events
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "images_single" || template_field.field_type === "images_multiple") {
            return (
              <TemplateImageField
                key={template_field.id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.images
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                name={baseName}
                title={template_field.title}
              />
            );
          }

          return null;
        })}
      </div>
    </li>
  );
}

const tabs = [
  { id: "1", label: "Fields", icon: IconEnum.additional_fields },
  { id: "2", label: "Tags", icon: IconEnum.tags },
];

export function BlueprintInstanceDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const [instance, setInstance] = useState<BlueprintInstanceType | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const { handleChange, resetChanges, changedData } = useHandleChange({ data: instance, setData: setInstance });
  const { data: blueprint, isFetching: isFetchingBlueprint } = useGetEntity<BlueprintType>(
    data?.parent_id ?? item_id,
    "blueprints",
    {
      data: {
        id: data?.parent_id ?? item_id,
      },
      fields: ["id", "title", "title_name", "icon"],
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
    },
    {
      queryKeyConcat: ["instance_drawer"],
    },
  );
  const { mutateAsync: create, isLoading: isCreating } = useCreateSubEntity("blueprint_instances", project_id);
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateSubEntity("blueprint_instances", project_id, item_id);

  const { data: existingInstance, isFetching: isFetchingInstance } = useGetSubEntity<BlueprintInstanceType>(
    data?.id,
    "blueprint_instances",
    {
      data: { id: data?.id },
      fields: ["id", "title", "parent_id", "is_public"],
      relations: {
        blueprint_fields: true,
        tags: true,
      },
    },
    { enabled: !!data?.id && !!blueprint?.data, queryKeyConcat: ["drawer"] },
  );
  useLayoutEffect(() => {
    if (existingInstance?.data && !!data?.id) {
      setInstance(existingInstance?.data);
    } else if (!data?.id && !instance) {
      setInstance({
        id: "",
        title: "",
        blueprint_fields: [],
        parent_id: item_id as string,
        tags: [],
      });
    }
  }, [existingInstance?.data]);

  if (isFetchingInstance || isFetchingBlueprint || !instance) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <ul className="flex max-h-[90%] flex-col overflow-y-auto">
          {!blueprint?.data?.blueprint_fields?.length ? <Alert label="This blueprint has no fields." variant="info" /> : null}
          <div>
            <Input
              label={`${blueprint?.data?.title_name} (required)`}
              name="title"
              onChange={handleChange}
              value={instance?.title}
            />
          </div>

          <div className="mt-2 flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={instance?.is_public ?? false} />
          </div>
          {blueprint?.data?.blueprint_fields?.length ? (
            <FieldTemplateRows
              blueprint_fields={blueprint.data.blueprint_fields}
              blueprint_fields_data={instance.blueprint_fields}
              handleChange={handleChange}
            />
          ) : null}
        </ul>
      ) : null}
      {selectedTab === 1 ? (
        <div>
          <TagInput handleChange={handleChange} isMultiple tags={instance?.tags || []} />
        </div>
      ) : null}
      <div className="mt-auto w-full">
        <Button
          icon={instance?.id ? IconEnum.save : IconEnum.add}
          isDisabled={
            !instance?.title || isSaveDisabled(instance?.blueprint_fields || [], blueprint?.data) || isCreating || isUpdating
          }
          isLoading={isCreating || isUpdating}
          label={instance?.id ? "Update" : "Create"}
          onClick={async () => {
            if (changedData) {
              if (instance?.id && existingInstance?.data) {
                const dataToParse = {
                  data: {
                    id: instance.id,
                    title: instance.title,
                    is_public: instance?.is_public,
                    parent_id: data?.parent_id ?? item_id,
                  },
                  relations: {
                    tags: instance?.tags?.map((t) => ({ id: t.id })),
                    blueprint_fields: getDifferenceForBlueprintInstance(existingInstance?.data, instance),
                  },
                };

                const parsedData = UpdateBlueprintInstanceSchema.parse(dataToParse);
                await update(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                });
              } else {
                const dataToParse = {
                  data: {
                    title: instance.title,
                    is_public: instance?.is_public,
                    parent_id: data?.parent_id ?? item_id,
                  },
                  relations: {
                    tags: instance?.tags?.map((t) => ({ id: t.id })),
                    blueprint_fields: instance?.blueprint_fields,
                  },
                };
                const parsedData = InsertBlueprintInstanceSchema.parse(dataToParse);

                await create(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                });
              }
              resetChanges();
            } else {
              createNotification({
                variant: "info",
                icon: IconEnum.info_circle,
                title: "No data was changed.",
                timer: 3,
              });
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
