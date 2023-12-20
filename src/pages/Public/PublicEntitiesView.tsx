import { useParams } from "react-router-dom";

import { Graph } from "../../components";
import { CalendarView, DictionaryView, MapView } from "../Entities";
import { PublicDocument } from ".";

export function PublicEntitiesView() {
  const { type } = useParams();
  // if (type === "characters") return <CharacterProfileView isPreview isPublic />;
  if (type === "documents") return <PublicDocument />;
  if (type === "maps") return <MapView isPublic isReadOnly isViewOnly />;
  if (type === "graphs") return <Graph isPublic isReadOnly isViewOnly />;
  if (type === "calendars") return <CalendarView isPublic />;
  if (type === "dictionaries") return <DictionaryView isPublic />;
  return <div>PublicView</div>;
}
