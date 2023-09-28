import { useState } from "react";

import { useGetCharacterFamily, useGetEntity } from "../../../hooks";
import { CharacterRelationshipDataType, CharacterType } from "../../../types";
import { Graph, Select, Skeleton } from "../..";
import { Alert } from "../../Misc/Alert";

function getLayoutDirection(character_relationship_types: CharacterRelationshipDataType[], relationShipTypeId: string) {
  const selectedType = character_relationship_types?.find((rt) => rt.id === relationShipTypeId);
  if (selectedType) {
    if (!selectedType.related_to_ascendant_title && !selectedType.related_from_ascendant_title) {
      return "LR";
    }
    return "TB";
  }
  return "TB";
}

export function FamilyTreeDialog({ data }: { data: { id: string } }) {
  const [relationShipTypeId, setRelationshipTypeId] = useState("");
  const { data: characterData, isFetching: isFetchingCharacterData } = useGetEntity<CharacterType>(
    data?.id,
    "characters",
    {
      fields: ["id"],
      relations: {
        character_relationship_types: true,
      },
    },
    {
      queryKeyConcat: ["family_tree"],
    },
  );
  const layoutDirection = getLayoutDirection(characterData?.data?.character_relationship_types || [], relationShipTypeId);

  const { data: characterFamilyData, isFetching } = useGetCharacterFamily(data?.id, relationShipTypeId, {
    enabled: !!relationShipTypeId,
    staleTime: 60 * 1000,
  });

  if (isFetching) return <Skeleton type="family_tree" />;
  const { nodes, edges } = characterFamilyData?.data ?? { nodes: [], edges: [] };

  return (
    <div className="flex h-full flex-col gap-y-2">
      <Select
        isLoading={isFetchingCharacterData}
        name="relationshipTypeId"
        onChange={({ value }) => setRelationshipTypeId(value as string)}
        options={(characterData?.data?.character_relationship_types || []).map((rt) => ({
          label: rt.related_from_title || rt.related_to_title || "",
          value: rt.id,
        }))}
        value={relationShipTypeId}
      />
      {isFetching ? <Skeleton type="family_tree" /> : null}
      {relationShipTypeId && !isFetching ? (
        <Graph
          data={{
            title: "Relationship tree",
            default_edge_color: "#595959",
            default_node_color: "#595959",
            default_node_shape: "rectangle",
            nodes: nodes || [],
            edges: edges || [],
          }}
          isFamilyTreeView
          isViewOnly
          layoutOptions={{ rankDir: layoutDirection }}
        />
      ) : (
        <Alert label="No relation type selected." />
      )}
    </div>
  );
}
