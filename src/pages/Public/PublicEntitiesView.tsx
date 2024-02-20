import { useParams } from "react-router-dom";

import { DictionaryView } from "../Entities";
import { PublicDocument, PublicGraph, PublicMap } from ".";
import { PublicCalendar } from "./PublicCalendar";
import { PublicCharacter } from "./PublicCharacter";

export function PublicEntitiesView() {
  const { type } = useParams();
  if (type === "characters") return <PublicCharacter />;
  if (type === "documents") return <PublicDocument />;
  if (type === "maps") return <PublicMap />;
  if (type === "graphs") return <PublicGraph />;
  if (type === "calendars") return <PublicCalendar />;
  if (type === "dictionaries")
    return (
      <div className="p-2">
        <DictionaryView isPublic />
      </div>
    );
  return null;
}
