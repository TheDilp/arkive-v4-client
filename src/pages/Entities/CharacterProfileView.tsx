import { useState } from "react";
import { useParams } from "react-router-dom";

import { Alert, Avatar, Tabs, Title } from "../../components";
import { useGetEntities, useGetEntity } from "../../hooks";
import { CharacterFieldTemplateType, CharacterFieldType, CharacterFieldValueType, CharacterType } from "../../types";
import { getCharacterFullName, getImageURL, IconEnum, sortEntities } from "../../utils";

const tabs = [
  { id: "1", label: "Documents", icon: IconEnum.document },
  { id: "2", label: "Locations", icon: IconEnum.map_pin },
  { id: "3", label: "Relationships", icon: IconEnum.family_tree },
  { id: "4", label: "Additional fields", icon: IconEnum.additional_fields },
  { id: "5", label: "Images", icon: IconEnum.image },
];

function AdditionalFieldDisplay({
  character_fields,
  character_field_data,
}: {
  character_fields: CharacterFieldType[];
  character_field_data: CharacterFieldValueType[];
}) {
  return (
    <div className="grid grid-cols-6">
      {character_fields.map((field) => {
        const fieldTitle = character_fields.find((f) => f.id === field.id)?.title;
        if (fieldTitle)
          return (
            <div key={field?.id}>
              <div className="col-span-1 flex flex-col">
                <Title label={fieldTitle} size="sm" />
              </div>
            </div>
          );
        return null;
      })}
      {character_field_data.map((field) => (
        <div key={field?.id}>
          <div className="col-span-1 flex flex-col">
            <Title label={(field.value.value as string) || ""} size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CharacterProfileView() {
  const { project_id, item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: existingCharacter, isFetching } = useGetEntity<CharacterType>(item_id, "characters", {
    data: {},
    relations: { tags: true, character_fields: true },
  });
  const { data: existingTemplates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    { data: { project_id }, fields: ["id", "title"], relations: { character_fields: true } },
    "character_fields_templates",
    { enabled: selectedTab === 3, staleTime: 5 * 60 * 1000 },
  );
  if (isFetching || isFetchingTemplates) return null;
  return (
    <div className="grid h-full max-h-[calc(100%-2rem)] w-full grid-cols-5 gap-x-4 p-4">
      <div className="col-span-1 flex h-full flex-col items-center gap-y-2 overflow-hidden rounded-lg bg-zinc-900 p-4">
        <Avatar
          image={getImageURL(project_id as string, "images", existingCharacter?.data?.portrait_id)}
          label={getCharacterFullName(
            existingCharacter?.data?.first_name as string,
            existingCharacter?.data?.nickname || "",
            existingCharacter?.data?.last_name || "",
          )}
          size="4xl"
        />
        <div className="mt-2 flex flex-col gap-y-1">
          <h2 className="text-center font-merriweather text-lg">
            {`${existingCharacter?.data?.first_name} ${existingCharacter?.data?.last_name}`.trimEnd()}
          </h2>
          {existingCharacter?.data?.nickname ? (
            <h3 className="text-center font-lato">{existingCharacter?.data?.nickname}</h3>
          ) : null}
        </div>

        <div className="w-full">
          <Tabs isVertical onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
        </div>
      </div>
      <div className="col-span-4 h-full rounded-lg bg-zinc-800 p-4">
        <ul className="flex flex-col gap-y-2 overflow-y-auto">
          {existingTemplates?.data?.length ? (
            existingTemplates?.data?.sort(sortEntities)?.map(
              (t) => (
                <div key={t.id} className="flex flex-col gap-y-2">
                  <Title isDrawerTitle label={t.title} size="2xl" />
                  <AdditionalFieldDisplay
                    character_field_data={
                      existingCharacter?.data?.character_fields?.filter((field) => field.template_id === t.id) || []
                    }
                    character_fields={t?.character_fields}
                  />
                </div>
              ),
              // <FieldTemplateRow
              //   key={t?.id}
              //   character_fields={t.character_fields}
              //   character_fields_data={character_fields}
              //   createNotification={createNotification}
              //   handleChange={handleChange}
              //   id={t?.id}
              //   selectedTemplates={selectedTemplates}
              //   title={t?.title}
              // />
            )
          ) : (
            <Alert label="There are no templates available." variant="info" />
          )}
        </ul>
      </div>
    </div>
  );
}
