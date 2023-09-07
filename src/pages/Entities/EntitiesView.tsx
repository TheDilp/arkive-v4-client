import { useParams } from "react-router-dom";

import { Breadcrumbs, Graph } from "../../components";
import { CharacterProfileView, DocumentView, MapView, RandomTableView } from ".";
import { TimelineView } from "./TimelineView";

export function EntitiesView() {
  const { type, item_id } = useParams();

  return (
    <>
      <div className="flex h-10 items-center justify-between">
        <Breadcrumbs />
      </div>

      {!!item_id && type === "characters" ? <CharacterProfileView /> : null}
      {!!item_id && type === "documents" ? <DocumentView editable /> : null}
      {!!item_id && type === "maps" ? <MapView /> : null}
      {!!item_id && type === "graphs" ? <Graph /> : null}
      {!!item_id && type === "random_tables" ? <RandomTableView /> : null}
      {!!item_id && type === "timelines" ? <TimelineView /> : null}
    </>
  );
}
