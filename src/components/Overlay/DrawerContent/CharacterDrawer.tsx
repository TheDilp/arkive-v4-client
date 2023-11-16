import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { uniqueBy } from "remirror";

import { useCreateEntity, useGetEntities, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import {
  CharacterCharacterFieldType,
  CharacterFieldTemplateType,
  CharacterFieldType,
  CharacterRelatedType,
  CharacterRelationshipType,
  CharacterType,
  HandleChangePropsType,
  TagType,
} from "../../../types";
import {
  drawerAtom,
  getBlueprintFieldValueFromType,
  getCharacterFullName,
  getDifferenceForCharacterFields,
  IconEnum,
  useNotifications,
} from "../../../utils";
import { InsertCharacterSchema, InsertCharacterType, UpdateCharacterSchema, UpdateCharacterType } from "../../../validation";
import {
  DrawerLayout,
  Dropdown,
  EntityPreview,
  ImagePreview,
  Skeleton,
  TemplateBlueprintField,
  TemplateBooleanField,
  TemplateDiceRollField,
  TemplateDocumentField,
  TemplateImageField,
  TemplateInputField,
  TemplateLocationsField,
  TemplateRandomTableField,
  TemplateSelectField,
  TemplateTextareaField,
} from "../..";
import { ImageSelect } from "../../Complex/ImageSelect";
import { TemplateDateField } from "../../Complex/TemplateFields/TemplateDateField";
import { Button, Checkbox, Input, Search, TagInput } from "../../Form";
import { Collapsible } from "../../Layout/Collapsible";
import { Tabs } from "../../Layout/Tabs";
import { Alert } from "../../Misc";

function isSaveDisabled(character: CharacterType | null) {
  if (!character) return true;
  if (!character?.first_name) return true;
  if (character?.related_from?.length) {
    if (character?.related_from?.some((rel) => !rel?.relation_type_id)) return true;
  }
  if (character?.related_to?.length) {
    if (character?.related_to?.some((rel) => !rel?.relation_type_id)) return true;
  }

  return false;
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

// function FieldTemplateRow({
//   template_id,
//   title,
//   character_fields = [],
//   character_fields_data = {},
//   createNotification,
//   handleChange,
// }: {
//   template_id: string;
//   title: string;
//   project_id: string;
//   character_fields?: CharacterFieldType[] | undefined;
//   character_fields_data?: CharacterStateCharacterFieldsType;
//   createNotification: (notification: Omit<NotificationType, "id">) => void;
//   handleChange: (props: HandleChangePropsType) => void;
// }) {
//   const [isRolling, setIsRolling] = useState(false);
//   const randomTableFields = character_fields
//     .filter((field) => field.field_type === "random_table")
//     .map((field) => ({ field_id: field.id, table_id: field.random_table_id }));

//   const diceRollFields = character_fields
//     .filter((field) => field.field_type === "dice_roll")
//     .map((field) => ({ field_id: field.id, formula: field?.formula }));

//   const { data, refetch } = useQuery<{ data: { random_table: { id: string; subitem_id?: string; title: string }[] }[] }>(
//     ["randomTables", "many", template_id],
//     async () =>
//       FetchFunction({
//         url: `${baseURLS.baseServer}/random_table_options/random/many`,
//         body: JSON.stringify({ data: randomTableFields.map((t) => ({ table_id: t.table_id, count: 1 })) }),
//         method: "POST",
//       }),
//     { enabled: false },
//   );
//   const hasRandomTableOrRoll = character_fields.some(
//     (field) => field.field_type === "dice_roll" || field.field_type === "random_table",
//   );

//   const collapsibleActions = hasRandomTableOrRoll
//     ? [
//         {
//           icon: IconEnum.d20,
//           onClick: async (e: Event) => {
//             e.preventDefault();
//             const fieldsToChange: { name: string; value: { id: string; value: { value: number } } }[] = [];
//             for (let i = 0; i < diceRollFields.length; i += 1) {
//               const formula = diceRollFields[i]?.formula;

//               if (formula) {
//                 if (!isRolling) setIsRolling(true);
//                 const idx = character_fields.findIndex((field) => field.id === diceRollFields[i].field_id);
//                 if (idx > -1) {
//                   // eslint-disable-next-line no-await-in-loop
//                   const value = await getRollValue(formula, true);
//                   fieldsToChange.push({
//                     name: `character_fields[${template_id}][${idx}]`,
//                     value: { id: diceRollFields[i].field_id, value: { value } },
//                   });
//                 }
//               }
//             }
//             handleChange(fieldsToChange);
//             setIsRolling(false);
//             if (randomTableFields.length) await refetch();
//           },
//           tooltip: "Autoroll all random table and dice roll fields in this template.",
//         },
//       ]
//     : [];

//   useEffect(() => {
//     if (data?.data?.length) {
//       const fieldsToChange = [];
//       for (let i = 0; i < data?.data?.length; i += 1) {
//         const idx = character_fields.findIndex((field) => field.id === randomTableFields[i].field_id);
//         if (idx > -1) {
//           fieldsToChange.push({
//             name: `character_fields[${template_id}][${idx}]`,
//             value: {
//               id: character_fields[idx].id,
//               value: {
//                 value: data?.data[i].random_table?.[0]?.id,
//                 subOptionValue: data?.data[i].random_table?.[0]?.subitem_id,
//               },
//             },
//           });
//         }
//       }
//       handleChange(fieldsToChange);
//     }
//   }, [data?.data]);
//   return (
//     <li className="mt-4 flex flex-col gap-y-2 first:mt-0">
//       <Collapsible actions={collapsibleActions} initialOpen={false} label={title}>
//         <div className="flex select-none flex-col gap-y-2 p-2">
//           {character_fields.sort(sortEntities).map((template_field) => {
//             const fieldValueIndex = (character_fields_data[template_id] || [])?.findIndex(
//               (field) => template_field?.id === field?.id,
//             );
//             if (fieldValueIndex !== undefined)
//               return (
//                 <CharacterFieldInputs
//                   key={template_field.id}
//                   {...template_field}
//                   createNotification={createNotification}
//                   formula={template_field?.formula}
//                   handleChange={handleChange}
//                   index={fieldValueIndex === -1 ? character_fields_data[template_id]?.length ?? 0 : fieldValueIndex}
//                   isRolling={isRolling}
//                   subOptionValue={character_fields_data[template_id]?.[fieldValueIndex]?.value?.subOptionValue}
//                   template_id={template_id}
//                   value={character_fields_data[template_id]?.[fieldValueIndex]?.value?.value || ""}
//                 />
//               );
//             return null;
//           })}
//         </div>
//       </Collapsible>
//     </li>
//   );
// }

function FieldTemplateRows({
  character_fields = [],
  character_fields_data = [],
  handleChange,
}: {
  character_fields?: CharacterFieldType[] | undefined;
  character_fields_data: CharacterCharacterFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
}) {
  return (
    <li className="flex flex-col first:mt-0">
      <div className="flex select-none flex-col gap-y-2 pt-2">
        {character_fields.map((template_field) => {
          const templateValueKey = getBlueprintFieldValueFromType(template_field.field_type);
          if (!templateValueKey) return null;
          const templateValueIndex = character_fields_data.findIndex((f) => f.id === template_field.id);
          const baseName = `character_fields[${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}]`;
          if (template_field.field_type === "text" || template_field.field_type === "number")
            return (
              <TemplateInputField
                key={template_field.id}
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.value as boolean | null
                }
                handleChange={handleChange}
                id={template_field.id}
                name={baseName}
                title={template_field.title}
              />
            );
          if (template_field.field_type === "dice_roll")
            return (
              <TemplateDiceRollField
                key={template_field.id}
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.value as string
                }
                formula={template_field.formula as string}
                handleChange={handleChange}
                id={template_field.id}
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.calendar
                }
                handleChange={handleChange}
                id={template_field.id}
                name={baseName}
                title={template_field.title}
              />
            );
          }
          if (template_field.field_type === "random_table") {
            return (
              <TemplateRandomTableField
                key={template_field.id}
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.random_table
                }
                handleChange={handleChange}
                id={template_field.id}
                name={baseName}
                random_table={template_field.random_table}
                title={template_field.title}
              />
            );
          }

          if (template_field.field_type === "blueprints_single" || template_field.field_type === "blueprints_multiple") {
            return (
              <TemplateBlueprintField
                key={template_field.id}
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.blueprint_instances
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.documents
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.map_pins
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]?.images
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
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

// #region tabs
export function AdditionalFieldsTab({
  templates,
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
  character_fields?: CharacterCharacterFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
  isLoading: boolean;
  tags?: TagType[];
}) {
  if (isLoading) return <Skeleton type="drawer_form" />;
  return (
    <ul className="flex flex-col overflow-y-auto">
      {!tags?.length ? <Alert label="Please select tags first." variant="info" /> : null}
      {!templates?.data?.length && tags?.length ? <Alert label="There are no templates available." variant="info" /> : null}

      {(templates?.data || []).map((t) => {
        const templateFieldIds = t.character_fields.map((f) => f.id);
        const character_fields_data = (character_fields || [])?.filter((field) => templateFieldIds.includes(field.id));
        return (
          <Collapsible key={t.id} label={t.title}>
            <div className="p-2">
              <FieldTemplateRows
                character_fields={t.character_fields}
                character_fields_data={character_fields_data}
                handleChange={handleChange}
              />
            </div>
          </Collapsible>
        );
      })}
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

  const [character, setCharacter] = useState<CharacterType | null>(null);
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
    queryClient.removeQueries({ predicate: (query) => query.queryKey.includes("character_fields_templates") });

    if (existingCharacter?.data && !!data?.id) {
      setCharacter(existingCharacter?.data);
      setRelationGroupIds(
        (existingCharacter?.data?.related_from || [])
          .concat(existingCharacter?.data?.related_to || [])
          .concat(existingCharacter?.data?.related_other || [])
          .map((relation: CharacterRelatedType) => relation.relation_type_id),
      );
    } else if (!data?.id && !character) {
      setCharacter({
        id: "",
        first_name: "",
        project_id: project_id as string,
        character_fields: [],
        tags: [],
      });
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
                            if (character?.id && character.id === value) {
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
                            if (character?.id && character.id === value) {
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
                            if (character?.id && character.id === value) {
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
          character_fields={character?.character_fields || []}
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
            if (character?.id && existingCharacter?.data) {
              const dataToParse = {
                data: character,
                relations: {
                  tags: character?.tags?.map((t) => ({ id: t.id })),
                  character_fields: getDifferenceForCharacterFields(existingCharacter?.data, character),
                },
              };
              const parsedData = UpdateCharacterSchema.parse(dataToParse);
              await update(parsedData, {
                onSuccess: (res) => {
                  if (res?.ok) resetDrawerAtom();
                },
              });
            } else {
              const dataToParse = {
                data: character,
                relations: {
                  tags: character?.tags?.map((t) => ({ id: t.id })),
                  character_fields: character?.character_fields || [],
                },
              };
              const parsedData = InsertCharacterSchema.parse(dataToParse);
              await create(parsedData, {
                onSuccess: (res) => {
                  if (res?.ok) resetDrawerAtom();
                },
              });
            }
          }

          // if (changedData) {
          //   if (character?.id) {
          //     const characterToUpdate = { ...(changedData || {}), id: character.id };
          //     const { related_to, related_from, related_other, tags, character_fields, ...rest } = characterToUpdate;
          //     const parsedData = UpdateCharacterSchema.parse({
          //       data: { ...rest, portrait_id: rest?.portrait?.id },
          //       relations: {
          //         character_fields: character_fields
          //           ? flattenArray(Object.values(character?.character_fields || {})) || []
          //           : undefined,
          //         related_from,
          //         related_to,
          //         related_other,
          //         tags,
          //       },
          //     });

          //     await update(parsedData, {
          //       onSuccess: (res) => {
          //         if (res?.ok) resetDrawerAtom();
          //       },
          //     });
          //   } else {
          //     const dataToParse = {
          //       data: { ...character, portrait_id: character?.portrait?.id },
          //       relations: {
          //         character_fields: flattenArray(Object.values(character?.character_fields || {})) || [],
          //         related_to: character?.related_to,
          //         tags: character?.tags,
          //       },
          //     };
          //     const parsedData = InsertCharacterSchema.parse(dataToParse);
          //     await create(parsedData, {
          //       onSuccess: (res) => {
          //         if (res?.ok) resetDrawerAtom();
          //       },
          //     });
          //   }
          // } else {
          //   createNotification({
          //     variant: "info",
          //     icon: IconEnum.info_circle,
          //     title: "No data was changed.",
          //     timer: 3,
          //   });
          // }
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
