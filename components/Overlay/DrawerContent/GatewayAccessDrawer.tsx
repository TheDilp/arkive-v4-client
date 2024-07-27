import { Dispatch, SetStateAction, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity } from "../../../hooks";
import { BlueprintInstanceView, CharactersView, FolderView } from "../../../pages/Entities";
import { DrawerAtomType, TableSelectionType, TabType } from "../../../types";
import { EntitiesWithFoldersEnum, IconEnum } from "../../../utils";
import { InsertGatewayConfigurationSchema, InsertGatewayConfigurationType } from "../../../validation/gateway_configuration";
import { Button, Input, Select, Title } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";

type Props = {
  data: {
    entity_id?: string;
    configuration_id?: string;
    type: "characters" | "blueprint_instances";
  };
  exceptions: DrawerAtomType["exceptions"];
};

const entityTabs: TabType[] = [
  { id: "characters", label: "Characters", icon: IconEnum.character },
  { id: "blueprints", label: "Blueprints", icon: IconEnum.blueprint },
  { id: "documents", label: "Documents", icon: IconEnum.document },
  { id: "maps", label: "Maps", icon: IconEnum.map },
  { id: "map_pins", label: "Map pins", icon: IconEnum.map_pin },
  { id: "events", label: "Events", icon: IconEnum.event },
  { id: "images", label: "Images", icon: IconEnum.image },
  { id: "random_tables", label: "Random tables", icon: IconEnum.random_table },
];

const tabs: TabType[] = [
  { id: "basic_info", label: "Basic info", icon: IconEnum.info_circle },
  { id: "entities", label: "Entities", icon: IconEnum.gateway },
];

function getSaveButtonLabel(config: Props) {
  if (config.exceptions?.gatewayConfiguration) {
    if (config?.data?.configuration_id) return "Save";
    return "Create";
  }
  return "Grant access";
}

function getRelationsForGatewayConfig(relations: Record<string, TableSelectionType>) {
  const keys = Object.keys(relations);

  const final: Record<string, string[]> = {};

  for (let index = 0; index < keys.length; index++) {
    const values = Object.values(relations[keys[index]]).flat();

    final[keys[index]] = values;
  }

  return final;
}
type FolderTypes = "documents" | "maps" | "random_tables";
function EntitiesAccess({
  selection,
  setSelection,
}: {
  selection: Record<string, TableSelectionType>;
  setSelection: Dispatch<SetStateAction<Record<string, TableSelectionType>>>;
}) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [blueprintFilter, setBlueprintFilter] = useState("");
  return (
    <div className="overflow-hidde flex max-h-[90%] flex-1 flex-col gap-y-2">
      <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={entityTabs} />
      {entityTabs[selectedTab].id === "characters" ? (
        <CharactersView
          areActionsAndFiltersDisabled
          columnVisibility={{
            tags: false,
            age: false,
            is_public: false,
            action: false,
            is_favorite: false,
          }}
          manualSelection={selection[entityTabs[selectedTab].id]}
          setManualSelection={(newSelection) => {
            setSelection((prev) => ({ ...prev, [entityTabs[selectedTab].id]: newSelection }));
          }}
        />
      ) : null}
      {entityTabs[selectedTab].id === "blueprints" ? (
        <>
          <div>
            <Input
              isClearable
              name="quick_filter"
              onChange={({ value }) => setBlueprintFilter(value as string)}
              placeholder="Quick search by title"
              type="search"
              value={blueprintFilter}
            />
          </div>
          <BlueprintInstanceView
            areActionsAndFiltersDisabled
            arkived="active"
            columnVisibility={{
              tags: false,
              age: false,
              is_public: false,
              action: false,
              is_favorite: false,
            }}
            filter={blueprintFilter}
            isAllInstances
            manualSelection={selection[entityTabs[selectedTab].id]}
            setManualSelection={(newSelection) => {
              setSelection((prev) => ({ ...prev, [entityTabs[selectedTab].id]: newSelection }));
            }}
          />
        </>
      ) : null}
      {EntitiesWithFoldersEnum.includes(entityTabs[selectedTab].id) ? (
        <FolderView areActionsAndFiltersDisabled manualType={entityTabs[selectedTab].id as FolderTypes} />
      ) : null}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GatewayAccessDrawer({ data, exceptions }: Props) {
  const { project_id } = useParams();
  const [titleOrEmail, setTitleOrEmail] = useState("");
  const [selection, setSelection] = useState<Record<string, TableSelectionType>>({
    characters: {},
    blueprint_instances: {},
    documents: {},
    maps: {},
    map_pins: {},
    events: {},
    images: {},
    random_tables: {},
  });
  const [selectedTab, setSelectedTab] = useState(0);

  const [configId, setConfigId] = useState<string | null>(null);
  const { mutate: create, isLoading: isCreating } = useCreateEntity<InsertGatewayConfigurationType>("gateway_configurations");
  const saveButtonLabel = getSaveButtonLabel({ data, exceptions });
  const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(titleOrEmail);
  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "basic_info" ? (
        <Input
          helperText={titleOrEmail && !isEmailValid && data?.entity_id ? "Email is not valid" : ""}
          label={data?.entity_id ? "Grant access to (email, required)" : "Title (required)"}
          name="titleOrEmail"
          onChange={({ value }) => setTitleOrEmail(value as string)}
          type={data?.entity_id ? "email" : "text"}
          value={titleOrEmail}
          variant={titleOrEmail && (isEmailValid || !data?.entity_id) ? "primary" : "error"}
        />
      ) : null}

      {tabs[selectedTab].id === "entities" ? (
        <div className="flex flex-1 flex-col gap-y-2 overflow-hidden">
          <Title isDrawerTitle label="Grant access to" size="xl" />

          {data?.entity_id ? (
            <Select
              isClearable
              label="Select premade configuration (optional)"
              name="config_id"
              onChange={({ value }) => setConfigId(value as string)}
              options={[{ value: "test", label: "Config1" }]}
              value={configId}
            />
          ) : null}

          <EntitiesAccess selection={selection} setSelection={setSelection} />
        </div>
      ) : null}
      <div>
        <Button
          isDisabled={!titleOrEmail || isCreating}
          isLoading={isCreating}
          label={saveButtonLabel}
          onClick={() => {
            if (saveButtonLabel === "Create") {
              const parsed = InsertGatewayConfigurationSchema.parse({
                data: {
                  title: titleOrEmail,
                  gateway_type: "characters",
                  project_id,
                },
                relations: getRelationsForGatewayConfig(selection),
              });
              create(parsed);
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
