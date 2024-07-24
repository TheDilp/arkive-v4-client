import { useParams } from "react-router-dom";

import { DictionaryView } from "../../../pages/Entities";
import { PublicDocument, PublicGraph, PublicMap } from ".";
import { PublicBlueprint } from "./PublicBlueprint";
import { PublicCalendar } from "./PublicCalendar";
import { PublicCharacter } from "./PublicCharacter";
import PublicManuscript from "./PublicManuscript";

export function PublicEntitiesView() {
  const { type } = useParams();
  if (type === "manuscripts") return <PublicManuscript />;
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
      <div className="flex flex-col gap-y-2 p-2">
        <DictionaryView />
      </div>
    );
  return null;
}
