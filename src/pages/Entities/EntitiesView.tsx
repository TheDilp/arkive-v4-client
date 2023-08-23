import { useParams } from "react-router-dom";

import { Breadcrumbs, DocumentView, Graph } from "../../components";
import { CharacterFieldTemplates } from "../Settings";
import { MapView } from "./MapView";
import { RandomTableView } from "./RandomTableView";

export function EntitiesView() {
  const { type, item_id } = useParams();

  if (type === "character_fields_templates") return <CharacterFieldTemplates />;

  return (
    <>
      <div className="flex h-10 items-center justify-between">
        <Breadcrumbs />
      </div>

      {!!item_id && type === "documents" ? <DocumentView editable /> : null}
      {!!item_id && type === "maps" ? <MapView /> : null}
      {!!item_id && type === "graphs" ? <Graph /> : null}
      {!!item_id && type === "random_tables" ? <RandomTableView /> : null}
    </>
  );
}
