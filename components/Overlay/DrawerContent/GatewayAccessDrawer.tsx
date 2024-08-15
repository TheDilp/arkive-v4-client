import { createColumnHelper } from "@tanstack/react-table";
import uniqBy from "lodash.uniqby";
import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateEntity,
  useGetEntities,
  useGetEntity,
  useGetImages,
  useGrantGatewayAccess,
  useHandleChange,
  useTable,
  useToggledResetAtom,
  useUpdateEntity,
} from "../../../hooks";
import {
  CharacterType,
  DrawerAtomType,
  ImageType,
  RequestFilterType,
  RequestOrderByType,
  TabType,
  TagType,
} from "../../../types";
import { CreateConfigType, GatewayConfigType } from "../../../types/EntityTypes/gatewayTypes";
import { AllEntities, AvailableIcons, getAvatarInitials, getParentEntityType, IconEnum, TextFilters } from "../../../utils";
import {
  InsertGatewayConfigurationSchema,
  InsertGatewayConfigurationType,
  UpdateGatewayConfigurationSchema,
  UpdateGatewayConfigurationType,
} from "../../../validation/gateway_configuration";
import { Table } from "../../DataDisplay";
import { Button, Checkbox, Input, Select, TagInput, Title } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Alert, Avatar, Icon, Skeleton } from "../../Misc";

