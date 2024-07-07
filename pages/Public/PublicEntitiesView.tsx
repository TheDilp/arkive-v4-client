import { useParams } from "react-router-dom";

import { DictionaryView } from "../Entities";
import { PublicDocument, PublicGraph, PublicMap } from ".";
import { PublicBlueprint } from "./PublicBlueprint";
import { PublicCalendar } from "./PublicCalendar";
import { PublicCharacter } from "./PublicCharacter";

export function PublicEntitiesView() {
  const { type } = useParams();
  if (type === "characters") return <PublicCharacter />;
  if (type === "blueprints") return <PublicBlueprint />;
  if (type === "documents") return <PublicDocument />;
  if (type === "maps") return <PublicMap />;
  if (type === "graphs") return <PublicGraph />;
  if (type === "calendars")
    return (
      <div className="h-full p-2">
        <PublicCalendar />
      </div>
    );
  if (type === "dictionaries")
    return (
      <div className="p-2">
        <DictionaryView />
      </div>
    );
  return null;
}

