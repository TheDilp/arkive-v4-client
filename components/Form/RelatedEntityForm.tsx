import { tv } from "tailwind-variants";

import { BlueprintFieldType, CharacterFieldType, FieldDataType, FieldTypes, HandleChangePropsType } from "../../types";
import { GatewayConfigOptionType } from "../../types/EntityTypes/gatewayTypes";
import { getEntityFromFieldType, getFieldValueFromType } from "../../utils";
import {
  TemplateBooleanField,
  TemplateDateField,
  TemplateDiceRollField,
  TemplateInputField,
  TemplateRandomTableField,
  TemplateRelatedField,
  TemplateSelectField,
  TemplateTextareaField,
} from "../Complex";
import { Alert } from "../Misc";

const classes = tv({
  base: "select-none",
  variants: {
    isDrawer: {
      true: "flex flex-col gap-y-2",
      false: "grid grid-cols-1 gap-x-2 gap-y-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-4",
    },
    isGateway: {},
    type: {},
  },
});

const relatedEntityTypes: FieldTypes[] = [
  "characters_single",
  "characters_multiple",
  "blueprints_single",
  "blueprints_multiple",
  "documents_single",
  "documents_multiple",
  "locations_single",
  "locations_multiple",
  "events_single",
  "events_multiple",
  "images_single",
  "images_multiple",
];

export function RelatedEntityForm({
  fields = [],
  fields_data = [],
  handleChange,
  hasCreateOrEdit,
  isDrawer = false,
  isEditEnabled = false,
  options,
  type,
}: {
  fields: CharacterFieldType[] | BlueprintFieldType[] | undefined;
  fields_data: FieldDataType[];
  handleChange: (props: HandleChangePropsType) => void;
  hasCreateOrEdit: boolean;
  isDrawer?: boolean;
  isEditEnabled?: boolean;
  options?: GatewayConfigOptionType[] | null;
  type: "characters" | "blueprint_instances";
}) {
  if (!fields.length) return null;
  return (
    <div className="flex flex-col first:mt-0">
      <div className={classes({ isDrawer, type, isGateway: IS_GATEWAY })}>
        {fields.map((template_field) => {
          const templateValueKey = getFieldValueFromType(template_field.field_type);
          if (!templateValueKey) return null;
          const presetOptions =
            options && templateValueKey
              ? options?.filter(
                  (opt) =>
                    opt.entity_type === templateValueKey &&
                    ((opt.entity_type === "blueprint_instances" && opt.parent_id === template_field.blueprint_id) ||
                      opt.entity_type !== "blueprint_instances")
                )
              : null;

          const templateValueIndex = fields_data.findIndex((f) => f.id === template_field.id);

          const baseName = `${type === "characters" ? "character_fields" : "blueprint_fields"}[${templateValueIndex < 0 ? fields_data.length : templateValueIndex}]`;
          if (
            (fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value === null ||
              fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value === undefined) &&
            !isEditEnabled &&
            !IS_PUBLIC
          )
            return (
              <div className="flex flex-col">
                <span className="block w-full truncate font-lato text-sm font-medium">{template_field.title}</span>
                <Alert label="There is no content." />
              </div>
            );
          if (
            (fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value === null ||
              fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.value === undefined) &&
            !isEditEnabled &&
            IS_PUBLIC
          )
            return null;
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
                isDisabled={!hasCreateOrEdit}
                isDrawer={isDrawer}
                isReadOnly={!isEditEnabled}
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
                isDisabled={!hasCreateOrEdit}
                isDrawer={isDrawer}
                isReadOnly={!isEditEnabled}
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
                isDisabled={!hasCreateOrEdit}
                isDrawer={isDrawer}
                isReadOnly={!isEditEnabled}
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
                isDisabled={!hasCreateOrEdit}
                isDrawer={isDrawer}
                isReadOnly={!isEditEnabled}
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
                isDisabled={!hasCreateOrEdit}
                isDrawer={isDrawer}
                isReadOnly={!isEditEnabled}
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
                isDisabled={!hasCreateOrEdit}
                isDrawer={isDrawer}
                isReadOnly={!isEditEnabled}
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
                isDisabled={!hasCreateOrEdit}
                isDrawer={isDrawer}
                isReadOnly={!isEditEnabled}
                name={baseName}
                random_table={template_field.random_table}
                title={template_field.title}
              />
            );
          }

          if (relatedEntityTypes.includes(template_field.field_type)) {
            const entity = getEntityFromFieldType(template_field.field_type);
            if (entity)
              return (
                <TemplateRelatedField
                  key={template_field.id}
                  currentValue={fields_data[`${templateValueIndex < 0 ? fields_data.length : templateValueIndex}`]?.[entity]}
                  fieldType={template_field.field_type}
                  handleChange={handleChange}
                  id={template_field.id}
                  isDisabled={!hasCreateOrEdit}
                  isDrawer={isDrawer}
                  isReadOnly={!isEditEnabled}
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
