import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateSubEntity,
  useGetEntity,
  useGetSubEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateSubEntity,
} from "../../../hooks";
import {
  BlueprintFieldType,
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  BlueprintType,
  DrawerAtomType,
  EventStateType,
  HandleChangePropsType,
  TabType,
  UserHasPermissionsType,
} from "../../../types";
import {
  checkIfDayCorrect,
  checkIfMonthCorrect,
  checkIfYearCorrect,
  createOrEditPermission,
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
  TemplateDateField,
  TemplateDiceRollField,
  TemplateDocumentField,
  TemplateEventField,
  TemplateImageField,
  TemplateInputField,
  TemplateLocationsField,
  TemplateRandomTableField,
  TemplateSelectField,
  TemplateTextareaField,
} from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { EntityPreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, TagInput } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

type Props = {
  data: { id?: string; parent_id?: string; title?: string };
  exceptions: DrawerAtomType["exceptions"];
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
        parent_id: null,
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
  isDisabled,
  handleChange,
}: {
  blueprint_fields?: BlueprintFieldType[] | undefined;
  blueprint_fields_data: BlueprintInstanceBlueprintFieldType[];
  isDisabled?: boolean;
  handleChange: (props: HandleChangePropsType) => void;
}) {
  const permissions = useHasPermissions(
    [
      "read_characters",
      "read_blueprints",
      "read_blueprint_instances",
      "read_documents",
      "read_map_pins",
      "read_calendars",
      "read_assets",
      "read_random_tables",
    ],
    undefined
  );
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
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as string | number | null
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                title={template_field.title}
              />
            );

          if (template_field.field_type === "select" || template_field.field_type === "select_multiple")
            return (
              <TemplateSelectField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as string | string[] | null
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                options={template_field.options || []}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "textarea")
            return (
              <TemplateTextareaField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as any
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "boolean")
            return (
              <TemplateBooleanField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as boolean | null
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "dice_roll")
            return (
              <TemplateDiceRollField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.value as string
                }
                formula={template_field.formula as string}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "date" && permissions?.read_calendars) {
            return (
              <TemplateDateField
                calendar={template_field.calendar}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.calendar
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "random_table" && permissions?.read_random_tables)
            return (
              <TemplateRandomTableField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.random_table
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                random_table={template_field.random_table}
                title={template_field.title}
              />
            );

          if (
            (template_field.field_type === "characters_single" || template_field.field_type === "characters_multiple") &&
            permissions?.read_characters
          ) {
            return (
              <TemplateCharacterField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.characters
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                presetOptions={[]}
                title={template_field.title}
              />
            );
          }
          if (
            (template_field.field_type === "blueprints_single" || template_field.field_type === "blueprints_multiple") &&
            permissions?.read_blueprint_instances &&
            permissions?.read_blueprints
          ) {
            return (
              <TemplateBlueprintField
                blueprint_id={template_field.blueprint_id}
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.blueprint_instances
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                presetOptions={[]}
                title={template_field.title}
              />
            );
          }
          if (
            (template_field.field_type === "documents_single" || template_field.field_type === "documents_multiple") &&
            permissions?.read_documents
          ) {
            return (
              <TemplateDocumentField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.documents
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                presetOptions={[]}
                title={template_field.title}
              />
            );
          }
          if (
            (template_field.field_type === "locations_single" || template_field.field_type === "locations_multiple") &&
            permissions?.read_map_pins
          ) {
            return (
              <TemplateLocationsField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.map_pins
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                presetOptions={[]}
                title={template_field.title}
              />
            );
          }
          if (
            (template_field.field_type === "events_single" || template_field.field_type === "events_multiple") &&
            permissions?.read_events
          ) {
            return (
              <TemplateEventField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.events
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                presetOptions={[]}
                title={template_field.title}
              />
            );
          }
          if (
            (template_field.field_type === "images_single" || template_field.field_type === "images_multiple") &&
            permissions?.read_assets
          ) {
            return (
              <TemplateImageField
                currentValue={
                  blueprint_fields_data[`${blueprintValueIndex < 0 ? blueprint_fields_data.length : blueprintValueIndex}`]
                    ?.images
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible
                isDisabled={isDisabled}
                key={template_field.id}
                name={baseName}
                presetOptions={[]}
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

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    { id: "2", label: "Fields", icon: IconEnum.additional_fields },
  ];
  if (permissions?.read_tags) {
    tabs.push({ id: "3", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "4", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function BlueprintInstanceDrawer({ data, exceptions }: Props) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const resetDrawerAtom = useToggledResetAtom();
  const [instance, setInstance] = useState<Omit<BlueprintInstanceType, "deleted_at"> | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const { handleChange, resetChanges, changedData } = useHandleChange({ data: instance, setData: setInstance });
  const {
    data: blueprint,
    isInitialLoading: isInitialLoadingBlueprint,
    isFetching: isFetchingBlueprint,
  } = useGetEntity<BlueprintType>(
    data?.title || exceptions?.globalCreate ? instance?.parent_id : data?.parent_id ?? item_id,
    "blueprints",
    {
      data: {
        id: data?.title ? instance?.parent_id : data?.parent_id ?? item_id,
      },
      fields: ["id", "title", "title_name", "icon"],
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
    },
    {
      enabled: data?.title ? !!instance?.parent_id : true,
      queryKeyConcat: ["instance_drawer"],
    }
  );

  const { mutateAsync: create, isLoading: isCreating } = useCreateSubEntity("blueprint_instances", project_id);
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateSubEntity("blueprint_instances", project_id, item_id);

  const {
    data: existingInstance,
    isInitialLoading,
    isFetching: isFetchingInstance,
  } = useGetSubEntity<BlueprintInstanceType>(
    data?.id,
    "blueprint_instances",
    {
      data: { id: data?.id },
      fields: ["id", "title", "parent_id", "is_public", "owner_id"],
      relations: {
        blueprint_fields: true,
        tags: true,
      },
      permissions: true,
    },
    { enabled: !!data?.id && !!blueprint?.data, queryKeyConcat: ["drawer"] }
  );
  useLayoutEffect(() => {
    if (existingInstance?.data && !!data?.id) {
      setInstance(existingInstance?.data);
    } else if (!data?.id && !instance) {
      setInstance({
        id: "",
        title: data?.title || "",
        owner_id: "",
        blueprint_fields: [],
        permissions: [],
        parent_id: data?.title || exceptions?.globalCreate ? "" : (item_id as string),
        tags: [],
      });
    }
  }, [existingInstance?.data]);

  useEffect(() => {
    // Only reset fields if this is for adding from a document (data?.title)
    // when the selected blueprint (parent_id) changes
    if (instance && instance?.blueprint_fields?.length && instance?.parent_id && data?.title)
      setInstance({ ...instance, blueprint_fields: [] });
  }, [instance?.parent_id]);

  const permissions = useHasPermissions(
    ["create_blueprint_instances", "update_blueprint_instances", "read_tags"],
    existingInstance?.data?.owner_id
  );
  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_blueprint_instances,
    permissions?.update_blueprint_instances,
    permissions?.is_owner,
    data?.id
  );
  const tabs = getTabs(permissions, data?.id);

  if (isInitialLoading || (!data?.title && isInitialLoadingBlueprint) || !instance) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <div className="flex max-h-[90%] flex-col overflow-y-auto">
          {(data?.title || exceptions?.globalCreate) && !instance?.parent_id ? (
            <Search
              label="Blueprint (required)"
              name="parent_id"
              onChange={handleChange}
              searchEntity="blueprints"
              value={instance?.parent_id}
            />
          ) : null}
          {(data?.title || exceptions?.globalCreate) && instance?.parent_id && blueprint?.data ? (
            <EntityPreview
              clearAction={() => handleChange({ name: "parent_id", value: null })}
              icon={blueprint?.data?.icon}
              id={instance?.parent_id}
              title={blueprint?.data?.title}
              type="blueprints"
            />
          ) : null}

          {instance?.parent_id ? (
            <>
              <div>
                <Input
                  isDisabled={!canCreateOrEdit}
                  label={`${blueprint?.data?.title_name} (required)`}
                  name="title"
                  onChange={handleChange}
                  value={instance?.title}
                  variant={instance?.title ? "primary" : "error"}
                />
              </div>
              <div className="mt-2 flex w-full items-center justify-between">
                <span>Is public:</span>
                <Checkbox
                  isDisabled={!canCreateOrEdit}
                  name="is_public"
                  onChange={handleChange}
                  value={instance?.is_public ?? false}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      {tabs[selectedTab].id === "2" ? (
        <>
          {!!blueprint?.data && !blueprint?.data?.blueprint_fields?.length && instance?.parent_id ? (
            <Alert label="This blueprint has no fields." variant="info" />
          ) : null}
          <FieldTemplateRows
            blueprint_fields={blueprint?.data?.blueprint_fields || []}
            blueprint_fields_data={instance.blueprint_fields}
            handleChange={handleChange}
            isDisabled={!canCreateOrEdit}
          />
        </>
      ) : null}
      {tabs[selectedTab].id === "3" ? (
        <div>
          <TagInput handleChange={handleChange} isDisabled={!canCreateOrEdit} tags={instance?.tags || []} />
        </div>
      ) : null}

      {tabs[selectedTab].id === "4" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={instance?.owner_id}
          permissions={instance?.permissions || []}
          related_id={instance?.id || null}
          selectablePermissions={["read_blueprint_instances", "update_blueprint_instances", "delete_blueprint_instances"]}
        />
      ) : null}

      <div className="mt-auto w-full">
        <Button
          icon={instance?.id ? IconEnum.save : IconEnum.add}
          isDisabled={
            !instance?.title ||
            !instance?.parent_id ||
            isSaveDisabled(instance?.blueprint_fields || [], blueprint?.data) ||
            isCreating ||
            isUpdating ||
            isFetchingInstance ||
            isFetchingBlueprint ||
            !canCreateOrEdit
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
                    parent_id: data?.title ? instance?.parent_id : data?.parent_id ?? item_id,
                  },
                  relations: {
                    tags: instance?.tags?.map((t) => ({ id: t.id })),
                    blueprint_fields: getDifferenceForBlueprintInstance(existingInstance?.data, instance),
                  },
                  permissions: instance?.permissions,
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
                    parent_id: data?.title ? instance?.parent_id : data?.parent_id ?? item_id,
                  },
                  relations: {
                    tags: instance?.tags?.map((t) => ({ id: t.id })),
                    blueprint_fields: instance?.blueprint_fields,
                  },
                  permissions: instance?.permissions,
                };
                const parsedData = InsertBlueprintInstanceSchema.parse(dataToParse);

                await create(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) {
                      resetDrawerAtom();

                      setInstance({
                        id: "",
                        title: data?.title || "",
                        owner_id: "",
                        blueprint_fields: [],
                        permissions: [],
                        parent_id: data?.title || exceptions?.globalCreate ? "" : (item_id as string),
                        tags: [],
                      });
                    }
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
