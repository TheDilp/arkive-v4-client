import { createColumnHelper } from "@tanstack/react-table";
import uniqBy from "lodash.uniqby";
import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateEntity,
  useGetEntities,
  useGetImages,
  useGrantGatewayAccess,
  useTable,
  useToggledResetAtom,
} from "../../../hooks";
import { CharacterType, DrawerAtomType, RequestFilterType, RequestOrderByType, TabType } from "../../../types";
import { GatewayConfigType } from "../../../types/EntityTypes/gatewayTypes";
import { AllEntities, AvailableIcons, getAvatarInitials, getImageURL, IconEnum, TextFilters } from "../../../utils";
import { InsertGatewayConfigurationSchema, InsertGatewayConfigurationType } from "../../../validation/gateway_configuration";
import { Table } from "../../DataDisplay";
import { Button, Checkbox, Input, Select, Title } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Avatar, Icon } from "../../Misc";

type Props = {
  data: {
    entity_id?: string;
    configuration_id?: string;
    type: "characters" | "blueprint_instances";
  };
  exceptions: DrawerAtomType["exceptions"];
};
type AvailableGatewayEntites =
  | "characters"
  | "blueprint_instances"
  | "documents"
  | "maps"
  | "map_pins"
  | "events"
  | "images"
  | "random_tables";
const characterColumnHelper = createColumnHelper<CharacterType>();
const columnHelper = createColumnHelper<{
  id: string;
  title: string;
  full_name: string;
  icon?: string;
  blueprint?: { icon?: string };
}>();

function getColumns(
  type: AvailableGatewayEntites,
  project_id: string,
  selection: string[] = [],
  setSelection: (id: string | string[]) => void
) {
  const finalColumns = [];

  finalColumns.push(
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          isDisabled={table.getRowCount() === 0}
          name="selectAll"
          onChange={() => {
            const ids = table.getPaginationRowModel().flatRows.map((row) => row.original.id);
            setSelection(ids);
          }}
          value={table.getPaginationRowModel().flatRows.every((row) => selection.includes(row.id))}
        />
      ),

      cell: ({ row }) => {
        return (
          <Checkbox
            name={row.id}
            onChange={() => {
              setSelection(row.original.id);
            }}
            value={selection.includes(row.original.id)}
          />
        );
      },
      meta: {
        centered: true,
      },
    })
  );

  if (type === "characters") {
    finalColumns.push(
      characterColumnHelper.display({
        id: "portrait_id",
        header: "Portrait",
        cell: ({ row }) => (
          <div className="flex w-full items-center justify-center">
            <Avatar
              hasShowImage
              image={getImageURL(project_id, "images", row.original?.portrait_id || "")}
              initials={getAvatarInitials(row.original.full_name)}
              isBordered
              isTooltipDisabled
              label={row.original.full_name}
              size="sm"
            />
          </div>
        ),
        meta: {
          pinned: true,
          noLink: true,
          centered: true,
        },
        minSize: 4.5,
        maxSize: 4.5,
      })
    );
  }

  if (type === "images") {
    finalColumns.push(
      characterColumnHelper.display({
        id: "id",
        header: "",
        cell: ({ row }) => (
          <div className="flex w-full items-center justify-center">
            <Avatar
              hasShowImage
              image={getImageURL(project_id, "images", row.original?.id || "")}
              isBordered
              isTooltipDisabled
              size="sm"
            />
          </div>
        ),
        meta: {
          pinned: true,
          noLink: true,
          centered: true,
        },
        minSize: 4.5,
        maxSize: 4.5,
      })
    );
  }

  finalColumns.push(
    columnHelper.accessor(type === "characters" ? "full_name" : "title", {
      id: type === "characters" ? "full_name" : "title",
      header: type === "characters" ? "Full name" : "Title",
      cell: ({ row }) => (
        <span className="flex items-center gap-x-2">
          {row.original.icon || row.original?.blueprint?.icon ? (
            <Icon fontSize={24} icon={(row.original.icon || row.original?.blueprint?.icon) as AvailableIcons} />
          ) : (
            ""
          )}
          {`${row.original.full_name || row.original.title}`}
        </span>
      ),
      meta: {
        pinned: true,
        sortable: true,
        filterOptions: TextFilters,
      },
      minSize: 12,
    })
  );
  return finalColumns;
}
function getEntityFields(type: AvailableGatewayEntites) {
  if (type === "characters") return ["id", "portrait_id", "full_name"];
  if (type === "blueprint_instances" || type === "images") return ["id", "title"];
  if (type === "events" || type === "random_tables") return ["id", "title"];
  return ["id", "title", "icon"];
}

