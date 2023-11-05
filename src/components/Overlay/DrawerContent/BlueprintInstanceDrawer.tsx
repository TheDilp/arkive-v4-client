import { useQuery } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { flattenArray, RemirrorJSON } from "remirror";

import {
  useCreateSubEntity,
  useGetEntities,
  useGetEntity,
  useGetImages,
  useGetSubEntity,
  useHandleChange,
  useUpdateSubEntity,
} from "../../../hooks";
import {
  BlueprintFieldType,
  BlueprintInstanceType,
  BlueprintType,
  CharacterType,
  HandleChangePropsType,
  MapPinType,
  NotificationType,
} from "../../../types";
import {
  baseURLS,
  DiceNoSim,
  DiceRollParser,
  drawerAtom,
  FetchFunction,
  getCharacterFullName,
  getSearchFieldTypeLabel,
  getSearchFieldTypeLinkType,
  getSearchFieldTypeSearchType,
  IconEnum,
  SearchFieldTypes,
  sortEntities,
  useNotifications,
} from "../../../utils";
import { InsertBlueprintInstanceSchema, UpdateBlueprintInstanceSchema } from "../../../validation";
import { Editor } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, Select, Title } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

type Props = {
  data: { id?: string };
};
type CurrentValueType = string | string[] | number | boolean | Record<string, any> | Record<string, any>[] | undefined;

