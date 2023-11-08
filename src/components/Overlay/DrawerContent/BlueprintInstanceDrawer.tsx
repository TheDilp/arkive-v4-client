import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetEntity, useGetSubEntity, useHandleChange, useUpdateSubEntity } from "../../../hooks";
import {
  BlueprintFieldType,
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  BlueprintType,
  HandleChangePropsType,
} from "../../../types";
import { drawerAtom, getBlueprintFieldValueFromType, IconEnum, useNotifications } from "../../../utils";
import { InsertBlueprintInstanceSchema, UpdateBlueprintInstanceSchema } from "../../../validation";
import {
  TemplateBooleanField,
  TemplateCharacterField,
  TemplateInputField,
  TemplateSelectField,
  TemplateTextareaField,
} from "../../Complex";
import { TemplateRandomTableField } from "../../Complex/Templates/TemplateRandomTableField";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

type Props = {
  data: { id?: string };
};

function FieldTemplateRows({
  blueprint_fields = [],
  blueprint_fields_data = [],
  handleChange,
}: {
  blueprint_fields?: BlueprintFieldType[] | undefined;
  blueprint_fields_data: BlueprintInstanceBlueprintFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
}) {
  // const [isRolling, setIsRolling] = useState(false);
  // const randomTableFields = blueprint_fields
  //   .filter((field) => field.field_type === "random_table")
  //   .map((field) => ({ field_id: field.id, table_id: field.random_table_id }));

  // const diceRollFields = blueprint_fields
  //   .filter((field) => field.field_type === "dice_roll")
  //   .map((field) => ({ field_id: field.id, formula: field?.formula }));

  // const { data, refetch } = useQuery<{ data: { random_table: { id: string; subitem_id?: string; title: string }[] }[] }>(
  //   ["randomTables", "many", template_id],
  //   async () =>
  //     FetchFunction({
  //       url: `${baseURLS.baseServer}/random_table_options/random/many`,
  //       body: JSON.stringify({ data: randomTableFields.map((t) => ({ table_id: t.table_id, count: 1 })) }),
  //       method: "POST",
  //     }),
  //   { enabled: false },
  // );
  // const hasRandomTableOrRoll = blueprint_fields.some(
  //   (field) => field.field_type === "dice_roll" || field.field_type === "random_table",
  // );

  // const collapsibleActions = hasRandomTableOrRoll
  //   ? [
  //       {
  //         icon: IconEnum.d20,
  //         onClick: async (e: Event) => {
  //           e.preventDefault();
  //           const fieldsToChange: { name: string; value: { id: string; value: { value: number } } }[] = [];
  //           for (let i = 0; i < diceRollFields.length; i += 1) {
  //             const formula = diceRollFields[i]?.formula;

  //             if (formula) {
  //               if (!isRolling) setIsRolling(true);
  //               const idx = blueprint_fields.findIndex((field) => field.id === diceRollFields[i].field_id);
  //               if (idx > -1) {
  //                 // eslint-disable-next-line no-await-in-loop
  //                 const value = await getRollValue(formula, true);
  //                 fieldsToChange.push({
  //                   name: `blueprint_fields[${template_id}][${idx}]`,
  //                   value: { id: diceRollFields[i].field_id, value: { value } },
  //                 });
  //               }
  //             }
  //           }
  //           handleChange(fieldsToChange);
  //           setIsRolling(false);
  //           if (randomTableFields.length) await refetch();
  //         },
  //         tooltip: "Autoroll all random table and dice roll fields in this template.",
  //       },
  //     ]
  //   : [];

  // useEffect(() => {
  //   if (data?.data?.length) {
  //     const fieldsToChange = [];
  //     for (let i = 0; i < data?.data?.length; i += 1) {
  //       const idx = blueprint_fields.findIndex((field) => field.id === randomTableFields[i].field_id);
  //       if (idx > -1) {
  //         fieldsToChange.push({
  //           name: `blueprint_fields[${template_id}][${idx}]`,
  //           value: {
  //             id: blueprint_fields[idx].id,
  //             value: {
  //               value: data?.data[i].random_table?.[0]?.id,
  //               subOptionValue: data?.data[i].random_table?.[0]?.subitem_id,
  //             },
  //           },
  //         });
  //       }
  //     }
  //     handleChange(fieldsToChange);
  //   }
  // }, [data?.data]);

  return (
    <li className="flex flex-col first:mt-0">
      <div className="flex select-none flex-col gap-y-2 pt-2">
        {blueprint_fields.map((template_field) => {
          const blueprintValueKey = getBlueprintFieldValueFromType(template_field.field_type);
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
                name={baseName}
                title={template_field.title}
              />
            );
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
                name={baseName}
                title={template_field.title}
              />
            );
          }
          // if (template_field.field_type === "documents_single" || template_field.field_type === "documents_multiple") {
          // }

          return null;
        })}
      </div>
    </li>
  );
}
export function BlueprintInstanceDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const [instance, setInstance] = useState<BlueprintInstanceType | null>(null);
  const { handleChange, resetChanges, changedData } = useHandleChange({ data: instance, setData: setInstance });
  const { data: blueprint, isFetching: isFetchingBlueprint } = useGetEntity<BlueprintType>(
    item_id,
    "blueprints",
    {
      data: {
        id: item_id,
      },
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
        {blueprint?.data?.blueprint_fields?.length ? (
          <FieldTemplateRows
            blueprint_fields={blueprint.data.blueprint_fields}
            blueprint_fields_data={instance.blueprint_fields}
            handleChange={handleChange}
          />
        ) : null}
      </ul>
      <div className="mt-auto w-full">
        <Button
          icon={instance?.id ? IconEnum.save : IconEnum.add}
          isDisabled={!instance?.title || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={instance?.id ? "Update" : "Create"}
          onClick={async () => {
            if (changedData) {
              if (instance?.id) {
                const dataToParse = {
                  data: {
                    id: instance.id,
                    title: instance.title,
                    parent_id: item_id,
                  },
                  relations: {
                    tags: instance?.tags?.map((t) => ({ id: t.id })),
                    blueprint_fields: instance?.blueprint_fields,
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
                    parent_id: item_id,
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