function getOrderBy(type: AvailableGatewayEntites, orderBy: RequestOrderByType<any>[] | undefined) {
  if (type === "characters") return orderBy || [{ field: "full_name", sort: "asc" }];

  if (type === "blueprint_instances")
    return [
      ...(orderBy || [
        { field: "parent_id", sort: "asc" },
        { field: "title", sort: "asc" },
      ]),
    ];

  return orderBy || [{ field: "title", sort: "asc" }];
}
function getFilters(type: AvailableGatewayEntites, filter: string) {
  const filters = { and: [], or: [] } as { and: RequestFilterType[]; or: RequestFilterType[] };
  if (filter) {
    if (type === "characters") {
      filters.and.push({ id: "full_name", header_name: "full name", field: "full_name", operator: "ilike", value: filter });
    } else {
      filters.and.push({ id: "title_filter", header_name: "title", field: "title", operator: "ilike", value: filter });
    }
  }
  if (type === "map_pins") {
    filters.and.push({
      id: "map_pin_title_filter",
      header_name: "Map pin title",
      field: "title",
      operator: "is not",
      value: null,
    });
  }
  return filters;
}

const entityTabs: TabType[] = [
  { id: "characters" as const, label: "Characters", icon: IconEnum.character },
  { id: "blueprint_instances" as const, label: "Blueprints", icon: IconEnum.blueprint },
  { id: "documents" as const, label: "Documents", icon: IconEnum.document },
  { id: "maps" as const, label: "Maps", icon: IconEnum.map },
  { id: "map_pins" as const, label: "Map pins", icon: IconEnum.map_pin },
  { id: "events" as const, label: "Events", icon: IconEnum.event },
  { id: "images" as const, label: "Images", icon: IconEnum.image },
  { id: "random_tables" as const, label: "Random tables", icon: IconEnum.random_table },
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

function getRelationsForGatewayConfig(relations: Record<string, string[]>) {
  const keys = Object.keys(relations);

  const final: Record<string, string[]> = {};

  for (let index = 0; index < keys.length; index++) {
    const values = Object.values(relations[keys[index]]).flat();

    final[keys[index]] = uniqBy(values || [], (o) => o.toLowerCase());
  }

  return final;
}
function EntitiesAccess({
  selection,
  setSelection,
}: {
  selection: Record<AvailableGatewayEntites, string[]>;
  setSelection: Dispatch<SetStateAction<Record<AvailableGatewayEntites, string[]>>>;
}) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const entityType = entityTabs[selectedTab].id as AvailableGatewayEntites;
  const [filter, setFilter] = useState("");
  const [{ pagination, selection: tableSelection, orderBy, filters }, dispatch] = useTable({
    selection: {},
    pagination: { page: 0, limit: 10 },
  });

  const { data: entitiesData } = useGetEntities(
    {
      data: {
        project_id,
      },
      relations: {
        blueprint: entityType === "blueprint_instances",
      },
      filters,
      orderBy: getOrderBy(entityType, orderBy) as RequestOrderByType<any>[],
      pagination,
      fields: getEntityFields(entityType as AvailableGatewayEntites),
    },
    entityType,
    {
      enabled: entityType !== "images",
      prefetch: true,
    }
  );

  const { data: images } = useGetImages(
    project_id as string,
    "images",
    {
      filters,
      orderBy,
      fields: ["id", "title"],
      pagination,
      permissions: true,
    },
    { enabled: entityType === "images", prefetch: false }
  );

  useEffect(() => {
    const values = Object.values(tableSelection || {}).flat();

    setSelection((prev) => ({ ...prev, [entityType]: values }));
  }, [tableSelection]);

  useLayoutEffect(() => {
    dispatch({
      type: "clearAllFilters",
    });
    dispatch({ type: "setPagination", payload: { page: 0 } });
    if (filter.length >= 3) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: getFilters(entityType, filter),
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    if (entityType === "map_pins" && filter.length < 3) {
      dispatch({
        type: "clearAllFilters",
      });
      dispatch({
        type: "setFilter",
        payload: {
          and: [
            {
              id: "map_pin_title_filter",
              header_name: "Map pin title",
              field: "title",
              operator: "is not",
              value: null,
            },
          ],
        },
      });
    }
    return () => {};
  }, [filter, dispatch, entityType]);

  return (
    <div className="flex max-h-[90%] flex-1 flex-col gap-y-2 [&>div>ul>li>button]:bg-zinc-900">
      <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={entityTabs} />
      <Input isClearable label="Filter" name="filter" onChange={({ value }) => setFilter(value as string)} value={filter} />
      <Table
        columns={getColumns(
          entityType as AvailableGatewayEntites,
          project_id as string,
          Object.values(selection[entityType]).flat(),
          (ids: string | string[]) => {
            if (Array.isArray(ids)) {
              let areAllSelected = true;
              const temp = [...selection[entityType]];
              for (let index = 0; index < ids.length; index++) {
                const idx = selection[entityType].findIndex((item) => item === ids[index]);
                if (idx === -1) {
                  temp.push(ids[index]);
                  if (areAllSelected) areAllSelected = false;
                }
              }
              if (areAllSelected) {
                setSelection((prev) => ({ ...prev, [entityType]: prev[entityType].filter((item) => !temp.includes(item)) }));
              } else {
                setSelection((prev) => ({ ...prev, [entityType]: temp }));
              }
            } else {
              const idx = selection[entityType].findIndex((item) => item === ids);

              if (idx > -1) setSelection((prev) => ({ ...prev, [entityType]: prev[entityType].toSpliced(idx, 1) }));
              else setSelection((prev) => ({ ...prev, [entityType]: prev[entityType].concat(ids) }));
            }
          }
        )}
        config={{
          orderBy,
          selection: { [0]: selection[entityType] },
        }}
        data={(entityType === "images" ? images?.data : entitiesData?.data) || []}
        dispatch={dispatch}
        pagination={pagination}
        type={entityType as AvailableGatewayEntites}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GatewayAccessDrawer({ data, exceptions }: Props) {
  const { project_id } = useParams();
  const [titleOrEmail, setTitleOrEmail] = useState("");
  const [selection, setSelection] = useState<Record<AvailableGatewayEntites, string[]>>({
    characters: [],
    blueprint_instances: [],
    documents: [],
    maps: [],
    map_pins: [],
    events: [],
    images: [],
    random_tables: [],
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const { mutate: grantAccess } = useGrantGatewayAccess();
  const { data: gatewayConfigurations } = useGetEntities<GatewayConfigType>(
    { data: { project_id }, fields: ["id", "title"], relations: { entities: true } },
    "gateway_configurations",
    { enabled: !!data?.entity_id }
  );
  const [configId, setConfigId] = useState<string>("custom");
  const { mutate: create, isLoading: isCreating } = useCreateEntity<InsertGatewayConfigurationType>("gateway_configurations");
  const saveButtonLabel = getSaveButtonLabel({ data, exceptions });
  const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(titleOrEmail);
  const configOptions = (gatewayConfigurations?.data || []).map((conf) => ({ value: conf.id, label: conf.title }));
  configOptions.unshift({ label: "Custom", value: "custom" });
  const resetDrawerAtom = useToggledResetAtom();
  useEffect(() => {
    if (configId) {
      const config = (gatewayConfigurations?.data || []).find((config) => config?.id === configId);

      if (config) {
        const keys = Object.keys(config);
        const newSelection: Record<AvailableGatewayEntites, string[]> = {
          characters: [],
          blueprint_instances: [],
          documents: [],
          maps: [],
          map_pins: [],
          events: [],
          images: [],
          random_tables: [],
        };
        for (let index = 0; index < keys.length; index++) {
          const key = keys[index] as AvailableGatewayEntites;
          if (AllEntities.includes(key)) {
            newSelection[key] = config[key].map((ent) => ent.related_id);
          }
        }
        setSelection(newSelection);
      }
    }
  }, [configId]);

  return (
    <DrawerLayout>
      {data?.entity_id ? null : <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />}
      {tabs[selectedTab].id === "basic_info" || data?.entity_id ? (
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

      {tabs[selectedTab].id === "entities" || data?.entity_id ? (
        <div className="flex flex-1 flex-col gap-y-2 overflow-hidden">
          <Title isDrawerTitle label="Grant access to" size="xl" />
          {data?.entity_id && gatewayConfigurations?.data?.length ? (
            <Select
              isClearable
              label="Select premade configuration (optional)"
              name="config_id"
              onChange={({ value }) => setConfigId(value as string)}
              options={configOptions}
              value={configId}
            />
          ) : null}

          {(configId && selection) || !data?.entity_id ? (
            <EntitiesAccess selection={selection} setSelection={setSelection} />
          ) : null}
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
                relations: getRelationsForGatewayConfig(selection || {}),
              });
              create(parsed);
            } else if (saveButtonLabel === "Grant access") {
              if (data?.entity_id)
                grantAccess({
                  data: {
                    email: titleOrEmail,
                    type: data.type,
                    id: data?.entity_id,
                    config: getRelationsForGatewayConfig(selection || {}),
                  },
                });
            }
            resetDrawerAtom();
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