type Props = {
  data: {
    entity_id?: string;
    configuration_id?: string;
    gateway_type?: "create" | "update";
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
  | "random_tables"
  | "tags";
const characterColumnHelper = createColumnHelper<CharacterType>();
const columnHelper = createColumnHelper<{
  id: string;
  title: string;
  full_name: string;
  icon?: string;
  blueprint?: { icon?: string };
}>();

function getColumns(type: AvailableGatewayEntites, selection: string[] = [], setSelection: (id: string | string[]) => void) {
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
              image_id={row.original?.portrait_id}
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
            <Avatar hasShowImage image_id={row.original?.portrait_id} isBordered isTooltipDisabled size="sm" />
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

function getSaveButtonLabel(config: Props) {
  if (config.exceptions?.gatewayConfiguration) {
    if (config?.data?.configuration_id) return "Save";
    return "Create";
  }
  if (config?.data?.gateway_type === "create") return "Copy create access link";
  if (config?.data?.gateway_type === "update") return "Copy edit access link";
  return "Save";
}
function getSaveButtonIcon(config: Props) {
  if (config.exceptions?.gatewayConfiguration) {
    if (config?.data?.configuration_id) return IconEnum.save;
    return IconEnum.add;
  }
  return IconEnum.copy;
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
  gateway_type,
  configuration_id,
  selection,
  setSelection,
}: {
  gateway_type?: "create" | "update";
  configuration_id?: string;
  selection: Record<AvailableGatewayEntites, string[]>;
  setSelection: Dispatch<SetStateAction<Record<AvailableGatewayEntites, string[]>>>;
}) {
  const { project_id } = useParams();

  const tabs: TabType[] =
    gateway_type === "create" ? [{ id: "tags", label: "Tags", icon: IconEnum.tags }, ...entityTabs] : entityTabs;

  const [selectedTab, setSelectedTab] = useState(0);
  const entityType = tabs[selectedTab].id as AvailableGatewayEntites;
  const [filter, setFilter] = useState("");
  const [parentId, setParentId] = useState("");
  const [tags, setTags] = useState<Omit<TagType, "permissions" | "owner_id" | "deleted_at">[]>([]);
  const { data: parents, isFetching: isFetchingParent } = useGetEntities<{ id: string; title: string; icon: string }>(
    { data: { project_id }, fields: ["id", "title", "icon"], orderBy: [{ field: "title", sort: "asc" }] },
    getParentEntityType(entityType as "blueprint_instances" | "map_pins" | "events") as "blueprints" | "maps" | "calendars",
    {
      enabled: entityType === "blueprint_instances" || entityType === "map_pins" || entityType === "events",
    }
  );
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
      enabled: entityType !== "images" && entityType !== "tags" && !configuration_id,
      prefetch: true,
    }
  );

  const { data: images } = useGetImages<ImageType>(
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

  useLayoutEffect(() => {
    if (entityType === "blueprint_instances" || entityType === "map_pins" || entityType === "events") {
      if (parentId) {
        dispatch({
          type: "setFilter",
          payload: { and: [{ id: "p-id", header_name: "Blueprint", field: "parent_id", value: parentId, operator: "eq" }] },
        });
      } else {
        dispatch({
          type: "removeFilterByField",
          payload: "parent_id",
        });
      }
    }
  }, [parentId]);

  useLayoutEffect(() => {
    setParentId("");
  }, [entityType]);

  return (
    <div className="flex max-h-[90%] flex-1 flex-col gap-y-2 [&>div>ul>li>button]:bg-zinc-900">
      <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "tags" ? null : (
        <div className="flex items-center gap-x-2">
          <Input isClearable label="Filter" name="filter" onChange={({ value }) => setFilter(value as string)} value={filter} />
          {entityType === "blueprint_instances" || entityType === "map_pins" || entityType === "events" ? (
            <Select
              hasSearch
              isClearable
              isDisabled={isFetchingParent}
              isLoading={isFetchingParent}
              label="Filter by parent"
              name="parent_id"
              onChange={({ value }) => setParentId(value as string)}
              options={(parents?.data || []).map((bp) => ({
                label: bp.title,
                value: bp.id,
                icon: bp.icon as AvailableIcons | undefined,
              }))}
              value={parentId}
            />
          ) : null}
        </div>
      )}
      {tabs[selectedTab].id === "tags" ? (
        <div className="flex flex-col gap-y-2">
          <TagInput
            handleChange={({ value }) => {
              setTags(value);
              setSelection((prev) => ({ ...prev, tags: value.map((t) => t.id) }));
            }}
            label="Tags"
            tags={tags}
          />
        </div>
      ) : (
        <Table
          columns={getColumns(
            entityType as AvailableGatewayEntites,
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
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GatewayAccessDrawer({ data, exceptions }: Props) {
  const { project_id } = useParams();

  const [createConfig, setCreateConfig] = useState<CreateConfigType>({
    is_locked: false,
    first_name: "",
    last_name: "",
    title: "",
  });
  const [title, setTitle] = useState("");
  const [selection, setSelection] = useState<Record<AvailableGatewayEntites, string[]>>({
    characters: [],
    blueprint_instances: [],
    documents: [],
    maps: [],
    map_pins: [],
    events: [],
    images: [],
    random_tables: [],
    tags: [],
  });
  const [configId, setConfigId] = useState<string>(data?.configuration_id || "custom");
  const [access, setAccess] = useState<{ code: string; link: string } | undefined>();

  const { mutate: grantAccess, isLoading: isGrantingAccess } = useGrantGatewayAccess();
  const { data: gatewayConfigurations } = useGetEntities<GatewayConfigType>(
    { data: { project_id }, fields: ["id", "title"], relations: { entities: true } },
    "gateway_configurations",
    { enabled: data?.gateway_type === "create" || data?.gateway_type === "update" }
  );

  const { data: existingConfiguration, isInitialLoading } = useGetEntity<GatewayConfigType>(
    data?.configuration_id,
    "gateway_configurations",
    {
      fields: ["id", "title"],
      relations: {
        entities: true,
      },
    },
    { enabled: !!data.configuration_id }
  );

  const { mutate: create, isLoading: isCreating } = useCreateEntity<InsertGatewayConfigurationType>("gateway_configurations");
  const { mutate: update, isLoading: isUpdating } = useUpdateEntity<UpdateGatewayConfigurationType>(
    "gateway_configurations",
    project_id
  );
  const saveButtonLabel = getSaveButtonLabel({ data, exceptions });
  const configOptions = (gatewayConfigurations?.data || []).map((conf) => ({ value: conf.id, label: conf.title }));
  configOptions.unshift({ label: "Custom", value: "custom" });

  const resetDrawerAtom = useToggledResetAtom();

  useEffect(() => {
    if (configId) {
      if (existingConfiguration?.data) {
        setTitle(existingConfiguration?.data?.title);
      }
      const config =
        existingConfiguration?.data || (gatewayConfigurations?.data || []).find((config) => config?.id === configId);
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
          tags: [],
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
  }, [configId, existingConfiguration?.data]);

  const { handleChange } = useHandleChange({ data: createConfig, setData: setCreateConfig });

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      {access ? (
        <div className="flex flex-col gap-y-4">
          <Alert
            // eslint-disable-next-line quotes
            label={'By closing this drawer or clicking on "Create new gateway" you will lose access to this link and its code.'}
            variant="warning-bordered"
          />
          <div className="flex flex-col gap-y-2">
            <Title isDrawerTitle label="Access link" size="2xl" />
            <div className="flex flex-nowrap items-center justify-between">
              <Title label={access.link} />
              <div>
                <Button
                  icon={IconEnum.copy}
                  label="Copy"
                  onClick={() => navigator.clipboard.writeText(access.link)}
                  variant="info"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <Title isDrawerTitle label="Access code" size="2xl" />
            <div className="flex flex-nowrap items-center justify-between">
              <Title label={access.code} size="4xl" />
              <div>
                <Button
                  icon={IconEnum.copy}
                  label="Copy"
                  onClick={() => navigator.clipboard.writeText(access.code)}
                  variant="info"
                />
              </div>
            </div>
          </div>
          <Button icon={IconEnum.gateway} label="Create new gateway" onClick={() => setAccess(undefined)} variant="success" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-2">
            <Input
              label="First name"
              name="first_name"
              onChange={handleChange}
              value={"first_name" in createConfig ? createConfig?.first_name : createConfig?.title}
            />
            <div className="flex flex-nowrap gap-x-2">
              <Input
                label="Last name"
                name="last_name"
                onChange={handleChange}
                value={"last_name" in createConfig ? createConfig?.last_name : createConfig?.title}
              />
              <span className="self-end pb-2">
                <Checkbox
                  label="Locked"
                  name="is_locked"
                  onChange={handleChange}
                  tooltip="If checked the user won't be able to edit these properties"
                  value={createConfig.is_locked}
                />
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-y-2 overflow-hidden">
            <Title isDrawerTitle label="Grant access to" size="xl" />
            <Select
              isClearable
              label="Select premade configuration (optional)"
              name="config_id"
              onChange={({ value }) => setConfigId(value as string)}
              options={configOptions}
              value={configId}
            />

            {(configId && selection) || !data?.entity_id ? (
              <EntitiesAccess
                configuration_id={data?.configuration_id}
                gateway_type={data?.gateway_type}
                selection={selection}
                setSelection={setSelection}
              />
            ) : null}
          </div>
          <div>
            <Button
              icon={getSaveButtonIcon({ data, exceptions })}
              isDisabled={isCreating || isUpdating || isGrantingAccess}
              isLoading={isCreating || isUpdating || isGrantingAccess}
              label={saveButtonLabel}
              onClick={() => {
                if (exceptions?.gatewayConfiguration) {
                  if (data?.configuration_id) {
                    const parsed = UpdateGatewayConfigurationSchema.parse({
                      data: {
                        id: existingConfiguration?.data?.id,
                        title: title,
                      },
                      relations: getRelationsForGatewayConfig(selection || {}),
                    });
                    update(parsed, { onSuccess: resetDrawerAtom });
                  } else {
                    const parsed = InsertGatewayConfigurationSchema.parse({
                      data: {
                        title: title,
                        gateway_type: "characters",
                        project_id,
                      },
                      relations: getRelationsForGatewayConfig(selection || {}),
                    });
                    create(parsed, { onSuccess: resetDrawerAtom });
                  }
                } else {
                  if (data?.gateway_type === "update" && data?.entity_id)
                    grantAccess(
                      {
                        data: {
                          type: data.type,
                          id: data?.entity_id,
                          gateway_type: "update",
                          config: getRelationsForGatewayConfig(selection || {}),
                        },
                      },
                      {
                        onSuccess: async (res: { code: string; link: string }) => {
                          setAccess(res);
                        },
                      }
                    );
                  else if (data?.gateway_type === "create")
                    grantAccess(
                      {
                        data: {
                          type: data.type,
                          gateway_type: "create",
                          create_config: createConfig,
                          config: getRelationsForGatewayConfig(selection || {}),
                        },
                      },
                      {
                        onSuccess: async (res: { code: string; link: string }) => {
                          setAccess(res);
                        },
                      }
                    );
                }
              }}
              variant="success"
            />
          </div>
        </>
      )}
    </DrawerLayout>
  );
}
