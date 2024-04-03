import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { uniqueBy } from "remirror";

import {
  useCreateEntity,
  useGetEntities,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useUpdateEntity,
} from "../../../hooks";
import {
  CharacterCharacterFieldType,
  CharacterFieldTemplateType,
  CharacterFieldType,
  CharacterRelatedType,
  CharacterRelationshipType,
  CharacterType,
  HandleChangePropsType,
  TabType,
  TagType,
  UserHasPermissionsType,
} from "../../../types";
import {
  createOrEditPermission,
  drawerAtom,
  getDifferenceForCharacterFields,
  getFieldValueFromType,
  IconEnum,
  useNotifications,
} from "../../../utils";
import { InsertCharacterSchema, InsertCharacterType, UpdateCharacterSchema, UpdateCharacterType } from "../../../validation";
import {
  DrawerLayout,
  Dropdown,
  Editor,
  EntityPreview,
  ImagePreview,
  Skeleton,
  TemplateBlueprintField,
  TemplateBooleanField,
  TemplateDiceRollField,
  TemplateDocumentField,
  TemplateEventField,
  TemplateImageField,
  TemplateInputField,
  TemplateLocationsField,
  TemplateRandomTableField,
  TemplateSelectField,
  TemplateTextareaField,
} from "../..";
import { EntityPermission } from "../../Complex/EntityPermission";
import { ImageSelect } from "../../Complex/ImageSelect";
import { TemplateDateField } from "../../Complex/TemplateFields/TemplateDateField";
import { Button, Checkbox, Input, Search, TagInput } from "../../Form";
import { Collapsible } from "../../Layout/Collapsible";
import { Tabs } from "../../Layout/Tabs";
import { Alert } from "../../Misc";

