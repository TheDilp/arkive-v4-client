import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Collapsible, EntityPreview, Gallery, Skeleton, Tabs } from "../../components";
import { useGetEntity } from "../../hooks";
import { CharacterType } from "../../types";
import { getEntityLink, IconEnum } from "../../utils";
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
  const {
    data: character,
    // isLoading,
    // isFetching,
  } = useGetEntity<CharacterType>(
    item_id,
    "characters",
    {
      relations: {
        character_fields: true,
        relationships: true,
        character_relationship_types: true,
        documents: true,
        locations: true,
        events: true,
        images: true,
        tags: true,
      },
      fields: ["id", "full_name", "portrait_id", "age", "is_public"],
    },
    {
      staleTime: 60 * 1000,
      isPublic: true,
    },
  );

  if (!character?.data) return <Skeleton type="character_profile_main" />;
  if (!character?.data?.is_public) return <Navigate to={`/public/${project_id}/characters`} />;
  const relatedEntities = getRelatedEntities(character, selectedTab);
  return (
    <PublicEntityLayout image_id={character?.data?.portrait_id} title={character?.data?.full_name || ""}>
      <div className="flex h-full flex-1 flex-col gap-y-2 px-2">
        {/* <div className="">
          <p>TEXT ABOUT THE CHAR</p>
        </div> */}
        <div className="flex flex-col px-2">
          <Collapsible icon={IconEnum.image} label="Images">
            <Gallery columns={6} images={character?.data?.images || []} isOpenable size="xl" type="images" />
          </Collapsible>
        </div>
        <div className="flex flex-col px-2">
          <Collapsible icon={IconEnum.search} label="Explore">
            <div className="h-full flex-1 p-2">
              <Tabs onChange={(_, tab) => setSelectedTab(tab)} selectedTab={selectedTab} tabs={tabs} />
              <div className="grid grid-cols-1 gap-2 py-2 md:grid-cols-3 xl:grid-cols-6">
                {(relatedEntities.items || []).map((d) => (
                  <EntityPreview
                    id={d.id}
                    image_id={"image_id" in d ? d.image_id : ""}
                    link={getEntityLink(
                      project_id as string,
                      relatedEntities.type,
                      d.id,
                      "parent_id" in d ? d.parent_id : null,
                      true,
                    )}
                    title={d.title}
                    type={relatedEntities.type}
                  />
                ))}
              </div>
            </div>
          </Collapsible>
        </div>
      </div>
    </PublicEntityLayout>
  );
}
