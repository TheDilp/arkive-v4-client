import {
  BlueprintFieldType,
  BlueprintInstanceBlueprintFieldType,
  CharacterCharacterFieldType,
  CharacterFieldType,
  HandleChangePropsType,
} from "../../types";
import { GatewayConfigOptionType } from "../../types/EntityTypes/gatewayTypes";
import { getFieldValueFromType } from "../../utils";
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
} from "../Complex";

export function RelatedEntityForm({
  fields = [],
  fields_data = [],
  handleChange,
  hasCreateOrEdit,
  isDrawer = true,
  options,
}: {
  fields: CharacterFieldType[] | BlueprintFieldType[] | undefined;
  fields_data: CharacterCharacterFieldType[] | BlueprintInstanceBlueprintFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
  hasCreateOrEdit: boolean;
  isDrawer?: boolean;
  isEditEnabled?: boolean;
  options?: GatewayConfigOptionType[] | null;
}) {
  if (!fields.length) return null;
  return (
    <div className="flex flex-col first:mt-0">
      <div
        className={`${isDrawer ? "flex flex-col gap-y-2 pt-2" : "grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-8"} select-none`}>
        {fields.map((template_field) => {
          const templateValueKey = getFieldValueFromType(template_field.field_type);
          if (!templateValueKey) return null;
          const presetOptions =
            options && templateValueKey
              ? options?.filter((opt) => opt.entity_type === templateValueKey && opt.parent_id === template_field.blueprint_id)
              : null;
          const templateValueIndex = fields_data.findIndex((f) => f.id === template_field.id);

          const baseName = `character_fields[${templateValueIndex < 0 ? fields_data.length : templateValueIndex}]`;
          if (template_field.field_type === "text" || template_field.field_type === "number") {
            return (
              <TemplateInputField
                key={template_field.id}
                currentValue={
                  fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value as
                    | string
                    | number
                    | null
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                title={template_field.title}
              />
            );
          }

          if (template_field.field_type === "select" || template_field.field_type === "select_multiple")
            return (
              <TemplateSelectField
                key={template_field.id}
                currentValue={
                  fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value as
                    | string
                    | string[]
                    | null
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                options={template_field.options || []}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "textarea")
            return (
              <TemplateTextareaField
                key={template_field.id}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value as any}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "boolean")
            return (
              <TemplateBooleanField
                key={template_field.id}
                currentValue={
                  fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value as boolean | null
                }
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "dice_roll")
            return (
              <TemplateDiceRollField
                key={template_field.id}
                currentValue={
                  fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value as string
                }
                formula={template_field.formula as string}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "date") {
            return (
              <TemplateDateField
                key={template_field.id}
                calendar={template_field.calendar}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.calendar}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "random_table") {
            return (
              <TemplateRandomTableField
                key={template_field.id}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.random_table}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                random_table={template_field.random_table}
                title={template_field.title}
              />
            );
          }

          if (template_field.field_type === "characters_single" || template_field.field_type === "characters_multiple") {
            return (
              <TemplateCharacterField
                key={template_field.id}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.characters}
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                presetOptions={presetOptions || []}
                title={template_field.title}
              />
            );
          }

          if (template_field.field_type === "blueprints_single" || template_field.field_type === "blueprints_multiple") {
            return (
              <TemplateBlueprintField
                key={template_field.id}
                blueprint_id={template_field.blueprint_id}
                currentValue={
                  fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.blueprint_instances
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                presetOptions={presetOptions || []}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "documents_single" || template_field.field_type === "documents_multiple") {
            return (
              <TemplateDocumentField
                key={template_field.id}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.documents}
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                presetOptions={presetOptions || []}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "locations_single" || template_field.field_type === "locations_multiple") {
            return (
              <TemplateLocationsField
                key={template_field.id}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.map_pins}
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                presetOptions={presetOptions || []}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "images_single" || template_field.field_type === "images_multiple") {
            return (
              <TemplateImageField
                key={template_field.id}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.images}
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                presetOptions={presetOptions || []}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "events_single" || template_field.field_type === "events_multiple") {
            return (
              <TemplateEventField
                key={template_field.id}
                currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.events}
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isCollapsible={isDrawer}
                isDisabled={!hasCreateOrEdit}
                name={baseName}
                presetOptions={presetOptions || []}
                title={template_field.title}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
