import { useParams } from "react-router-dom";

import { PublicDocument } from ".";

export function PublicEntitiesView() {
  const { type } = useParams();
  if (type === "documents") return <PublicDocument />;
  return <div>PublicView</div>;
}