function isSaveDisabled(character: Partial<CharacterType> | null) {
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

function FieldTemplateRows({
  character_fields = [],
  character_fields_data = [],
  handleChange,
  hasCreateOrEdit,
}: {
  character_fields?: CharacterFieldType[] | undefined;
  character_fields_data: CharacterCharacterFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
  hasCreateOrEdit: boolean;
}) {
  return (
    <li className="flex flex-col first:mt-0">
      <div className="flex select-none flex-col gap-y-2 pt-2">
        {character_fields.map((template_field) => {
          const templateValueKey = getFieldValueFromType(template_field.field_type);
          if (!templateValueKey) return null;
          const templateValueIndex = character_fields_data.findIndex((f) => f.id === template_field.id);

          const baseName = `character_fields[${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}]`;
          if (template_field.field_type === "text" || template_field.field_type === "number") {
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.value as string | string[] | null
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
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
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.value as any
                }
                handleChange={handleChange}
                id={template_field.id}
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.value as boolean | null
                }
                handleChange={handleChange}
                id={template_field.id}
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.value as string
                }
                formula={template_field.formula as string}
                handleChange={handleChange}
                id={template_field.id}
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
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.calendar
                }
                handleChange={handleChange}
                id={template_field.id}
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
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.random_table
                }
                handleChange={handleChange}
                id={template_field.id}
                isDisabled={!hasCreateOrEdit}
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
                blueprint_id={template_field.blueprint_id}
                currentValue={
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]
                    ?.blueprint_instances
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isDisabled={!hasCreateOrEdit}
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
                isDisabled={!hasCreateOrEdit}
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
                isDisabled={!hasCreateOrEdit}
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
                isDisabled={!hasCreateOrEdit}
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
                  character_fields_data[`${templateValueIndex < 0 ? character_fields_data.length : templateValueIndex}`]?.events
                }
                fieldType={template_field.field_type}
                handleChange={handleChange}
                id={template_field.id}
                isDisabled={!hasCreateOrEdit}
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
function AdditionalFieldsTab({
  templates,
  handleChange,
  character_fields,
  isLoading,
  tags,
  hasCreateOrEdit,
}: {
  templates:
    | {
        data: CharacterFieldTemplateType[];
      }
    | undefined;
  character_fields?: CharacterCharacterFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
  isLoading: boolean;
  tags?: Omit<TagType, "owner_id" | "permissions">[];
  hasCreateOrEdit: boolean;
}) {
  if (isLoading) return <Skeleton type="drawer_form" />;
  return (
    <ul className="flex flex-col gap-y-2 overflow-y-auto">
      {!tags?.length ? <Alert label="Please select tags first." variant="info" /> : null}
      {!templates?.data?.length && tags?.length ? <Alert label="There are no templates available." variant="info" /> : null}

      {(templates?.data || []).map((t) => {
        return (
          <Collapsible key={t.id} label={t.title}>
            <div className="p-2">
              <FieldTemplateRows
                character_fields={t.character_fields}
                character_fields_data={character_fields || []}
                handleChange={handleChange}
                hasCreateOrEdit={hasCreateOrEdit}
              />
            </div>
          </Collapsible>
        );
      })}
    </ul>
  );
}
// #endregion tabs

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    { id: "2", label: "Biography", icon: IconEnum.biography },
    { id: "3", label: "Relationships", icon: IconEnum.family_tree },
  ];
  if (permissions?.read_tags) {
    tabs.push({ id: "4", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.read_character_fields_templates) {
    tabs.push({ id: "5", label: "Additional fields", icon: IconEnum.additional_fields });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "6", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function CharacterDrawer({ data }: { data: { id?: string; preselectedTab?: number; title?: string } }) {
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
      permissions: true,
      fields: [
        "id",
        "first_name",
        "last_name",
        "nickname",
        "biography",
        "age",
        "portrait_id",
        "is_favorite",
        "is_public",
        "owner_id",
      ],
    },
    {
      enabled: !!data?.id,
      queryKeyConcat: ["drawer"],
    },
  );
  const permissions = useHasPermissions(
    ["read_characters", "create_characters", "update_characters", "read_tags", "read_character_fields_templates"],
    existingCharacter?.data?.owner_id,
  );
  const tabs = getTabs(permissions, data?.id);
  const [character, setCharacter] = useState<Partial<CharacterType> | null>(
    data.title
      ? {
          project_id,
          first_name: data.title.split(" ")[0],
          last_name: data.title.split(" ")[1],
        }
      : null,
  );
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertCharacterType>("characters");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateCharacterType>(
    "characters",
    project_id as string,
  );
  const hasCreateOrEdit = createOrEditPermission(
    permissions?.create_characters,
    permissions?.update_characters,
    permissions?.is_owner,
    data?.id,
  );
  const { data: templates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id: project_id as string },
      fields: ["id", "title", "sort"],
      relations: { character_fields: true },
      relationFilters: {
        or: (character?.tags || [])?.map((t) => ({
          operator: "in",
          value: t.id,
          id: t.id,
          header_name: "tags",
          relationalData: { blueprint_field_id: "tags" },
          field: "tags",
        })),
      },
      orderBy: [
        {
          field: "sort",
          sort: "desc",
        },
      ],
    },
    "character_fields_templates",
    {
      enabled: tabs[selectedTab].id === "5" && !!character?.tags?.length,
      staleTime: 5 * 60 * 1000,
    },
  );
  const { data: relationshipTypes, isFetching: isFetchingRelationshipTypes } = useGetEntities<CharacterRelationshipType>(
    {
      data: { project_id: project_id as string },
      fields: ["id", "title", "ascendant_title", "descendant_title"],
    },
    "character_relationship_types",
    {
      enabled: tabs[selectedTab].id === "3",
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
        biography: null,
        full_name: "",
        owner_id: "",
        project_id: project_id as string,
        character_fields: [],
        tags: [],
      });
    }
  }, [existingCharacter?.data]);

  if (isFetching) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center">
            <div className="w-full lg:w-1/2">
              <Input
                isAutofocused
                isDisabled={!hasCreateOrEdit}
                label="First name"
                name="first_name"
                onChange={handleChange}
                value={character?.first_name || ""}
              />
            </div>
            <div className="w-full lg:w-1/2">
              <Input
                isDisabled={!hasCreateOrEdit}
                label="Nickname (optional)"
                name="nickname"
                onChange={handleChange}
                value={character?.nickname || ""}
              />
            </div>
            <div className="w-full lg:w-1/2">
              <Input
                isDisabled={!hasCreateOrEdit}
                label="Last name (optional)"
                name="last_name"
                onChange={handleChange}
                value={character?.last_name || ""}
              />
            </div>
          </div>
          <div>
            <span className="text-sm text-zinc-300">Character image (optional)</span>
            {!character?.portrait?.id ? (
              <ImageSelect
                isDisabled={!hasCreateOrEdit}
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
                clearAction={permissions?.update_characters ? () => handleChange({ name: "portrait", value: null }) : undefined}
                id={character?.portrait?.id}
                title={character?.portrait?.title}
              />
            )}
          </div>
          <Input
            isDisabled={!hasCreateOrEdit}
            label="Age (optional)"
            name="age"
            onChange={handleChange}
            type="number"
            value={character?.age || ""}
          />

          <ul className="flex w-full flex-col gap-y-2">
            <li className="flex items-center justify-between">
              <span>Favorite:</span>
              <Checkbox
                isDisabled={!hasCreateOrEdit}
                name="is_favorite"
                onChange={handleChange}
                value={character?.is_favorite ?? false}
              />
            </li>
            <div className="flex w-full items-center justify-between">
              <span>Is public:</span>
              <Checkbox
                isDisabled={!hasCreateOrEdit}
                name="is_public"
                onChange={handleChange}
                value={character?.is_public ?? false}
              />
            </div>
          </ul>
        </>
      ) : null}
      {tabs[selectedTab].id === "2" ? (
        <Editor
          initialContent={character?.biography || undefined}
          isDisabled={!hasCreateOrEdit}
          name="biography"
          onChange={handleChange}
        />
      ) : null}
      {tabs[selectedTab].id === "3" ? (
        <div className="flex flex-col gap-y-2 p-2">
          {hasCreateOrEdit ? (
            <div className="flex flex-nowrap items-center justify-between">
              <span>Insert new type:</span>
              <Dropdown
                allowedPlacements={["left", "left-start", "left-end"]}
                items={(relationshipTypes?.data || [])
                  .filter((rt) => !relationGroupIds.includes(rt.id))
                  .map((rt) => ({
                    id: rt.id,
                    title: rt.title,
                    isDisabled: relationGroupIds.includes(rt.id),
                    onClick: () => setRelationGroupIds((prev) => prev.concat(rt.id)),
                  }))}>
                <div className="h-8 w-8">
                  <Button icon={IconEnum.add} onClick={undefined} variant="info" />
                </div>
              </Dropdown>
            </div>
          ) : null}
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
                      <div className="flex flex-col gap-y-2 p-2">
                        <Search
                          isDisabled={!hasCreateOrEdit}
                          name="related_other"
                          onChange={({ label, value, image }) => {
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
                            if (value && label) {
                              handleChange({
                                name: "related_other",
                                value: (character?.related_other || []).concat({
                                  id: value,
                                  full_name: label,
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
                              character_name={char.full_name}
                              handleRemove={
                                hasCreateOrEdit
                                  ? (character_b_id: string) =>
                                      handleChange({
                                        name: "related_other",
                                        value: (character?.related_other || []).filter((r) => r.id !== character_b_id),
                                      })
                                  : () => {}
                              }
                              {...char}
                              key={char.id}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-y-2 p-2">
                        <Search
                          isDisabled={!hasCreateOrEdit}
                          label="Ascendants"
                          name="related_to"
                          onChange={({ value, image, label }) => {
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

                            if (value && label) {
                              handleChange({
                                name: "related_to",
                                value: (character?.related_to || []).concat({
                                  id: value,
                                  full_name: label,
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
                                character_name={char.full_name}
                                handleRemove={
                                  hasCreateOrEdit
                                    ? (character_b_id: string) =>
                                        handleChange({
                                          name: "related_to",
                                          value: (character?.related_to || []).filter((r) => r.id !== character_b_id),
                                        })
                                    : () => {}
                                }
                                {...char}
                                key={char.id}
                              />
                            ))}
                        </div>
                        <Search
                          isDisabled={!hasCreateOrEdit}
                          label="Descendants"
                          name="related_from"
                          onChange={({ label, value, image }) => {
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
                            if (value && label) {
                              handleChange({
                                name: "related_from",
                                value: (character?.related_from || []).concat({
                                  id: value,
                                  full_name: label,
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
                                character_name={char.full_name}
                                handleRemove={
                                  hasCreateOrEdit
                                    ? (character_b_id: string) =>
                                        handleChange({
                                          name: "related_from",
                                          value: (character?.related_from || []).filter((r) => r.id !== character_b_id),
                                        })
                                    : () => {}
                                }
                                {...char}
                                key={char.id}
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
      {tabs[selectedTab].id === "4" && permissions?.read_tags ? (
        <div className="flex flex-col gap-y-2">
          <TagInput handleChange={handleChange} isDisabled={!hasCreateOrEdit} tags={character?.tags || []} />
        </div>
      ) : null}
      {tabs[selectedTab].id === "5" && permissions?.read_character_fields_templates ? (
        <AdditionalFieldsTab
          character_fields={character?.character_fields || []}
          handleChange={handleChange}
          hasCreateOrEdit={hasCreateOrEdit && permissions?.read_character_fields_templates}
          isLoading={isFetching || isFetchingTemplates}
          tags={character?.tags}
          templates={{ data: uniqueBy(templates?.data || [], "id") }}
        />
      ) : null}
      {tabs[selectedTab].id === "6" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={character?.owner_id}
          permissions={character?.permissions || []}
          related_id={character?.id || null}
          selectablePermissions={["read_characters", "update_characters", "delete_characters"]}
        />
      ) : null}
      <div>
        <Button
          icon={character?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(character) || !hasCreateOrEdit || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={character?.id ? "Update" : "Create"}
          onClick={async () => {
            if (!data?.title && !changedData) {
              createNotification({ title: "No data was changed.", timer: 3, variant: "info", icon: IconEnum.info_circle });
              return;
            }
            if (changedData || data?.title) {
              if (character?.id && existingCharacter?.data) {
                const dataToParse = {
                  data: character,
                  permissions: character?.permissions,
                  relations: {
                    tags: character?.tags?.map((t) => ({ id: t.id })),
                    character_fields: getDifferenceForCharacterFields(existingCharacter?.data, character),
                    related_from: character?.related_from,
                    related_to: character?.related_to,
                    related_other: character?.related_other,
                  },
                };
                if (dataToParse?.data?.portrait?.id) {
                  dataToParse.data.portrait_id = dataToParse.data.portrait.id;
                }
                const parsedData = UpdateCharacterSchema.parse(dataToParse);
                await update(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                });
              } else {
                const dataToParse = {
                  data: character,
                  permissions: character?.permissions,
                  relations: {
                    tags: character?.tags?.map((t) => ({ id: t.id })),
                    character_fields: character?.character_fields || [],
                    related_from: character?.related_from,
                    related_to: character?.related_to,
                    related_other: character?.related_other,
                  },
                };
                if (dataToParse?.data?.portrait?.id) {
                  dataToParse.data.portrait_id = dataToParse.data.portrait.id;
                }

                const parsedData = InsertCharacterSchema.parse(dataToParse);
                await create(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                });
              }
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
