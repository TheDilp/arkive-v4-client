import { useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { Breadcrumbs, Button, Graph, Input, Select } from "../../components";
import { useHasPermissions } from "../../hooks";
import { AvailableEntityType, DrawerContentCreateNewType } from "../../types";
import {
  drawerAtom,
  getPermissionsForTypeView,
  getSingularEntityType,
  hasEntityUpdatePermissionForEntityView,
  IconEnum,
  isProjectOwnerAtom,
  navbarTitleAtom,
} from "../../utils";
import { MapView, RandomTableView } from ".";
import { BlueprintInstanceView } from "./BlueprintInstanceView";
import { CalendarView } from "./CalendarView";
import { DictionaryView } from "./DictionaryView";
import DocumentView from "./DocumentView";

export function EntitiesView() {
  const { project_id, type, item_id } = useParams();

  const isProjectOwner = useAtomValue(isProjectOwnerAtom);

  const canUpdateEntity = useAtomValue(hasEntityUpdatePermissionForEntityView);

  const entityName = getSingularEntityType(type as AvailableEntityType);
  const setDrawer = useSetAtom(drawerAtom);
  const navbarTitle = useAtomValue(navbarTitleAtom);
  const permissions = useHasPermissions(
    getPermissionsForTypeView(type === "blueprints" ? "blueprint_instances" : (type as AvailableEntityType)),
    undefined,
  );
  const [arkived, setArkived] = useState<"active" | "arkive">(ls.get("blueprint_instance-table-active") || "active");
  const [filter, setFilter] = useState("");

  return (
    <div className="flex h-full flex-col gap-y-2">
      <div className="flex h-12 min-h-[3rem] items-center justify-between">
        <div className="flex w-full items-start justify-between">
          <Breadcrumbs />
          {item_id ? (
            <div className="flex justify-end gap-x-2">
              {type === "blueprints" && item_id ? (
                <div>
                  <Input
                    isClearable
                    name="quick_filter"
                    onChange={({ value }) => setFilter(value as string)}
                    placeholder="Quick search by title"
                    type="search"
                    value={filter}
                  />
                </div>
              ) : null}
              {type === "blueprints" ? (
                <div className="ml-auto w-32">
                  <Select
                    name="view"
                    onChange={({ value }) => {
                      setArkived(value as "active" | "arkive");
                      ls.set("blueprint_instance-table-active", value);
                    }}
                    options={[
                      { label: "Active", value: "active", icon: IconEnum.eye },
                      { label: "Arkived", value: "arkive", icon: IconEnum.archive },
                    ]}
                    placeholder="Active or arkived"
                    value={arkived}
                  />
                </div>
              ) : null}
              <div className="w-52">
                <Button
                  icon={IconEnum.edit}
                  isDisabled={!canUpdateEntity && !isProjectOwner}
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
                    isDisabled={!navbarTitle || !permissions?.create_blueprint_instances}
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
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {!!item_id && type === "documents" ? <DocumentView editable /> : null}
      {!!item_id && type === "maps" ? <MapView /> : null}
      {!!item_id && type === "graphs" ? <Graph /> : null}
      {!!item_id && type === "blueprints" ? <BlueprintInstanceView arkived={arkived} filter={filter} /> : null}
      {!!item_id && type === "calendars" ? <CalendarView /> : null}
      {!!item_id && type === "dictionaries" ? <DictionaryView /> : null}
      {!!item_id && type === "random_tables" ? <RandomTableView /> : null}
    </div>
  );
}
