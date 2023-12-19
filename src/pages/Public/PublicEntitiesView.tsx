import { useParams } from "react-router-dom";

import { CharacterProfileView } from "../Entities";
import { PublicDocument } from ".";

export function PublicEntitiesView() {
  const { type } = useParams();
  if (type === "documents") return <PublicDocument />;
  if (type === "characters") return <CharacterProfileView isPreview isPublic />;
  return <div>PublicView</div>;
}
