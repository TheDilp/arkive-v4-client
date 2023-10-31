import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import groupBy from "lodash.groupby";
import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { flattenArray, uniqueBy } from "remirror";

import { useCreateEntity, useGetEntities, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import {
  CharacterFieldTemplateType,
  CharacterFieldType,
  CharacterFieldValueType,
  CharacterRelatedType,
  CharacterRelationshipType,
  CharacterType,
  HandleChangePropsType,
  NotificationType,
  TagType,
} from "../../../types";
import {
  baseURLS,
  drawerAtom,
  FetchFunction,
  getCharacterFullName,
  IconEnum,
  sortEntities,
  useNotifications,
} from "../../../utils";
import { DiceNoSim, DiceRollParser, getRollValue } from "../../../utils/ui/diceRollerUtils";
import { InsertCharacterSchema, InsertCharacterType, UpdateCharacterSchema, UpdateCharacterType } from "../../../validation";
import { DrawerLayout, Dropdown, EntityPreview, ImagePreview, Skeleton } from "../..";
import { Editor } from "../../Complex/Editor/Editor";
import { ImageSelect } from "../../Complex/ImageSelect";
import { Button, Checkbox, Input, Search, Select, TagInput, Title } from "../../Form";
import { Collapsible } from "../../Layout/Collapsible";
import { Tabs } from "../../Layout/Tabs";
import { Alert } from "../../Misc";

type CharacterStateCharacterFieldsType = Record<string, CharacterFieldValueType[]>;

type CharacterStateType = Partial<Omit<CharacterType, "character_fields">> & {
  character_fields?: CharacterStateCharacterFieldsType;
};

type CurrentValueType = string | string[] | number | boolean | Record<string, any> | Record<string, any>[] | undefined;

function isSaveDisabled(character: CharacterStateType) {
  if (!character?.first_name) return true;
  if (character?.related_from?.length) {
    if (character?.related_from?.some((rel) => !rel?.relation_type_id)) return true;
  }
  if (character?.related_to?.length) {
    if (character?.related_to?.some((rel) => !rel?.relation_type_id)) return true;
  }

  return false;
}

function RandomTableInput({
  id,
  title,
  random_table_options,
  currentValue,
  subOptionValue,
  index,
  random_table_id,
  isRolling,
  random_table,
  template_id,
  handleChange,
}: Omit<CharacterFieldType, "sort"> & {
  index: number;
  currentValue: CurrentValueType;
  isRolling: boolean;
  template_id: string;
  subOptionValue?: string;
  handleChange: ({ name, value }: { name: string; value: any }) => void;
}) {
  const name = `character_fields[${template_id}][${index}]`;

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
  const selectedOptionSuboptions = random_table_options?.find((opt) => opt?.id === currentValue)?.suboptions;
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
            handleChange({ name, value: { id, value: { value } } });
          }}
          options={(random_table_options || []).map((opt) => ({ label: opt.title, value: opt.id }))}
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
  template_id,
  currentValue,
  title,
  index,
  handleChange,
}: Pick<CharacterFieldType, "id" | "calendar" | "calendar_id" | "title"> & {
  handleChange: ({ name, value }: { name: string; value: any }) => void;
  currentValue: CurrentValueType;
  template_id: string;
  index: number;
}) {
  const name = `character_fields[${template_id}][${index}]`;

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

function CharacterFieldInputs({
  id,
  title,
  field_type: fieldType,
  options,
  random_table_options,
  calendar,
  value: currentValue,
  index,
  formula,
  random_table_id,
  random_table,
  isRolling,
  subOptionValue,
  template_id,
  handleChange,
  createNotification,
}: CharacterFieldType & {
  index: number;
  value: CurrentValueType;
  subOptionValue?: string;
  template_id: string;
  handleChange: ({ name, value }: { name: string; value: any }) => void;
  createNotification: (notification: Omit<NotificationType, "id">) => void;
  isRolling: boolean;
}) {
  const name = `character_fields[${template_id}][${index}]`;
  if (fieldType === "text" || fieldType === "number") {
    return (
      <Input
        label={title}
        name={name}
        onChange={({ value }) => handleChange({ name, value: { id, value: { value } } })}
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
        onChange={({ value }) => handleChange({ name, value: { id, value: { value } } })}
        options={options?.map((opt) => ({ label: opt.value, value: opt.id })) || []}
        value={currentValue as string | string[]}
      />
    );
  }
  if (fieldType === "textarea") {
    return (
      <div className="flex max-h-[30rem] min-h-[10rem] flex-col">
        <Editor
          initialContent={currentValue as string}
          name={name}
          onChange={({ value }) => handleChange({ name, value: { id, value: { value: JSON.stringify(value) } } })}
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
          onChange={({ value }) => handleChange({ name, value: { id, value: { value } } })}
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
        random_table_options={random_table_options}
        subOptionValue={subOptionValue}
        template_id={template_id}
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
        template_id={template_id}
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
          onChange={({ value }) => handleChange({ name, value: { id, value: { value } } })}
          value={currentValue as boolean}
        />
      </div>
    );
  }
  // if (SearchFieldTypes.includes(fieldType)) {
  //   return (
  //     <div className="flex flex-col">
  //       {!currentValue && fieldType?.includes("single") ? (
  //         <Search
  //           label={`${title} (${getSearchFieldTypeLabel(fieldType)})`}
  //           name={name}
  //           onChange={({ label, value }) => handleChange({ name, value: { id, value: { value: { value, title: label } } } })}
  //           searchEntity={getSearchFieldTypeSearchType(fieldType) || "images"}
  //         />
  //       ) : null}
  //       {currentValue && fieldType?.includes("single") ? (
  //         <EntityPreview
  //           clearAction={() => handleChange({ name, value: { id, value: {} } })}
  //           id={(currentValue as Record<string, any>)?.value}
  //           image_id={fieldType === "images_single" ? (currentValue as Record<string, any>)?.value : ""}
  //           label={title}
  //           link={
  //             fieldType === "images_single"
  //               ? ""
  //               : `/projects/${project_id}/${getSearchFieldTypeLinkType(fieldType)}/${
  //                   (currentValue as Record<string, any>)?.value
  //                 }`
  //           }
  //           title={(currentValue as Record<string, any>)?.title}
  //           type={getSearchFieldTypeSearchType(fieldType) || "documents"}
  //         />
  //       ) : null}
  //       {fieldType?.includes("multiple") ? (
  //         <Search
  //           label={`${title} (${getSearchFieldTypeLabel(fieldType)})`}
  //           name={name}
  //           onChange={({ label, value }) => {
  //             handleChange({
  //               name,
  //               value: {
  //                 id,
  //                 value: ((currentValue as Record<string, any>[]) || []).concat([{ value: { value, title: label } }]),
  //               },
  //             });
  //           }}
  //           searchEntity={getSearchFieldTypeSearchType(fieldType) || "images"}
  //         />
  //       ) : null}
  //       {Array.isArray(currentValue) && fieldType?.includes("multiple") ? (
  //         <EntityPreview
  //           clearAction={() => handleChange({ name, value: { id, value: {} } })}
  //           id={(currentValue as Record<string, any>)?.value}
  //           image_id={fieldType === "images_single" ? (currentValue as Record<string, any>)?.value : ""}
  //           label={title}
  //           link={
  //             fieldType === "images_single"
  //               ? ""
  //               : `/projects/${project_id}/${getSearchFieldTypeLinkType(fieldType)}/${
  //                   (currentValue as Record<string, any>)?.value
  //                 }`
  //           }
  //           title={(currentValue as Record<string, any>)?.title}
  //           type={getSearchFieldTypeSearchType(fieldType) || "documents"}
  //         />
  //       ) : null}
  //     </div>
  //   );
  // }
  return null;
}

function RelationshipRow({
  character_name,
  portrait_id,
  id,
  handleRemove,
}: {
  id: string;
  character_name: string;
  portrait_id?: string;
  handleRemove: (char_id: string) => void;
}) {
  return (
    <li className="flex items-center gap-x-2">
      <div className="flex-1">
        <EntityPreview id={id} image_id={portrait_id} title={character_name} type="characters" />
      </div>
      <div className="w-8">
        <Button
          hasNoBackground
          icon={IconEnum.trash}
          iconSize={24}
          onClick={() => {
            handleRemove(id);
          }}
          size="lg"
          variant="error"
        />
      </div>
    </li>
  );
}

function FieldTemplateRow({
  template_id,
  title,
  character_fields = [],
  character_fields_data = {},
  createNotification,
  handleChange,
}: {
  template_id: string;
  title: string;
  project_id: string;
  character_fields?: CharacterFieldType[] | undefined;
  character_fields_data?: CharacterStateCharacterFieldsType;
  createNotification: (notification: Omit<NotificationType, "id">) => void;
  handleChange: (props: HandleChangePropsType) => void;
}) {
  const [isRolling, setIsRolling] = useState(false);
  const randomTableFields = character_fields
    .filter((field) => field.field_type === "random_table")
    .map((field) => ({ field_id: field.id, table_id: field.random_table_id }));

  const diceRollFields = character_fields
    .filter((field) => field.field_type === "dice_roll")
    .map((field) => ({ field_id: field.id, formula: field?.formula }));

  const { data, refetch } = useQuery<{ data: { random_table: { id: string; subitem_id?: string; title: string }[] }[] }>(
    ["randomTables", "many", template_id],
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/random_table_options/random/many`,
        body: JSON.stringify({ data: randomTableFields.map((t) => ({ table_id: t.table_id, count: 1 })) }),
        method: "POST",
      }),
    { enabled: false },
  );
  const hasRandomTableOrRoll = character_fields.some(
    (field) => field.field_type === "dice_roll" || field.field_type === "random_table",
  );

  const collapsibleActions = hasRandomTableOrRoll
    ? [
        {
          icon: IconEnum.d20,
          onClick: async (e: Event) => {
            e.preventDefault();
            const fieldsToChange: { name: string; value: { id: string; value: { value: number } } }[] = [];
            for (let i = 0; i < diceRollFields.length; i += 1) {
              const formula = diceRollFields[i]?.formula;

              if (formula) {
                if (!isRolling) setIsRolling(true);
                const idx = character_fields.findIndex((field) => field.id === diceRollFields[i].field_id);
                if (idx > -1) {
                  // eslint-disable-next-line no-await-in-loop
                  const value = await getRollValue(formula, true);
                  fieldsToChange.push({
                    name: `character_fields[${template_id}][${idx}]`,
                    value: { id: diceRollFields[i].field_id, value: { value } },
                  });
                }
              }
            }
            handleChange(fieldsToChange);
            setIsRolling(false);
            if (randomTableFields.length) await refetch();
          },
          tooltip: "Autoroll all random table and dice roll fields in this template.",
        },
      ]
    : [];

  useEffect(() => {
    if (data?.data?.length) {
      const fieldsToChange = [];
      for (let i = 0; i < data?.data?.length; i += 1) {
        const idx = character_fields.findIndex((field) => field.id === randomTableFields[i].field_id);
        if (idx > -1) {
          fieldsToChange.push({
            name: `character_fields[${template_id}][${idx}]`,
            value: {
              id: character_fields[idx].id,
              value: {
                value: data?.data[i].random_table?.[0]?.id,
                subOptionValue: data?.data[i].random_table?.[0]?.subitem_id,
              },
            },
          });
        }
      }
      handleChange(fieldsToChange);
    }
  }, [data?.data]);
  return (
    <li className="mt-4 flex flex-col gap-y-2 first:mt-0">
      <Collapsible actions={collapsibleActions} initialOpen={false} label={title}>
        <div className="flex select-none flex-col gap-y-2 pt-2">
          {character_fields.sort(sortEntities).map((template_field) => {
            const fieldValueIndex = (character_fields_data[template_id] || [])?.findIndex(
              (field) => template_field?.id === field?.id,
            );
            if (fieldValueIndex !== undefined)
              return (
                <CharacterFieldInputs
                  key={template_field.id}
                  {...template_field}
                  createNotification={createNotification}
                  formula={template_field?.formula}
                  handleChange={handleChange}
                  index={fieldValueIndex === -1 ? character_fields_data[template_id]?.length ?? 0 : fieldValueIndex}
                  isRolling={isRolling}
                  subOptionValue={character_fields_data[template_id]?.[fieldValueIndex]?.value?.subOptionValue}
                  template_id={template_id}
                  value={character_fields_data[template_id]?.[fieldValueIndex]?.value?.value || ""}
                />
              );
            return null;
          })}
        </div>
      </Collapsible>
    </li>
  );
}

// #region tabs
export function AdditionalFieldsTab({
  templates,
  createNotification,
  handleChange,
  character_fields,
  isLoading,
  tags,
}: {
  templates:
    | {
        data: CharacterFieldTemplateType[];
      }
    | undefined;
  character_fields?: CharacterStateCharacterFieldsType | undefined;
  createNotification: (notification: Omit<NotificationType, "id">) => void;
  handleChange: (props: HandleChangePropsType) => void;
  isLoading: boolean;
  tags?: TagType[];
}) {
  const { project_id } = useParams();
  if (isLoading) return <Skeleton type="drawer_form" />;
  return (
    <ul className="flex flex-col overflow-y-auto">
      {!tags?.length ? <Alert label="Please select tags first." variant="info" /> : null}
      {!templates?.data?.length && tags?.length ? <Alert label="There are no templates available." variant="info" /> : null}
      {templates?.data?.length && tags?.length
        ? templates?.data
            ?.sort(sortEntities)
            ?.map((t) => (
              <FieldTemplateRow
                key={t?.id}
                character_fields={t.character_fields}
                character_fields_data={character_fields}
                createNotification={createNotification}
                handleChange={handleChange}
                project_id={project_id as string}
                template_id={t?.id}
                title={t?.title}
              />
            ))
        : null}
    </ul>
  );
}
// #endregion tabs

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Realationships", icon: IconEnum.family_tree },
  { id: "3", label: "Tags", icon: IconEnum.tags },
  { id: "4", label: "Additional fields", icon: IconEnum.additional_fields },
];

export function CharacterDrawer({ data }: { data: { id?: string; preselectedTab?: number } }) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(data?.preselectedTab ?? 0);

  const resetDrawerAtom = useResetAtom(drawerAtom);
  const createNotification = useNotifications();
  const queryClient = useQueryClient();

  const { data: existingCharacter, isFetching } = useGetEntity<CharacterType>(
    data?.id,
    "characters",
    {
      relations: { character_fields: true, relationships: true, portrait: true, tags: true },
      fields: ["id", "first_name", "last_name", "nickname", "age", "portrait_id", "is_favorite"],
    },
    {
      enabled: !!data?.id,
      queryKeyConcat: ["drawer"],
    },
  );

  const [character, setCharacter] = useState<CharacterStateType>({ project_id: project_id as string });
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertCharacterType>("characters");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateCharacterType>(
    "characters",
    project_id as string,
  );
  const { data: templates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id: project_id as string },
      relations: { character_fields: true },
      relationFilters: { tags: character?.tags?.map((t) => t.id) || [] },
    },
    "character_fields_templates",
    {
      enabled: selectedTab === 3 && !!character?.tags?.length,
      staleTime: 5 * 60 * 1000,
    },
  );
  const { data: relationshipTypes, isFetching: isFetchingRelationshipTypes } = useGetEntities<CharacterRelationshipType>(
    {
      data: { project_id: project_id as string },
    },
    "character_relationship_types",
    {
      enabled: selectedTab === 1,
      staleTime: 5 * 60 * 1000,
    },
  );

  const [relationGroupIds, setRelationGroupIds] = useState<string[]>([]);

  const relationGroups = (relationshipTypes?.data || [])?.filter((rt) => relationGroupIds.includes(rt.id));

  const { handleChange, changedData } = useHandleChange({ data: character, setData: setCharacter });

  useLayoutEffect(() => {
    if (existingCharacter?.data) {
      queryClient.removeQueries({ predicate: (query) => query.queryKey.includes("character_fields_templates") });
      // @ts-ignore
      const fieldsByTemplateId = groupBy(existingCharacter?.data?.character_fields || [], "template_id") as Record<
        string,
        CharacterFieldValueType[]
      >;
      setCharacter({ ...existingCharacter?.data, character_fields: fieldsByTemplateId });
      setRelationGroupIds(
        (existingCharacter?.data?.related_from || [])
          .concat(existingCharacter?.data?.related_to || [])
          .concat(existingCharacter?.data?.related_other || [])
          .map((relation: CharacterRelatedType) => relation.relation_type_id),
      );
    }
  }, [existingCharacter?.data]);

  if (isFetching) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center">
            <div className="w-full lg:w-1/2">
              <Input label="First name" name="first_name" onChange={handleChange} value={character?.first_name || ""} />
            </div>
            <div className="w-full lg:w-1/2">
              <Input label="Nickname (optional)" name="nickname" onChange={handleChange} value={character?.nickname || ""} />
            </div>
            <div className="w-full lg:w-1/2">
              <Input label="Last name (optional)" name="last_name" onChange={handleChange} value={character?.last_name || ""} />
            </div>
          </div>
          <div>
            <span className="text-sm text-zinc-300">Character image (optional)</span>
            {!character?.portrait?.id ? (
              <ImageSelect
                isIconOnly
                name="portrait"
                onChange={({ name, label, value }) => {
                  handleChange({ name, value: { id: value, title: label } });
                }}
                type="images"
                value={character?.portrait?.id ?? ""}
              />
            ) : (
              <ImagePreview
                clearAction={() => handleChange({ name: "portrait", value: null })}
                id={character?.portrait?.id}
                title={character?.portrait?.title}
              />
            )}
          </div>
          <Input label="Age (optional)" name="age" onChange={handleChange} type="number" value={character?.age || ""} />

          <ul className="flex w-full flex-col gap-y-2">
            <li className="flex items-center justify-between">
              <span>Favorite:</span>
              <Checkbox name="is_favorite" onChange={handleChange} value={character?.is_favorite ?? false} />
            </li>
          </ul>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-nowrap items-center justify-between">
            <span>Insert new type:</span>
            <Dropdown
              allowedPlacements={["left", "left-start", "left-end"]}
              items={(relationshipTypes?.data || [])
                .filter((rt) => !relationGroupIds.includes(rt.id))
                .map((rt) => ({
                  id: rt.id,
                  label: rt.title,
                  isDisabled: relationGroupIds.includes(rt.id),
                  onClick: () => setRelationGroupIds((prev) => prev.concat(rt.id)),
                }))}>
              <div className="h-8 w-8">
                <Button icon={IconEnum.add} onClick={undefined} variant="info" />
              </div>
            </Dropdown>
          </div>
          {isFetchingRelationshipTypes ? (
            <Skeleton type="drawer_form" />
          ) : (
            <>
              {relationGroups.map((rg) => {
                const isOther = !rg.ascendant_title && !rg.descendant_title;
                const otherCharactersToShow = isOther
                  ? (character?.related_other || [])?.filter((char) => char.relation_type_id === rg.id)
                  : [];
                return (
                  <Collapsible key={rg.id} initialOpen={false} label={rg.title}>
                    {isOther ? (
                      <div className="flex flex-col gap-y-1">
                        <Search
                          name="related_other"
                          onChange={({ first_name, last_name, value, image }) => {
                            if (character.id === value) {
                              createNotification({
                                title: "Cannot add a character to themselves.",
                                variant: "warning",
                                timer: 2,
                                icon: IconEnum.info_circle,
                              });
                              return;
                            }
                            if (character?.related_other?.some((ro) => ro.id === value && ro.relation_type_id === rg.id)) {
                              createNotification({
                                title: "Cannot add a character to the same group twice.",
                                variant: "warning",
                                timer: 2,
                                icon: IconEnum.info_circle,
                              });
                              return;
                            }
                            if (value && first_name) {
                              handleChange({
                                name: "related_other",
                                value: (character?.related_other || []).concat({
                                  id: value,
                                  first_name,
                                  last_name,
                                  portrait_id: image,
                                  relation_type_id: rg.id,
                                  character_relationship_id: "",
                                }),
                              });
                            }
                          }}
                          placeholder="Press enter to search characters"
                          searchEntity="characters"
                        />

                        <div className="flex flex-col gap-y-2">
                          {otherCharactersToShow?.map((char) => (
                            <RelationshipRow
                              key={char.id}
                              character_name={getCharacterFullName(char.first_name, "", char?.last_name)}
                              handleRemove={(character_b_id: string) =>
                                handleChange({
                                  name: "related_other",
                                  value: (character?.related_other || []).filter((r) => r.id !== character_b_id),
                                })
                              }
                              {...char}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-y-2">
                        <Search
                          label="Ascendants"
                          name="related_to"
                          onChange={({ value, image, first_name, last_name }) => {
                            if (character.id === value) {
                              createNotification({
                                title: "Cannot add a character to themselves.",
                                variant: "warning",
                                timer: 2,
                                icon: IconEnum.info_circle,
                              });
                              return;
                            }
                            if (character?.related_to?.some((ro) => ro.id === value && ro.relation_type_id === rg.id)) {
                              createNotification({
                                title: "Cannot add a character to the same group twice.",
                                variant: "warning",
                                timer: 2,
                                icon: IconEnum.info_circle,
                              });
                              return;
                            }

                            if (value && first_name) {
                              handleChange({
                                name: "related_to",
                                value: (character?.related_to || []).concat({
                                  id: value,
                                  first_name,
                                  last_name,
                                  portrait_id: image,
                                  relation_type_id: rg.id,
                                  character_relationship_id: "",
                                }),
                              });
                            }
                          }}
                          placeholder="Press enter to search characters"
                          searchEntity="characters"
                        />
                        <div className="flex flex-col gap-y-2">
                          {character?.related_to
                            ?.filter((char) => char.relation_type_id === rg.id)
                            .map((char) => (
                              <RelationshipRow
                                key={char.id}
                                character_name={getCharacterFullName(char.first_name, "", char?.last_name)}
                                handleRemove={(character_b_id: string) =>
                                  handleChange({
                                    name: "related_to",
                                    value: (character?.related_to || []).filter((r) => r.id !== character_b_id),
                                  })
                                }
                                {...char}
                              />
                            ))}
                        </div>
                        <Search
                          label="Descendants"
                          name="related_from"
                          onChange={({ first_name, last_name, value, image }) => {
                            if (character.id === value) {
                              createNotification({
                                title: "Cannot add a character to themselves.",
                                variant: "warning",
                                timer: 2,
                                icon: IconEnum.info_circle,
                              });
                              return;
                            }
                            if (character?.related_from?.some((ro) => ro.id === value && ro.relation_type_id === rg.id)) {
                              createNotification({
                                title: "Cannot add a character to the same group twice.",
                                variant: "warning",
                                timer: 2,
                                icon: IconEnum.info_circle,
                              });
                              return;
                            }
                            if (value && first_name) {
                              handleChange({
                                name: "related_from",
                                value: (character?.related_from || []).concat({
                                  id: value,
                                  first_name,
                                  last_name,
                                  portrait_id: image,
                                  relation_type_id: rg.id,
                                  character_relationship_id: "",
                                }),
                              });
                            }
                          }}
                          placeholder="Press enter to search characters"
                          searchEntity="characters"
                        />
                        <div className="flex flex-col gap-y-2">
                          {character?.related_from
                            ?.filter((char) => char.relation_type_id === rg.id)
                            .map((char) => (
                              <RelationshipRow
                                key={char.id}
                                character_name={getCharacterFullName(char.first_name, "", char?.last_name)}
                                handleRemove={(character_b_id: string) =>
                                  handleChange({
                                    name: "related_from",
                                    value: (character?.related_from || []).filter((r) => r.id !== character_b_id),
                                  })
                                }
                                {...char}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </Collapsible>
                );
              })}
            </>
          )}
        </div>
      ) : null}
      {selectedTab === 2 ? (
        <div className="flex flex-col gap-y-2">
          <TagInput handleChange={handleChange} tags={character?.tags || []} />
        </div>
      ) : null}
      {selectedTab === 3 ? (
        <AdditionalFieldsTab
          character_fields={character?.character_fields}
          createNotification={createNotification}
          handleChange={handleChange}
          isLoading={isFetching || isFetchingTemplates}
          tags={character?.tags}
          templates={{ data: uniqueBy(templates?.data || [], "id") }}
        />
      ) : null}

      <Button
        icon={character?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(character) || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={character?.id ? "Update" : "Create"}
        onClick={async () => {
          if (changedData) {
            if (character?.id) {
              const characterToUpdate = { ...(changedData || {}), id: character.id };
              const { related_to, related_from, related_other, tags, character_fields, ...rest } = characterToUpdate;
              const parsedData = UpdateCharacterSchema.parse({
                data: { ...rest, portrait_id: rest?.portrait?.id },
                relations: {
                  character_fields: character_fields
                    ? flattenArray(Object.values(character?.character_fields || {})) || []
                    : undefined,
                  related_from,
                  related_to,
                  related_other,
                  tags,
                },
              });

              await update(parsedData, {
                onSuccess: (res) => {
                  if (res?.ok) resetDrawerAtom();
                },
              });
            } else {
              const dataToParse = {
                data: { ...character, portrait_id: character?.portrait?.id },
                relations: {
                  character_fields: flattenArray(Object.values(character?.character_fields || {})) || [],
                  related_to: character?.related_to,
                  tags: character?.tags,
                },
              };
              const parsedData = InsertCharacterSchema.parse(dataToParse);
              await create(parsedData, {
                onSuccess: (res) => {
                  if (res?.ok) resetDrawerAtom();
                },
              });
            }
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
    </DrawerLayout>
  );
}
