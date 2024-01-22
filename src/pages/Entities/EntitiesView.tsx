import { useAtomValue, useSetAtom } from "jotai";
import { useParams } from "react-router-dom";

import { Breadcrumbs, Button, Graph } from "../../components";
import { AvailableEntityType, DrawerContentCreateNewType } from "../../types";
import { drawerAtom, getSingularEntityType, IconEnum, navbarTitleAtom } from "../../utils";
import { MapView, RandomTableView } from ".";
import { BlueprintInstanceView } from "./BlueprintInstanceView";
import { CalendarView } from "./CalendarView";
import { DictionaryView } from "./DictionaryView";
import DocumentView from "./DocumentView";

export function EntitiesView() {
  const { project_id, type, item_id } = useParams();
  const entityName = getSingularEntityType(type as AvailableEntityType);
  const setDrawer = useSetAtom(drawerAtom);
  const navbarTitle = useAtomValue(navbarTitleAtom);

  return (
    <div className="flex h-full flex-col gap-y-2">
      <div className="flex h-12 min-h-[3rem] items-center justify-between">
        <div className="flex w-full items-start justify-between">
          <Breadcrumbs />
          {item_id ? (
            <div className="flex justify-end gap-x-2">
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
              {type === "blueprints" ? (
                <div className="w-52">
                  <Button
                    icon={IconEnum.add}
                    isDisabled={!navbarTitle}
                    isLoading={!navbarTitle}
                    label={navbarTitle ? `Create ${navbarTitle.split("|").at(-1)}` : ""}
                    onClick={() =>
                      setDrawer((prev) => ({
                        ...prev,
                        data: {},
                        title: `Create new ${navbarTitle.split("|").at(-1)}`,
                        type: "blueprint_instances",
                        size: "lg",
                      }))
                    }
                  />
                </div>
              ) : (
                false
              )}
            </div>
          ) : null}
        </div>
      </div>
      {!!item_id && type === "documents" ? <DocumentView editable /> : null}
      {!!item_id && type === "maps" ? <MapView /> : null}
      {!!item_id && type === "graphs" ? <Graph /> : null}
      {!!item_id && type === "blueprints" ? <BlueprintInstanceView /> : null}
      {!!item_id && type === "calendars" ? <CalendarView /> : null}
      {!!item_id && type === "dictionaries" ? <DictionaryView /> : null}
      {!!item_id && type === "random_tables" ? <RandomTableView /> : null}
    </div>
  );
}