function RandomTableInput({
  id,
  title,
  currentValue,
  subOptionValue,
  index,
  random_table_id,
  isRolling,
  random_table,
  handleChange,
}: Omit<BlueprintFieldType, "sort"> & {
  index: number;
  currentValue: CurrentValueType;
  isRolling: boolean;
  subOptionValue?: string;
  handleChange: (params: HandleChangePropsType) => void;
}) {
  const name = `blueprint_fields[${index}]`;

  const { refetch, isFetching } = useQuery({
    // @ts-ignore
    queryKey: ["allEntities", "random_table_options", "random_roll", random_table_id],

    queryFn: async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/random_table_options/random/${random_table_id}`,
        body: JSON.stringify({
          data: {
            count: 1,
          },
        }),
        method: "POST",
      }),

    enabled: false,
  });
  const selectedOptionSuboptions = random_table?.random_table_options?.find(
    (opt) => opt?.id === currentValue,
  )?.random_table_suboptions;
  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex flex-nowrap items-center gap-x-2">
        <Select
          hasSearch
          isClearable
          isDisabled={isRolling}
          label={title}
          name={`${name}`}
          onChange={({ value }) => {
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value: { value } },
            ]);
          }}
          options={(random_table?.random_table_options || []).map((opt) => ({ label: opt.title, value: opt.id }))}
          value={currentValue as string}
        />
        <div className="flex self-end pb-1.5">
          <Button
            hasNoBackground
            icon={IconEnum.d20}
            iconSize={24}
            isIconOnly
            isLoading={isFetching}
            onClick={async () => {
              refetch().then((res) => {
                if (res?.data?.data?.[0]?.title) {
                  handleChange({
                    name,
                    value: { id, value: { value: res?.data?.data?.[0]?.id, subOptionValue: res?.data?.data?.[0]?.subitem_id } },
                  });
                }
              });
            }}
            tooltip={`Roll ${random_table?.title ? `(${random_table?.title})` : ""}`}
          />
        </div>
      </div>
      <div className="flex flex-col pl-4 pr-[1.55rem]">
        {selectedOptionSuboptions?.length ? (
          <div className="flex flex-nowrap gap-x-2">
            <Select
              isClearable
              name={name}
              onChange={({ value }) =>
                handleChange({ name, value: { id, value: { value: currentValue, subOptionValue: value } } })
              }
              options={selectedOptionSuboptions.map((subopt) => ({ label: subopt.title, value: subopt.id }))}
              value={subOptionValue}
            />
            <div className="flex self-end pb-1.5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DateInput({
  id,
  calendar,
  currentValue,
  title,
  index,
  handleChange,
}: Pick<BlueprintFieldType, "id" | "calendar" | "calendar_id" | "title"> & {
  handleChange: (params: HandleChangePropsType) => void;
  currentValue: CurrentValueType;
  index: number;
}) {
  const name = `blueprint_fields[${index}]`;

  const months = calendar?.months.map((m) => ({ label: m.title, value: m.id })) || [];
  const maxDays = calendar?.months.find((m) => m.id === (currentValue as Record<string, any>)?.month)?.days || 0;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-3">
        <Title isDrawerTitle label={title} />
      </div>
      <div className="col-span-1">
        <Input
          isDisabled={!maxDays}
          label="Day"
          max={maxDays}
          min={1}
          name={name}
          onChange={({ value }) => {
            handleChange({
              name,
              value: { id, value: { value: { ...(currentValue as Record<string, any>), day: value } } },
            });
          }}
          placeholder={!maxDays ? "Select month" : ""}
          type="number"
          value={(currentValue as Record<string, any>)?.day}
        />
      </div>
      <div className="col-span-1">
        <Select
          label="Month"
          name={name}
          onChange={({ value }) => {
            handleChange({
              name,
              value: { id, value: { value: { ...(currentValue as Record<string, any>), month: value } } },
            });
          }}
          options={months}
          value={(currentValue as Record<string, any>)?.month || undefined}
        />
      </div>
      <div className="col-span-1">
        <Input
          label="Year"
          name={name}
          onChange={({ value }) => {
            handleChange({
              name,
              value: { id, value: { value: { ...(currentValue as Record<string, any>), year: value } } },
            });
          }}
          type="number"
          value={(currentValue as Record<string, any>)?.year || undefined}
        />
      </div>
    </div>
  );
}

function BlueprintFieldInputs({
  id,
  title,
  field_type: fieldType,
  options,
  calendar,
  value: currentValue,
  index,
  formula,
  random_table_id,
  random_table,
  isRolling,
  subOptionValue,
  handleChange,
  createNotification,
}: BlueprintFieldType & {
  index: number;
  value: CurrentValueType;
  subOptionValue?: string;
  handleChange: (params: { name: string; value: any } | { name: string; value: any }[]) => void;
  createNotification: (notification: Omit<NotificationType, "id">) => void;
  isRolling: boolean;
}) {
  const { project_id } = useParams();
  const name = `blueprint_fields[${index}]`;
  const { data: characters } = useGetEntities<CharacterType>(
    {
      data: { project_id },
      filters: {
        and: [
          {
            operator: Array.isArray(currentValue) ? "in" : "eq",
            value: currentValue as string | string[],
            field: "id",
          },
        ],
      },
    },
    "characters",
    {
      enabled: (fieldType === "characters_single" || fieldType === "characters_multiple") && !!currentValue,
    },
  );
  const { data: locations } = useGetEntities<MapPinType>(
    {
      data: { project_id },
      filters: {
        and: [
          {
            operator: Array.isArray(currentValue) ? "in" : "eq",
            value: currentValue as string | string[],
            field: "id",
          },
          {
            operator: "is",
            value: null,
            field: "character_id",
          },
        ],
      },
    },
    "map_pins",
    {
      enabled:
        (fieldType === "locations_single" && !Array.isArray(currentValue) && !!currentValue) ||
        (fieldType === "locations_multiple" && Array.isArray(currentValue) && currentValue?.length > 0),
    },
  );
  const { data: images } = useGetImages(
    project_id as string,
    "images",
    {
      filters: {
        and: [
          {
            operator: Array.isArray(currentValue) ? "in" : "eq",
            value: currentValue as string | string[],
            field: "id",
          },
        ],
      },
    },
    { enabled: (fieldType === "images_single" || fieldType === "images_multiple") && !!currentValue },
  );
  const { data: blueprint_instances } = useGetEntities<BlueprintInstanceType>(
    {
      data: {},
      fields: ["id", "title"],
      filters: {
        and: [
          {
            operator: Array.isArray(currentValue) ? "in" : "eq",
            value: currentValue as string | string[],
            field: "id",
          },
        ],
      },
    },
    "blueprint_instances",
    {
      enabled: (fieldType === "blueprints_single" || fieldType === "blueprints_multiple") && !!currentValue,
    },
  );
  if (fieldType === "text" || fieldType === "number") {
    return (
      <Input
        label={title}
        name={name}
        onChange={({ value }) =>
          handleChange([
            { name: `${name}.id`, value: id },
            { name: `${name}.value`, value: { value } },
          ])
        }
        type={fieldType}
        value={currentValue as string}
      />
    );
  }
  if (fieldType === "select" || fieldType === "select_multiple") {
    return (
      <Select
        isClearable
        isMultiple={fieldType === "select_multiple"}
        label={title}
        name={name}
        onChange={({ value }) =>
          handleChange([
            { name: `${name}.id`, value: id },
            { name: `${name}.value`, value: { value } },
          ])
        }
        options={options?.map((opt) => ({ label: opt.value, value: opt.id })) || []}
        value={currentValue as string | string[]}
      />
    );
  }
  if (fieldType === "textarea") {
    return (
      <div className="flex max-h-[30rem] min-h-fit flex-col">
        <span className="text-sm text-zinc-300">{title}</span>
        <Editor
          initialContent={currentValue as RemirrorJSON}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value: { value } },
            ])
          }
        />
        {/* <Textarea
            label={title}
          name={name}
            onChange={({ value }) => {
              handleChange({ name, value: { id, value } });
            }}
            value={currentValue as string}
          /> */}
      </div>
    );
  }
  if (fieldType === "dice_roll") {
    return (
      <div className="flex flex-nowrap items-center gap-x-2">
        <Input
          isDisabled={isRolling}
          isLoading={isRolling}
          label={title}
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value: { value } },
            ])
          }
          value={currentValue as string}
        />
        <div className="flex self-end pb-1.5">
          <Button
            hasNoBackground
            icon={IconEnum.d20}
            iconSize={24}
            isDisabled={isRolling}
            isLoading={isRolling}
            onClick={() => {
              try {
                const parsedNotation = DiceRollParser.parseNotation(formula);
                DiceNoSim.roll(parsedNotation)
                  .then((r: any) => {
                    const rollData = DiceRollParser.parseFinalResults(r);
                    if (rollData?.valid) {
                      handleChange({ name, value: { id, value: { value: rollData.value } } });
                    }
                  })
                  .catch(() => {
                    createNotification({
                      timer: 2,
                      title: "The dice roll notation is not valid.",
                      icon: IconEnum.warning,
                      variant: "error",
                      position: "top",
                    });
                  });
              } catch (error) {
                createNotification({
                  timer: 2,
                  title: "The dice roll notation is not valid.",
                  icon: IconEnum.warning,
                  variant: "error",
                  position: "top",
                });
              }
            }}
            tooltip={`Roll (${formula})`}
          />
        </div>
      </div>
    );
  }
  if (fieldType === "random_table") {
    return (
      <RandomTableInput
        currentValue={currentValue}
        field_type={fieldType}
        handleChange={handleChange}
        id={id}
        index={index}
        isRolling={isRolling}
        random_table={random_table}
        random_table_id={random_table_id}
        subOptionValue={subOptionValue}
        title={title}
      />
    );
  }
  if (fieldType === "date") {
    return (
      <DateInput
        calendar={calendar}
        currentValue={currentValue}
        handleChange={handleChange}
        id={id}
        index={index}
        title={title}
      />
    );
  }
  if (fieldType === "boolean") {
    return (
      <div className="flex flex-nowrap justify-between">
        <span>{title}</span>
        <Checkbox
          name={name}
          onChange={({ value }) =>
            handleChange([
              { name: `${name}.id`, value: id },
              { name: `${name}.value`, value: { value } },
            ])
          }
          value={currentValue as boolean}
        />
      </div>
    );
  }
  if (fieldType === "characters_single" || fieldType === "characters_multiple") {
    return (
      <Collapsible label={title}>
        <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
          <Search
            name={name}
            onChange={({ value }) => {
              if (fieldType === "characters_single") {
                handleChange([
                  { name: `${name}.id`, value: id },
                  { name: `${name}.value`, value: { value } },
                ]);
              } else {
                handleChange({
                  name,
                  value: {
                    id,
                    value: {
                      value: Array.isArray(currentValue) ? [...currentValue, value] : [value],
                    },
                  },
                });
              }
            }}
            placeholder="Press enter to search."
            searchEntity="characters"
          />
          {characters?.data?.map((char) => (
            <EntityPreview
              key={char?.id}
              clearAction={() =>
                handleChange({
                  name,
                  value: {
                    id,
                    value: {
                      value:
                        fieldType === "characters_multiple" ? (currentValue as string[]).filter((c) => c !== char?.id) : null,
                    },
                  },
                })
              }
              id={char?.id}
              image_id={char?.portrait_id}
              title={getCharacterFullName(char?.first_name, undefined, char?.last_name)}
              type="characters"
            />
          ))}
        </div>
      </Collapsible>
    );
  }
  if (fieldType === "locations_single" || fieldType === "locations_multiple") {
    return (
      <div className="flex flex-col gap-y-2">
        {(fieldType === "locations_single" && !currentValue) || fieldType === "locations_multiple" ? (
          <Search
            label={title}
            name={name}
            onChange={({ value }) => {
              if (fieldType === "locations_single") {
                handleChange([
                  { name: `${name}.id`, value: id },
                  { name: `${name}.value`, value: { value } },
                ]);
              } else {
                handleChange({
                  name,
                  value: {
                    id,
                    value: Array.isArray(currentValue) ? [...currentValue, value] : [value],
                  },
                });
              }
            }}
            placeholder="Press enter to search."
            searchEntity="map_pins"
          />
        ) : null}

        {locations?.data?.map((location) => (
          <EntityPreview
            key={location?.id}
            clearAction={() =>
              handleChange({
                name,
                value: {
                  id,
                  value:
                    fieldType === "locations_multiple" ? (currentValue as string[]).filter((c) => c !== location?.id) : null,
                },
              })
            }
            icon={location?.icon}
            id={location?.id}
            image_id={location?.image_id}
            title={location?.title || ""}
            type="map_pins"
          />
        ))}
      </div>
    );
  }
  if (fieldType === "blueprints_single" || fieldType === "blueprints_multiple") {
    return (
      <Collapsible label={title}>
        <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
          <Search
            name={name}
            onChange={({ value }) => {
              if (fieldType === "blueprints_single") {
                handleChange([
                  { name: `${name}.id`, value: id },
                  { name: `${name}.value`, value: { value } },
                ]);
              } else {
                handleChange({
                  name,
                  value: {
                    id,
                    value: {
                      value: Array.isArray(currentValue) ? [...currentValue, value] : [value],
                    },
                  },
                });
              }
            }}
            placeholder="Press enter to search."
            searchEntity="blueprint_instances"
          />
          {blueprint_instances?.data?.map((blueprint_instance) => (
            <EntityPreview
              key={blueprint_instance?.id}
              clearAction={() =>
                handleChange({
                  name,
                  value: {
                    id,
                    value: {
                      value:
                        fieldType === "blueprints_multiple"
                          ? (currentValue as string[]).filter((c) => c !== blueprint_instance?.id)
                          : null,
                    },
                  },
                })
              }
              id={blueprint_instance?.id}
              title={blueprint_instance.title}
              type="blueprint_instances"
            />
          ))}
        </div>
      </Collapsible>
    );
  }
  if (SearchFieldTypes.includes(fieldType)) {
    return (
      <div className="flex flex-col">
        {currentValue && fieldType === "images_single" ? null : (
          <Search
            label={`${title} (${getSearchFieldTypeLabel(fieldType)})`}
            name={name}
            onChange={({ value }) => {
              if (fieldType.includes("single")) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  { name: `${name}.value`, value: { value } },
                ]);
              } else {
                handleChange({
                  name,
                  value: {
                    id,
                    value: Array.isArray(currentValue) ? [...currentValue, value] : [value],
                  },
                });
              }
            }}
            searchEntity={getSearchFieldTypeSearchType(fieldType) || "images"}
          />
        )}
        {images?.data?.length
          ? images.data.map((img) => (
              <EntityPreview
                key={img.id}
                clearAction={() => {
                  if (fieldType.includes("single"))
                    handleChange([
                      { name: `${name}.id`, value: id },
                      { name: `${name}.value`, value: { value: null } },
                    ]);
                  else
                    handleChange([
                      { name: `${name}.id`, value: id },
                      { name: `${name}.value`, value: { value: (currentValue as string[]).filter((c) => c !== img.id) } },
                    ]);
                }}
                id={img.id}
                image_id={img.id}
                label={img.title}
                link={
                  fieldType === "images_single"
                    ? ""
                    : `/projects/${project_id}/${getSearchFieldTypeLinkType(fieldType)}/${img.id}`
                }
                title={img?.title}
                type={getSearchFieldTypeSearchType(fieldType) || "documents"}
              />
            ))
          : null}
      </div>
    );
  }
  return null;
}

function FieldTemplateRow({
  blueprint_fields = [],
  blueprint_fields_data,
  createNotification,
  handleChange,
}: { blueprint_fields_data: BlueprintInstanceType["blueprint_fields"] } & {
  title: string;
  project_id: string;
  blueprint_fields?: BlueprintFieldType[] | undefined;
  createNotification: (notification: Omit<NotificationType, "id">) => void;
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
        {blueprint_fields.sort(sortEntities).map((template_field) => {
          const fieldValueIndex = (blueprint_fields_data || [])?.findIndex((field) => template_field?.id === field?.id);
          if (fieldValueIndex !== undefined)
            return (
              <div key={template_field.id} className="w-full">
                <BlueprintFieldInputs
                  {...template_field}
                  createNotification={createNotification}
                  formula={template_field?.formula}
                  handleChange={handleChange}
                  index={fieldValueIndex === -1 ? blueprint_fields_data?.length ?? 0 : fieldValueIndex}
                  isRolling={false}
                  subOptionValue={blueprint_fields_data?.[fieldValueIndex]?.value?.subOptionValue}
                  value={blueprint_fields_data?.[fieldValueIndex]?.value?.value || ""}
                />
              </div>
            );

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
    { enabled: !!data?.id, queryKeyConcat: ["drawer"] },
  );

  useLayoutEffect(() => {
    if (existingInstance?.data && !!data?.id) {
      setInstance(existingInstance?.data);
    } else if (!data?.id && !instance) {
      // @ts-ignore
      setInstance({
        id: "",
        title: "",
        parent_id: item_id as string,
        blueprint_fields: [],
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
        {blueprint?.data && !isFetchingInstance && !isFetchingBlueprint ? (
          <FieldTemplateRow
            key={blueprint?.data?.id}
            blueprint_fields={blueprint?.data.blueprint_fields}
            blueprint_fields_data={instance?.blueprint_fields}
            createNotification={createNotification}
            handleChange={handleChange}
            project_id={project_id as string}
            title={blueprint?.data?.title}
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
                    ...instance,
                    parent_id: item_id,
                  },
                  relations: {
                    tags: instance?.tags?.map((t) => ({ id: t.id })),
                    blueprint_fields: instance?.blueprint_fields
                      ? flattenArray(Object.values(instance?.blueprint_fields || {})) || []
                      : undefined,
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
                    ...instance,
                    parent_id: item_id,
                  },
                  relations: {
                    tags: instance?.tags?.map((t) => ({ id: t.id })),
                    blueprint_fields: instance?.blueprint_fields
                      ? flattenArray(Object.values(instance?.blueprint_fields || {})) || []
                      : undefined,
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
