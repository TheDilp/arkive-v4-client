import { useParams } from "react-router-dom";

import { DictionaryView } from "../Entities";
import { PublicDocument, PublicGraph, PublicMap } from ".";
import { PublicCalendar } from "./PublicCalendar";

export function PublicEntitiesView() {
  const { type } = useParams();
  // if (type === "characters") return <CharacterProfileView isPreview isPublic />;
  if (type === "documents") return <PublicDocument />;
  if (type === "maps") return <PublicMap />;
  if (type === "graphs") return <PublicGraph />;
  if (type === "calendars") return <PublicCalendar />;
  if (type === "dictionaries") return <DictionaryView isPublic />;
  return null;
}
