import omit from "lodash.omit";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetAllEntities, useGetItem, useHandleChange, useUpdateEntity } from "../../../hooks";
import { CharacterType, FieldTemplate, FieldType, InputOnChangeValue, onChangeValue } from "../../../types";
import {
  BaseCharacterRelationshipOptionsEnum,
  getCharacterFullName,
  IconEnum,
  sortEntities,
  useNotifications,
} from "../../../utils";
import { Badge, CharacterPreview } from "../..";
import { ImageSelect } from "../../Complex/ImageSelect";
import { Button, Checkbox, Input, Search, Select, Textarea } from "../../Form";
import { Collapsible } from "../../Layout/Collapsible";
import { Tabs } from "../../Layout/Tabs";
import Alert from "../../Misc/Alert";

type insertCharacterType = Partial<CharacterType> & { project_id: string };
type updateCharacterType = Partial<CharacterType>;
type characterRelationsType = {
  character_fields?: { id: string; value: string | string[] }[];
  related_to?: { id: string; relation_type: string }[];
  related_from?: { id: string; relation_type: string }[];
  tags?: { id: string }[];
  image?: { id: string | null };
};

function isSaveDisabled(character: Partial<CharacterType> & characterRelationsType) {
  if (!character?.first_name) return true;
  if (character?.related_from?.length) {
    if (character?.related_from?.some((rel) => !rel?.relation_type)) return true;
  }
  if (character?.related_to?.length) {
    if (character?.related_to?.some((rel) => !rel?.relation_type)) return true;
  }
  if (character?.character_fields?.length) {
    if (character?.character_fields?.some((field) => !field?.value)) return true;
  }
  return false;
}

function CharacterFieldInputs({
  id,
  title,
  field_type: fieldType,
  options,
  value: currentValue,
  index,
  handleChange,
}: FieldType & {
  index: number;
  value: string | string[] | undefined;
  handleChange: ({ name, value }: { name: string; value: any }) => void;
}) {
  const name = `character_fields[${index}]`;
  if (fieldType === "text" || fieldType === "number") {
    return (
      <Input
        label={title}
        name={name}
        onChange={({ value }) => {
          handleChange({ name, value: { id, value } });
        }}
        value={currentValue as string}
      />
    );
  }
  if (fieldType === "select" || fieldType === "select_multiple") {
    return (
      <Select
        isMultiple={fieldType === "select_multiple"}
        label={title}
        name={name}
        onChange={({ value }) => handleChange({ name, value: { id, value } })}
        options={options?.map((opt) => ({ label: opt, value: opt })) || []}
        value={currentValue}
      />
    );
  }
  if (fieldType === "textarea") {
    return (
      <div className="h-[10rem] max-h-full min-h-[10rem]">
        <Textarea
          label={title}
          name={name}
          onChange={({ value }) => {
            handleChange({ name, value: { id, value } });
          }}
          value={currentValue as string}
        />
      </div>
    );
  }
  return null;
}

function RelationshipRow({
  current_character_first_name,
  relation_type,
  character_name,
  portrait_id,
  id,
  handleChange,
  handleRemove,
  index,
  relationship_row_type,
}: {
  id: string;
  current_character_first_name?: string;
  character_name: string;
  relation_type: string;
  portrait_id?: string;
  index: number;
  relationship_row_type: "related_to" | "related_from";
  handleChange: ({ name, value }: InputOnChangeValue | onChangeValue) => void;
  handleRemove: (char_id: string) => void;
}) {
  return (
    <li className="flex items-center gap-x-2">
      <div className="flex flex-1 items-center">
        <CharacterPreview character_name={character_name} image_id={portrait_id} />
        <span className="font-light">is {current_character_first_name || "this character"}&apos;s </span>
      </div>
      <div className="max-w-[10rem] flex-1">
        <Select
          isDisabled={relationship_row_type === "related_from" && (relation_type === "father" || relation_type === "mother")}
          name={`${relationship_row_type}[${index}].relation_type`}
          onChange={handleChange}
          options={
            relationship_row_type === "related_from" && (relation_type === "father" || relation_type === "mother")
              ? [{ label: "Child", value: "child" }]
              : BaseCharacterRelationshipOptionsEnum
          }
          value={
            relationship_row_type === "related_from" && (relation_type === "father" || relation_type === "mother")
              ? "child"
              : relation_type
          }
        />
      </div>
      <div className="max-w-fit flex-1">
        <Button
          hasNoBackground
          icon={IconEnum.trash}
          onClick={() => {
            handleRemove(id);
          }}
          variant="error"
        />
      </div>
    </li>
  );
}

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Realationships", icon: IconEnum.family_tree },
  { id: "3", label: "Additional fields", icon: IconEnum.additional_fields },
  { id: "4", label: "Tags", icon: IconEnum.tags },
];

