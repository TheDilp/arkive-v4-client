import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { Gallery, Skeleton, StaticRender, Tabs } from "../../components";
import { useGetEntity } from "../../hooks";
import { CharacterType, DocumentType } from "../../types";
import { IconEnum } from "../../utils";
import { PublicEntityLayout } from "./PublicLayout";

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
        tags: true,
        character_fields: true,
        locations: true,
        relationships: true,
        character_relationship_types: true,
        documents: true,
        images: true,
      },
      fields: ["id", "full_name", "portrait_id", "age", "is_public"],
    },
    {
      staleTime: 60 * 1000,
      isPublic: true,
    },
  );

  const tabs = [
    ...(character?.data?.documents || []).map((doc) => ({
      id: `document_${doc.id}`,
      label: doc.title,
      icon: doc.icon || IconEnum.document,
    })),
    { id: "gallery", label: "Gallery", icon: IconEnum.image },
  ];

  const { data: viewingDocument } = useGetEntity<DocumentType>(
    character?.data?.documents?.[selectedTab]?.id,
    "documents",
    {
      fields: ["content"],
    },
    {
      enabled: tabs[selectedTab].id.includes("document_"),
      queryKeyConcat: [tabs[selectedTab].id],
    },
  );

  if (!character?.data) return <Skeleton type="character_profile_main" />;
  if (!character?.data?.is_public) return <Navigate to={`/public/${project_id}/characters`} />;

  return (
    <PublicEntityLayout title={character?.data?.full_name || ""}>
      <div className="sticky top-0 z-10 bg-black p-2">
        <Tabs onChange={(_, idx) => setSelectedTab(idx)} selectedTab={selectedTab} tabs={tabs} />
      </div>
      <div className="h-full px-4">
        {/* <div className="ml-auto flex w-48 flex-col border border-zinc-700">
        {character?.data?.portrait_id ? (
          <div className="w-full">
            <h3 className="flex h-10 items-center justify-center bg-sky-700 font-lato text-lg">
              {character?.data?.full_name || ""}
            </h3>
            <img
              alt={`Portrait of ${character?.data?.full_name || ""}`}
              className="object-contain"
              src={getImageURL(project_id as string, "images", character?.data?.portrait_id)}
            />
          </div>
        ) : null}
      </div> */}

        {tabs[selectedTab].id.includes("document_") ? (
          <StaticRender content={viewingDocument?.data?.content as RemirrorJSON} />
        ) : null}

        {tabs[selectedTab].id === "gallery" ? (
          <Gallery columns={6} images={character?.data?.images || []} isOpenable type="images" />
        ) : null}
      </div>
    </PublicEntityLayout>
  );
}
