import { useParams } from "react-router-dom";

import { CalendarView, DictionaryView } from "../Entities";
import { PublicDocument, PublicGraph, PublicMap } from ".";

export function PublicEntitiesView() {
  const { type } = useParams();
  // if (type === "characters") return <CharacterProfileView isPreview isPublic />;
  if (type === "documents") return <PublicDocument />;
  if (type === "maps") return <PublicMap />;
  if (type === "graphs") return <PublicGraph />;
  if (type === "calendars") return <CalendarView isPublic />;
  if (type === "dictionaries") return <DictionaryView isPublic />;
  return <div>PublicView</div>;
}