export function CharacterDrawer({ data, resetDrawerAtom }: { data: { id?: string }; resetDrawerAtom: () => void }) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const createNotification = useNotifications();
  const { data: existingCharacter } = useGetItem<CharacterType>(
    data?.id,
    "characters",
    {
      data: {},
      relations: { character_fields: true, relationships: true, tags: true },
      fields: ["id", "first_name", "last_name", "nickname", "age", "portrait_id", "is_favorite"],
    },
    {
      enabled: !!data?.id,
    },
  );

  const [character, setCharacter] = useState<Partial<CharacterType> & { project_id: string }>(
    existingCharacter?.data || { project_id: project_id as string },
  );

  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{
    data: insertCharacterType;
    relations?: characterRelationsType;
  }>("characters");
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<{
    data: updateCharacterType;
    relations?: characterRelationsType;
  }>("characters", project_id as string);

  const { data: templates } = useGetAllEntities<FieldTemplate>(
    { data: { project_id: project_id as string }, relations: { character_fields: true } },
    "character_fields_templates",
    {
      enabled: selectedTab === 2,
    },
  );

  const selectedTemplates = [...new Set((character?.character_fields || []).map((field) => field.template_id))];
  const { handleChange } = useHandleChange({ data: character, setData: setCharacter });
  useEffect(() => {
    if (existingCharacter?.data) {
      setCharacter(existingCharacter?.data);
    }
  }, [existingCharacter?.data]);

  return (
    <>
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
          <ImageSelect
            label="Select character avatar (optional)"
            name="portrait_id"
            onChange={handleChange}
            type="images"
            value={character?.portrait_id ?? ""}
          />
          <Input label="Age (optional)" name="age" onChange={handleChange} type="number" value={character?.age || ""} />
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center">
            <div className="w-full lg:w-1/3">
              <Input
                label="Day of birth (optional)"
                name="dayOfBirth"
                onChange={handleChange}
                type="number"
                value={character?.dayOfBirth || ""}
              />
            </div>
            <div className="w-full lg:w-1/3">
              <Input
                label="Month of birth (optional)"
                name="monthOfBirth"
                onChange={handleChange}
                type="number"
                value={character?.monthOfBirth || ""}
              />
            </div>
            <div className="w-full lg:w-1/3">
              <Input
                label="Year of birth (optional)"
                name="yearOfBirth"
                onChange={handleChange}
                type="number"
                value={character?.yearOfBirth || ""}
              />
            </div>
          </div>
          <ul className="flex w-full flex-col gap-y-2">
            <li className="flex items-center justify-between">
              <span>Favorite:</span>
              <Checkbox name="is_favorite" onChange={handleChange} value={character?.is_favorite} />
            </li>
          </ul>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <>
          <div className="flex items-center justify-between">
            <Search
              name="related_to"
              onChange={({ label, value }) => {
                if (character?.related_to?.some((relationship) => relationship?.id === value)) {
                  createNotification({
                    id: crypto.randomUUID(),
                    title: "Cannot add same character more than once as a relationship.",
                    variant: "warning",
                    timer: 2,
                    icon: IconEnum.info_circle,
                  });
                  return;
                }
                if (value) {
                  const [first_name, last_name] = (label || "").split(" ");
                  handleChange({
                    name: "related_to",
                    value: (character?.related_to || []).concat({
                      id: value,
                      first_name,
                      last_name,
                      relation_type: "",
                    }),
                  });
                }
              }}
              placeholder="Press enter to search characters"
              searchEntity="characters"
            />
          </div>
          <ul className="flex flex-col gap-y-2">
            {character?.related_to?.length
              ? character?.related_to?.map((relationship, index) => (
                  <RelationshipRow
                    key={`${relationship.id}}`}
                    character_name={getCharacterFullName(relationship.first_name, "", relationship?.last_name)}
                    current_character_first_name={character.first_name}
                    handleChange={handleChange}
                    handleRemove={(character_b_id: string) =>
                      handleChange({
                        name: "related_to",
                        value: (character?.related_to || []).filter((r) => r.id !== character_b_id),
                      })
                    }
                    index={index}
                    relationship_row_type="related_to"
                    {...relationship}
                  />
                ))
              : null}
          </ul>
          <ul className="flex flex-col gap-y-2">
            {character?.related_from?.length
              ? character?.related_from?.map((relationship, index) => (
                  <RelationshipRow
                    key={`${relationship.id}`}
                    character_name={getCharacterFullName(relationship.first_name, "", relationship?.last_name)}
                    current_character_first_name={character.first_name}
                    handleChange={handleChange}
                    handleRemove={(character_b_id: string) =>
                      handleChange({
                        name: "related_from",
                        value: (character?.related_from || []).filter((r) => r.id !== character_b_id),
                      })
                    }
                    index={index}
                    relationship_row_type="related_from"
                    {...relationship}
                  />
                ))
              : null}
          </ul>
        </>
      ) : null}
      {selectedTab === 2 ? (
        <ul className="flex flex-col gap-y-2 overflow-y-auto">
          {templates?.data?.length ? (
            templates?.data?.sort(sortEntities)?.map((t) => (
              <li key={t.id} className="mt-4 flex flex-col gap-y-2 first:mt-0">
                <Collapsible initialOpen={selectedTemplates.includes(t.id)} label={t.title}>
                  <div className="flex select-none flex-col gap-y-2 pt-2">
                    {t.character_fields.sort(sortEntities).map((f) => {
                      const fieldIndex = (character?.character_fields || [])?.findIndex((field) => f.id === field.id);
                      if (fieldIndex !== undefined)
                        return (
                          <CharacterFieldInputs
                            key={f.id}
                            {...f}
                            handleChange={handleChange}
                            index={fieldIndex === -1 ? character?.character_fields?.length || 0 : fieldIndex}
                            value={character?.character_fields?.[fieldIndex]?.value || ""}
                          />
                        );
                      return null;
                    })}
                  </div>
                </Collapsible>
              </li>
            ))
          ) : (
            <Alert label="There are no templates available." variant="info" />
          )}
        </ul>
      ) : null}
      {selectedTab === 3 ? (
        <div className="flex flex-col gap-y-2">
          <Search
            name="tags"
            onChange={({ name, label, value, color }) => {
              if ((character?.tags || [])?.some((tag) => tag.id === value)) {
                createNotification({
                  id: crypto.randomUUID(),
                  title: "Cannot add the same tag twice.",
                  variant: "warning",
                  icon: IconEnum.info_circle,
                  timer: 3,
                });
                return;
              }

              handleChange({
                name,
                value: (character?.tags || []).concat({
                  title: label as string,
                  id: value,
                  project_id: project_id as string,
                  color: color as string,
                }),
              });
            }}
            placeholder="Press enter to search tags"
            searchEntity="tags"
          />

          <div className="flex flex-wrap gap-2">
            {character?.tags?.length
              ? character.tags.map((tag) => (
                  <div key={tag.id} className="w-fit">
                    <Badge
                      clearAction={() => {
                        handleChange({ name: "tags", value: (character?.tags || []).filter((t) => t.id !== tag.id) });
                      }}
                      customColor={tag.color}
                      label={tag.title}
                      size="lg"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}
      <Button
        icon={character?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(character) || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={character?.id ? "Update" : "Create"}
        onClick={async () => {
          if (character) {
            if (character?.id) {
              await update(
                {
                  data: omit(character, ["character_fields", "related_to", "related_from", "tags"]),
                  relations: {
                    character_fields: character?.character_fields,
                    related_to: character?.related_to,
                    related_from: character?.related_from,
                    tags: character?.tags,
                  },
                },
                {
                  onSettled: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                },
              );
            } else
              await create(
                {
                  data: omit(character, ["character_fields", "related_to", "related_from", "tags"]),
                  relations: {
                    character_fields: character?.character_fields,
                    related_to: character?.related_to,
                    tags: character?.tags,
                  },
                },
                {
                  onSettled: (res) => {
                    if (res?.ok) resetDrawerAtom();
                  },
                },
              );
          }
        }}
        variant="success"
      />
    </>
  );
}
