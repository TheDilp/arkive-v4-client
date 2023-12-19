import { useParams } from "react-router-dom";

import { CharacterProfileView, MapView } from "../Entities";
import { PublicDocument } from ".";

export function PublicEntitiesView() {
  const { type } = useParams();
  if (type === "characters") return <CharacterProfileView isPreview isPublic />;
  if (type === "documents") return <PublicDocument />;
  if (type === "maps") return <MapView isPublic isReadOnly />;
  return <div>PublicView</div>;
}
