import { useSetAtom } from "jotai";
import { useParams } from "react-router-dom";

import { Breadcrumbs, Button, Graph } from "../../components";
import { AvailableEntityType, DrawerContentCreateNewType } from "../../types";
import { drawerAtom, getEntityNameFromType, IconEnum } from "../../utils";
import { CharacterProfileView, DocumentView, MapView, RandomTableView } from ".";
import { CalendarView } from "./CalendarView";
import { DictionaryView } from "./DictionaryView";

export function EntitiesView() {
  const { project_id, type, item_id } = useParams();
  const entityName = getEntityNameFromType(type as AvailableEntityType);

  const setDrawer = useSetAtom(drawerAtom);
  return (
    <div className="flex h-full flex-col gap-y-2">
      <div className="flex h-12 items-center justify-between ">
        <Breadcrumbs />
        {item_id ? (
          <div className="w-52">
            <Button
              icon={IconEnum.edit}
              label={`Edit current ${entityName}`}
              onClick={() => {
                setDrawer((prev) => ({
                  ...prev,
                  size: "lg",
                  title: `Edit ${entityName}`,
                  type: type as DrawerContentCreateNewType,
                  data: { id: item_id as string, project_id: project_id as string },
                }));
              }}
            />
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
    </div>
  );
}
