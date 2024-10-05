import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQueryClient } from "@tanstack/react-query";
import groupBy from "lodash.groupby";
import omit from "lodash.omit";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateEntity,
  useGetEntities,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateEntity,
} from "../../../hooks";
import {
  CharacterCharacterFieldType,
  CharacterFieldTemplateType,
  CharacterRelatedType,
  CharacterRelationshipType,
  CharacterType,
  DrawerAtomType,
  HandleChangePropsType,
  NotificationType,
  OnSearchChangePropsType,
  TabType,
  TagType,
  UserHasPermissionsType,
} from "../../../types";
import { createOrEditPermission, getDifferenceForCharacterFields, IconEnum, useNotifications } from "../../../utils";
import { InsertCharacterSchema, InsertCharacterType, UpdateCharacterSchema, UpdateCharacterType } from "../../../validation";
import { DrawerLayout, Dropdown, Editor, EntityPreview, ImagePreview, Skeleton } from "../..";
import { EntityPermission } from "../../Complex/EntityPermission";
import { ImageSelect } from "../../Complex/ImageSelect";
import { Button, Checkbox, Input, RelatedEntityForm, Search, TagInput } from "../../Form";
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
  portrait,
  id,
  handleRemove,
}: {
  id: string;
  character_name: string;
  portrait?: CharacterRelatedType["portrait"];
  handleRemove: (char_id: string) => void;
}) {
  return (
    <li className="flex items-center gap-x-2">
      <div className="flex-1">
        <EntityPreview id={id} image_id={portrait?.id} title={character_name} type="characters" />
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

function formatRelationship(r: CharacterRelatedType) {
  return omit({ ...r, portait_id: r.portrait?.id || null }, ["portrait"]);
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
  templates: CharacterFieldTemplateType[] | undefined;
  character_fields?: CharacterCharacterFieldType[];
  handleChange: (props: HandleChangePropsType) => void;
  isLoading: boolean;
  tags?: Omit<TagType, "owner_id" | "permissions">[];
  hasCreateOrEdit: boolean;
}) {
  const [areAllOpen, setAreAllOpen] = useState(false);

  if (isLoading) return <Skeleton type="drawer_form" />;
  return (
    <ul className="flex flex-col gap-y-2 overflow-y-auto">
      <li className="sticky top-0 z-50 flex items-center justify-end bg-zinc-900">
        <div className="h-8 w-8">
          <Button
            icon={areAllOpen ? IconEnum.chevron_down : IconEnum.chevron_up}
            isIconOnly
            onClick={() => setAreAllOpen((prev) => !prev)}
            tooltip={"Open/Close all"}
            variant="info"
          />
        </div>
      </li>
      {!tags?.length ? (
        <li>
          <Alert label="Please select tags first." variant="info" />
        </li>
      ) : null}
      {!templates?.length && tags?.length ? (
        <li>
          <Alert label="There are no templates available." variant="info" />
        </li>
      ) : null}

      {(templates || []).map((t) => {
        const otherFields = t.character_fields.filter((f) => !f.section_id);
        return (
          <Collapsible key={t.id} initialOpen={areAllOpen} label={t.title}>
            <div className="flex flex-col gap-y-2 p-1.5">
              {t.character_fields_sections.map((section) => {
                return (
                  <Collapsible key={section.id} initialOpen={areAllOpen} label={section.title}>
                    <div className="min-h-8 p-2">
                      <RelatedEntityForm
                        fields={t.character_fields.filter((f) => f.section_id === section.id)}
                        fields_data={character_fields || []}
                        handleChange={handleChange}
                        hasCreateOrEdit={hasCreateOrEdit}
                        type="characters"
                      />
                    </div>
                  </Collapsible>
                );
              })}
              {otherFields.length ? (
                <Collapsible initialOpen={areAllOpen} label={"Other"}>
                  <div className="min-h-8 p-2">
                    <RelatedEntityForm
                      fields={otherFields}
                      fields_data={character_fields || []}
                      handleChange={handleChange}
                      hasCreateOrEdit={hasCreateOrEdit}
                      type="characters"
                    />
                  </div>
                </Collapsible>
              ) : null}
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

function changeRelationship({
  name,
  item,
  handleChange,
  createNotification,
  character,
  relation_type_id,
}: {
  name: "related_to" | "related_from" | "related_other";
  character: Partial<CharacterType> | null;
  item: OnSearchChangePropsType;
  relation_type_id: string;
  handleChange: (props: HandleChangePropsType) => void;
  createNotification: (notification: Omit<NotificationType, "id">) => void;
}) {
  const { value, label, image } = item;
  if (character?.id && character.id === value) {
    createNotification({
      title: "Cannot add a character to themselves.",
      variant: "warning",
      timer: 2,
      icon: IconEnum.info_circle,
    });
    return;
  }

  if (value && label) {
    if ((character?.[name] || [])?.some((item) => item.id === value)) {
      handleChange({
        name,
        value: (character?.[name] || [] || []).filter((t) => t.id !== value),
      });
      return;
    }
    handleChange({
      name,
      value: (character?.[name] || []).concat({
        id: value,
        full_name: label,
        portrait: image ? { id: image, title: "" } : null,
        relation_type_id,
        character_relationship_id: "",
      }),
    });
  }
}

export function CharacterDrawer({
  exceptions,
  actions,
  data,
}: {
  exceptions?: { mention?: boolean };
  actions?: DrawerAtomType["actions"];
  data: {
    id?: string;
    preselectedTab?: number;
    title?: string;
    getContext?: ReactFrameworkOutput<Remirror.Extensions>;
    range?: { from: number | undefined; to: number | undefined };
  };
}) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(data?.preselectedTab ?? 0);
  const [createMention, setCreateMention] = useState(true);
  const resetDrawerAtom = useToggledResetAtom();
  const createNotification = useNotifications();
  const queryClient = useQueryClient();

  const {
    data: existingCharacter,
    isFetching,
    isInitialLoading,
  } = useGetEntity<CharacterType>(
    data?.id,
    "characters",
    {
      relations: { character_fields: true, relationships: true, portrait: true, is_favorite: true, tags: true },
      permissions: true,
      fields: ["id", "first_name", "last_name", "nickname", "biography", "age", "portrait_id", "is_public", "owner_id"],
    },
    {
      enabled: !!data?.id,
      queryKeyConcat: ["drawer"],
    }
  );
  const permissions = useHasPermissions(
    ["read_characters", "create_characters", "update_characters", "read_tags", "read_character_fields_templates"],
    existingCharacter?.data?.owner_id
  );
  const tabs = getTabs(permissions, data?.id);
  const [character, setCharacter] = useState<Partial<CharacterType> | null>(
    data.title
      ? {
          project_id,
          first_name: data.title.split(" ")[0],
          last_name: data.title.split(" ")[1],
        }
      : null
  );
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertCharacterType>("characters");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateCharacterType>(
    "characters",
    project_id as string
  );
  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_characters,
    permissions?.update_characters,
    permissions?.is_owner,
    data?.id
  );
  const { data: templates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id: project_id as string },
      fields: ["id", "title", "sort"],
      relations: { character_fields: true, character_fields_sections: true },
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
          sort: "asc",
        },
      ],
    },
    "character_fields_templates",
    {
      enabled: !!character?.tags?.length && permissions?.read_character_fields_templates && permissions?.read_tags,
      staleTime: 5 * 60 * 1000,
    }
  );
  const { data: relationshipTypes, isFetching: isFetchingRelationshipTypes } = useGetEntities<CharacterRelationshipType>(
    {
      data: { project_id: project_id as string },
      fields: ["id", "title", "ascendant_title", "descendant_title"],
    },
    "character_relationship_types",
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const [relationGroupIds, setRelationGroupIds] = useState<string[]>([]);
  const [groupedFields, setGroupedFields] = useState<Record<string, CharacterCharacterFieldType[]>>({});

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
          .map((relation: CharacterRelatedType) => relation.relation_type_id)
      );
      setGroupedFields(groupBy(existingCharacter?.data?.character_fields || [], "section_id"));
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
  if (isInitialLoading) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center">
            <div className="w-full lg:w-1/2">
              <Input
                isAutofocused
                isDisabled={!canCreateOrEdit}
                label="First name (required)"
                name="first_name"
                onChange={handleChange}
                value={character?.first_name || ""}
                variant={character?.first_name ? "primary" : "error"}
              />
            </div>
            <div className="w-full lg:w-1/2">
              <Input
                isDisabled={!canCreateOrEdit}
                label="Nickname (optional)"
                name="nickname"
                onChange={handleChange}
                value={character?.nickname || ""}
              />
            </div>
            <div className="w-full lg:w-1/2">
              <Input
                isDisabled={!canCreateOrEdit}
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
                isDisabled={!canCreateOrEdit}
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
                clearAction={
                  permissions?.update_characters
                    ? () => {
                        handleChange([
                          { name: "portrait", value: null },
                          { name: "portrait_id", value: null },
                        ]);
                      }
                    : undefined
                }
                id={character?.portrait?.id}
                title={character?.portrait?.title}
              />
            )}
          </div>
          <Input
            isDisabled={!canCreateOrEdit}
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
                isDisabled={!canCreateOrEdit}
                name="is_favorite"
                onChange={handleChange}
                value={character?.is_favorite ?? false}
              />
            </li>
            <li className="flex w-full items-center justify-between">
              <span>Is public:</span>
              <Checkbox
                isDisabled={!canCreateOrEdit}
                name="is_public"
                onChange={handleChange}
                value={character?.is_public ?? false}
              />
            </li>
            {exceptions?.mention ? (
              <li className="flex w-full items-center justify-between">
                <span>Create mention:</span>
                <Checkbox
                  isDisabled={!canCreateOrEdit}
                  name="create_mention"
                  onChange={(e) => setCreateMention(e.value)}
                  value={createMention}
                />
              </li>
            ) : null}
          </ul>
        </>
      ) : null}
      {tabs[selectedTab].id === "2" ? (
        <Editor
          initialContent={character?.biography || undefined}
          isDisabled={!canCreateOrEdit}
          isFullHeight
          isPrintable
          name="biography"
          onChange={handleChange}
          title={`${character?.full_name} - Biography`}
        />
      ) : null}
      {tabs[selectedTab].id === "3" ? (
        <div className="flex flex-col gap-y-2 p-2">
          {canCreateOrEdit ? (
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
                          isDisabled={!canCreateOrEdit}
                          isMultiple
                          name="related_other"
                          onBrowserChange={(props) => {
                            const temp = (character?.related_other || [])
                              .filter((item) => item.relation_type_id !== rg.id)
                              .concat(
                                props
                                  .filter((item) => item.value !== character?.id)
                                  .map((item) => ({
                                    id: item.value,
                                    full_name: item.label || "",
                                    portrait: item.image ? { id: item.image, title: "" } : null,
                                    relation_type_id: rg.id,
                                    character_relationship_id: "",
                                  }))
                              );

                            handleChange({
                              name: "related_other",
                              value: temp,
                            });
                          }}
                          onChange={(item) =>
                            changeRelationship({
                              name: "related_other",
                              item,
                              handleChange,
                              createNotification,
                              character,
                              relation_type_id: rg.id,
                            })
                          }
                          placeholder="Press enter to search characters"
                          searchEntity="characters"
                          value={(character?.related_other || []).filter((c) => c.relation_type_id === rg.id).map((c) => c.id)}
                        />

                        <div className="flex flex-col gap-y-2">
                          {otherCharactersToShow?.map((char) => (
                            <RelationshipRow
                              character_name={char.full_name}
                              handleRemove={
                                canCreateOrEdit
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
                          isDisabled={!canCreateOrEdit}
                          isMultiple
                          label="Ascendants"
                          name="related_to"
                          onBrowserChange={(props) => {
                            const temp = (character?.related_to || [])
                              .filter((item) => item.relation_type_id !== rg.id)
                              .concat(
                                props
                                  .filter((item) => item.value !== character?.id)
                                  .map((item) => ({
                                    id: item.value,
                                    full_name: item.label || "",
                                    portrait: item.image ? { id: item.image, title: "" } : null,
                                    relation_type_id: rg.id,
                                    character_relationship_id: "",
                                  }))
                              );

                            handleChange({
                              name: "related_to",
                              value: temp,
                            });
                          }}
                          onChange={(item) =>
                            changeRelationship({
                              name: "related_to",
                              item,
                              handleChange,
                              createNotification,
                              character,
                              relation_type_id: rg.id,
                            })
                          }
                          placeholder="Press enter to search characters"
                          searchEntity="characters"
                          value={(character?.related_to || []).filter((c) => c.relation_type_id === rg.id).map((c) => c.id)}
                        />
                        <div className="flex flex-col gap-y-2">
                          {character?.related_to
                            ?.filter((char) => char.relation_type_id === rg.id)
                            .map((char) => (
                              <RelationshipRow
                                character_name={char.full_name}
                                handleRemove={
                                  canCreateOrEdit
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
                          isDisabled={!canCreateOrEdit}
                          isMultiple
                          label="Descendants"
                          name="related_from"
                          onBrowserChange={(props) => {
                            const temp = (character?.related_from || [])
                              .filter((item) => item.relation_type_id !== rg.id)
                              .concat(
                                props
                                  .filter((item) => item.value !== character?.id)
                                  .map((item) => ({
                                    id: item.value,
                                    full_name: item.label || "",
                                    portrait: item.image ? { id: item.image, title: "" } : null,
                                    relation_type_id: rg.id,
                                    character_relationship_id: "",
                                  }))
                              );

                            handleChange({
                              name: "related_from",
                              value: temp,
                            });
                          }}
                          onChange={(item) =>
                            changeRelationship({
                              name: "related_from",
                              item,
                              handleChange,
                              createNotification,
                              character,
                              relation_type_id: rg.id,
                            })
                          }
                          placeholder="Press enter to search characters"
                          searchEntity="characters"
                          value={(character?.related_from || []).filter((c) => c.relation_type_id === rg.id).map((c) => c.id)}
                        />
                        <div className="flex flex-col gap-y-2">
                          {character?.related_from
                            ?.filter((char) => char.relation_type_id === rg.id)
                            .map((char) => (
                              <RelationshipRow
                                character_name={char.full_name}
                                handleRemove={
                                  canCreateOrEdit
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
          <TagInput
            handleChange={handleChange}
            isAutofocused
            isDisabled={!canCreateOrEdit}
            isMultiple
            tags={character?.tags || []}
          />
        </div>
      ) : null}
      {tabs[selectedTab].id === "5" && permissions?.read_character_fields_templates ? (
        <AdditionalFieldsTab
          character_fields={character?.character_fields || []}
          handleChange={handleChange}
          hasCreateOrEdit={canCreateOrEdit && permissions?.read_character_fields_templates}
          isLoading={isFetching || isFetchingTemplates}
          tags={character?.tags}
          templates={templates?.data || []}
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
          isDisabled={isSaveDisabled(character) || !canCreateOrEdit || isFetching || isCreating || isUpdating}
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
                    related_from: character?.related_from?.map(formatRelationship),
                    related_to: character?.related_to?.map(formatRelationship),
                    related_other: character?.related_other?.map(formatRelationship),
                    is_favorite: character?.is_favorite,
                  },
                };
                if (dataToParse?.data?.portrait?.id) {
                  dataToParse.data.portrait_id = dataToParse.data.portrait.id;
                }
                const parsedData = UpdateCharacterSchema.parse(dataToParse);
                await update(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) {
                      if (actions?.onSuccessAction) {
                        actions?.onSuccessAction(parsedData);
                      }
                      resetDrawerAtom();
                    }
                  },
                });
              } else {
                const dataToParse = {
                  data: character,
                  permissions: character?.permissions,
                  relations: {
                    tags: character?.tags?.map((t) => ({ id: t.id })),
                    character_fields: Object.values(groupedFields).flat() || [],
                    related_from: character?.related_from?.map(formatRelationship),
                    related_to: character?.related_to?.map(formatRelationship),
                    related_other: character?.related_other?.map(formatRelationship),
                    is_favorite: character?.is_favorite,
                  },
                };
                if (dataToParse?.data?.portrait?.id) {
                  dataToParse.data.portrait_id = dataToParse.data.portrait.id;
                }

                const parsedData = InsertCharacterSchema.parse(dataToParse);

                await create(parsedData, {
                  onSuccess: (res) => {
                    if (res?.ok) {
                      if (createMention) {
                        if (
                          exceptions?.mention &&
                          data?.getContext &&
                          typeof data.range?.from === "number" &&
                          typeof data.range?.to === "number" &&
                          res?.data?.id
                        ) {
                          data.getContext.chain
                            .delete({ from: Number(data.range.from), to: Number(data.range.to) })
                            .createMentionAtom(
                              {
                                name: "characters",
                                range: {
                                  from: data.range.from,
                                  cursor: data.range.to,
                                  to: data.range.to,
                                },
                              },
                              {
                                id: res?.data?.id,
                                label: data?.title || "",
                                name: "characters",
                                icon: undefined,
                                projectId: project_id,
                                parent_id: undefined,
                              }
                            )
                            .run();
                        }
                      }
                      if (actions?.onSuccessAction) {
                        actions?.onSuccessAction({ id: res?.data?.id, ...parsedData.data });
                      }
                      resetDrawerAtom();
                      setSelectedTab(0);
                      setCharacter({ project_id });
                    }
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
