import { useParams } from "react-router-dom";

import { Breadcrumbs, Button, Graph } from "../../components";
import { IconEnum } from "../../utils";
import { CharacterProfileView, DocumentView, MapView, RandomTableView } from ".";
import { CalendarView } from "./CalendarView";
import { DictionaryView } from "./DictionaryView";

export function EntitiesView() {
  const { type, item_id } = useParams();

  return (
    <>
      <div className="flex h-12 items-center justify-between">
        <Breadcrumbs />
        {item_id ? (
          <div className="w-fit">
            <Button icon={IconEnum.edit} label="Edit current" onClick={undefined} />
          </div>
        ) : null}
      </div>

      {!!item_id && type === "characters" ? <CharacterProfileView /> : null}
      {!!item_id && type === "documents" ? <DocumentView editable /> : null}
      {!!item_id && type === "maps" ? <MapView /> : null}
      {!!item_id && type === "graphs" ? <Graph /> : null}
      {!!item_id && type === "calendars" ? <CalendarView /> : null}
      {/* {!!item_id && type === "timelines" ? <TimelineView /> : null} */}
      {!!item_id && type === "dictionaries" ? <DictionaryView /> : null}
      {!!item_id && type === "random_tables" ? <RandomTableView /> : null}
    </>
  );
}
