import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import {
  AdditionalFieldDisplay,
  Alert,
  Collapsible,
  EntityPreview,
  FamilyTreeDialog,
  Gallery,
  Skeleton,
  StaticRender,
  Tabs,
  Title,
} from "../../components";
import { useGetEntities, useGetEntity } from "../../hooks";
import { CharacterFieldTemplateType, CharacterType } from "../../types";
import { getEntityLink, IconEnum, useNotifications } from "../../utils";
import { PublicEntityLayout } from "./PublicLayout";

const tabs = [
  { id: "documents", label: "Documents", icon: IconEnum.document },
  { id: "locations", label: "Locations", icon: IconEnum.map_pin },
  { id: "events", label: "Events", icon: IconEnum.event },
];

function getRelatedEntities(character: { data: CharacterType }, tab: number) {
  if (tab === 0) return { type: "documents" as const, items: character?.data?.documents || [] };
  if (tab === 1) return { type: "maps" as const, items: character?.data?.locations || [] };
  if (tab === 2) return { type: "events" as const, items: character?.data?.events || [] };
  return { type: "documents" as const, items: [] };
}

export function PublicCharacter() {
  const { project_id, item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const createNotification = useNotifications();
  const {
    data: character,
    error,
    // isLoading,
    // isFetching,
  } = useGetEntity<CharacterType>(
    item_id,
    "characters",
    {
      relations: {
        character_fields: true,
        documents: true,
        locations: true,
        events: true,
        images: true,
        tags: true,
      },
      fields: ["id", "full_name", "portrait_id", "age", "biography", "is_public"],
    },
    {
      staleTime: 60 * 1000,
      isPublic: true,
    }
  );

  const { data: existingTemplates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id },
      fields: ["id", "title"],
      relations: { character_fields: true },
      relationFilters: {
        or: (character?.data?.tags || [])?.map((t) => ({
          id: "tags",
          header_name: "Tags",
          operator: "in",
          value: t.id,
          relationalData: { blueprint_field_id: "tags" },
          field: "tags",
        })),
      },
    },
    "character_fields_templates",
    { enabled: !!character?.data?.tags?.length, staleTime: 5 * 60 * 1000, isPublic: true }
  );

  if (!character?.data) return <Skeleton type="character_profile_main" />;
  if (!character?.data?.is_public || error) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });

    return <Navigate to={`/${project_id}/characters`} />;
  }
  const relatedEntities = getRelatedEntities(character, selectedTab);
  return (
    <PublicEntityLayout image_id={character?.data?.portrait_id} title={character?.data?.full_name || ""}>
      <div className="flex h-full flex-1 flex-col gap-y-2 overflow-auto px-2">
        <Collapsible icon={IconEnum.biography} initialOpen={!!character?.data?.biography} label="Biography">
          <div className="h-fit max-h-96 overflow-auto">
            {character?.data?.biography ? (
              <StaticRender content={character?.data?.biography ?? undefined} isPublicView />
            ) : (
              <Alert label="Nothing has been written yet." />
            )}
          </div>
        </Collapsible>
        <Collapsible icon={IconEnum.additional_fields} label="Additional fields">
          <div className="animate-in fade-in fill-mode-both flex max-h-96 flex-col gap-y-2 overflow-y-auto p-2">
            {isFetchingTemplates ? <Skeleton type="character_profile_main" /> : null}
            {(existingTemplates?.data || []).map((t) => {
              return (
                <div className="grid h-full grid-cols-6 flex-col content-start gap-y-2" key={t.id}>
                  <div className="col-span-6">
                    <Title isDrawerTitle label={t.title} size="lg" variant="secondary" />
                  </div>
                  {t.character_fields.map((template_field) => {
                    const characterField = character?.data?.character_fields?.find((f) => f.id === template_field.id);
                    if (characterField)
                      return (
                        <AdditionalFieldDisplay
                          character_field={template_field}
                          character_field_data={characterField ?? null}
                          isPreview={false}
                          isPublic
                          key={template_field.id}
                        />
                      );
                    return null;
                  })}
                </div>
              );
            })}

            {!isFetchingTemplates && !existingTemplates?.data?.length ? (
              <Alert label="There is no additional information." variant="info" />
            ) : null}
          </div>
        </Collapsible>
        <Collapsible icon={IconEnum.family_tree} label="Relationships">
          <div className="h-96 p-2">
            {character?.data?.id ? <FamilyTreeDialog data={{ id: character.data.id, isPublic: true }} /> : null}
          </div>
        </Collapsible>
        <Collapsible icon={IconEnum.image} label="Images">
          <div className="p-2">
            {character?.data?.images?.length ? (
              <Gallery columns={6} images={character?.data?.images || []} isOpenable size="md" type="images" />
            ) : (
              <Alert label="This character has no public images available." />
            )}
          </div>
        </Collapsible>
        <Collapsible icon={IconEnum.search} label="Explore">
          <div className="h-full flex-1 p-2">
            <Tabs onChange={(_, tab) => setSelectedTab(tab)} selectedTab={selectedTab} tabs={tabs} />
            <div className="grid grid-cols-1 gap-2 py-2 md:grid-cols-3 xl:grid-cols-6">
              {(relatedEntities.items || []).map((d) => (
                <div className="col-span-1 xl:col-span-2" key={d.id}>
                  <EntityPreview
                    id={d.id}
                    image_id={"image_id" in d ? d.image_id : ""}
                    link={getEntityLink(
                      project_id as string,
                      relatedEntities.type,
                      d.id,
                      "parent_id" in d ? d.parent_id : null,
                      true
                    )}
                    title={d.title}
                    type={relatedEntities.type}
                  />
                </div>
              ))}
            </div>
          </div>
        </Collapsible>
      </div>
    </PublicEntityLayout>
  );
}

