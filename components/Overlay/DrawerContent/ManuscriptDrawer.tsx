import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import cloneDeep from "lodash.clonedeep";
import React, { createContext, Dispatch, SetStateAction, useContext, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useHasPermissions, useUpdateEntity } from "../../../hooks";
import { TabType, UserHasPermissionsType } from "../../../types";
import {
  AvailableManuscriptEntityTypes,
  ManuscriptEntityType,
  ManuscriptType,
} from "../../../types/EntityTypes/manuscriptTypes";
import {
  AvailableManuscriptEntityTypesEnum,
  buildManuscript,
  createOrEditPermission,
  flattenManuscriptEntities,
  getDefaultEntityIcon,
  getSingularEntityType,
  IconEnum,
} from "../../../utils";
import {
  InsertManuscriptSchema,
  InsertManuscriptType,
  UpdateManuscriptSchema,
  UpdateManuscriptType,
} from "../../../validation/manuscripts";
import { EntityPermission } from "../../Complex";
import { Button, Checkbox, Input, Search, Select, TagInput, Title } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Icon, Skeleton } from "../../Misc";

type Props = {
  data: {
    id?: string;
    preselectedTab?: number;
  };
};

const base: Pick<
  ManuscriptEntityType,
  | "character_id"
  | "blueprint_instance_id"
  | "document_id"
  | "map_id"
  | "map_pin_id"
  | "graph_id"
  | "event_id"
  | "image_id"
  | "type"
> = {
  character_id: null,
  blueprint_instance_id: null,
  document_id: null,
  map_id: null,
  map_pin_id: null,
  graph_id: null,
  event_id: null,
  image_id: null,
  type: "documents",
};
function getEntityIdFields(type: AvailableManuscriptEntityTypes, value: string) {
  const newEntity = { ...base };

  newEntity[
    `${getSingularEntityType(type).replaceAll(" ", "_")}_id`.toLowerCase() as
      | "character_id"
      | "blueprint_instance_id"
      | "document_id"
      | "map_id"
      | "map_pin_id"
      | "graph_id"
      | "event_id"
      | "image_id"
  ] = value;

  newEntity.type = type;

  return newEntity;
}

function addById(state: ManuscriptEntityType[], id: string, newElement: ManuscriptEntityType) {
  // Base case: return state if it's not an array
  if (!Array.isArray(state)) return state;
  const temp = cloneDeep(state);

  // Iterate over the state array
  for (let i = 0; i < temp.length; i++) {
    // If the current element's id matches the provided id, add the new element to its children
    if (temp[i].id === id) {
      temp[i].children.push(newElement);
      return temp;
    }
    // If the current element has children, recursively check them
    if (temp[i].children && temp[i].children.length > 0) {
      temp[i].children = addById(temp[i].children, id, newElement);
      // Return early if the element was added in the children
      if (temp[i].children.some((child) => child.id === newElement.id)) {
        return temp;
      }
    }
  }

  return temp;
}
function updateById(
  state: ManuscriptEntityType[],
  id: string,
  updatedElement: ManuscriptEntityType,
  type: AvailableManuscriptEntityTypes
) {
  // Base case: return state if it's not an array
  if (!Array.isArray(state)) return state;
  const temp = cloneDeep(state);

  // Iterate over the state array
  for (let i = 0; i < temp.length; i++) {
    // If the current element's id matches the provided id, update the element
    if (temp[i].id === id) {
      temp[i] = { ...temp[i], ...updatedElement };
      return temp;
    }
    // If the current element has children, recursively check them
    if (temp[i].children && temp[i].children.length > 0) {
      temp[i].children = updateById(temp[i].children, id, updatedElement, type);
      // Return early if the element was updated in the children
      if (temp[i].children.some((child) => child.id === updatedElement.id)) {
        return temp;
      }
    }
  }

  return temp;
}
function removeById(state: ManuscriptEntityType[], id: string) {
  if (!Array.isArray(state)) return state;
  const temp = cloneDeep(state);
  for (let i = 0; i < temp.length; i++) {
    if (temp[i].id === id) {
      temp.splice(i, 1);
      return temp;
    }
    if (temp[i].children && temp[i].children.length > 0) {
      temp[i].children = removeById(temp[i].children, id);
      // Return early if the element was found and removed in the children
      if (temp[i].children === null) {
        temp.splice(i, 1);
        return temp;
      }
    }
  }

  return temp;
}

const ManuscriptContext = createContext<{
  entities: ManuscriptEntityType[];
  setEntities: Dispatch<SetStateAction<ManuscriptEntityType[]>>;
}>({ entities: [], setEntities: () => {} });

function ManuscriptItem({ entity, parentIndex }: { entity: ManuscriptEntityType; parentIndex: number }) {
  const { entities, setEntities } = useContext(ManuscriptContext);
  const [type, setType] = useState<AvailableManuscriptEntityTypes>("documents");
  if (!entity.title)
    return (
      <div className="flex min-h-10 items-center gap-x-2">
        <Search
          label={`Add ${getSingularEntityType(type)}`}
          name="documents"
          onChange={({ value: id, label: title }) => {
            if (title)
              setEntities(
                updateById(
                  entities,
                  entity.id,
                  {
                    id: entity.id,
                    title: title || "",
                    sort: entity.sort,
                    children: entity.children,
                    ...getEntityIdFields(type, id),
                  },
                  type
                )
              );
          }}
          searchEntity={type}
          variant="secondary"
        />
        <div className="min-w-36">
          <Select
            label="Entity type"
            name="type"
            onChange={(e) => setType(e.value as AvailableManuscriptEntityTypes)}
            options={AvailableManuscriptEntityTypesEnum}
            value={type}
          />
        </div>
        <div className="w-min self-end pb-2">
          <Button
            hasNoBackground
            icon={IconEnum.trash}
            isIconOnly
            onClick={() => setEntities((prev) => removeById(prev, entity.id))}
            tooltip="Remove"
            variant="error"
          />
        </div>
      </div>
    );
  if (entity.children.length === 0)
    return (
      <Draggable draggableId={entity.id} index={0}>
        {(providedDraggable, props) => (
          <div
            ref={providedDraggable.innerRef}
            {...providedDraggable.draggableProps}
            className={`flex min-h-10 w-full items-end gap-x-2 border-b border-zinc-700 ${props.isDragging ? "relative left-0 z-10" : ""}`}
            key={entity.id}>
            <span {...providedDraggable.dragHandleProps}>
              <Icon fontSize={24} icon={IconEnum.menu} />
            </span>
            <span className="pb-1">
              <Icon fontSize={22} icon={getDefaultEntityIcon(entity.type)} />
            </span>
            <span className="w-full">
              <Title
                actions={[
                  {
                    variant: "primary",
                    icon: IconEnum.add,
                    tooltip: "Add",
                    onClick: () =>
                      setEntities((prev) =>
                        addById(prev, entity.id, {
                          id: crypto.randomUUID(),
                          title: "",
                          sort: entity.children.length,
                          children: [],
                          ...base,
                        })
                      ),
                  },
                  {
                    variant: "primary",
                    icon: IconEnum.close,
                    tooltip: "Clear",
                    onClick: () =>
                      setEntities((prev) =>
                        updateById(
                          prev,
                          entity.id,
                          {
                            id: entity.id,
                            title: "",
                            sort: entity.sort,
                            children: entity.children,
                            ...base,
                          },
                          type
                        )
                      ),
                  },
                  {
                    variant: "error",
                    icon: IconEnum.trash,
                    tooltip: "Remove",
                    onClick: () => setEntities((prev) => removeById(prev, entity.id)),
                  },
                ]}
                label={entity.title}
                size="lg"
              />
            </span>
          </div>
        )}
      </Draggable>
    );

  return (
    <Draggable draggableId={entity.id} index={0}>
      {(providedDraggable) => (
        <div className="flex w-full flex-1 items-start gap-x-2">
          <span {...providedDraggable.dragHandleProps} className="pt-1.5">
            <Icon fontSize={24} icon={IconEnum.menu} />
          </span>
          <div
            ref={providedDraggable.innerRef}
            {...providedDraggable.draggableProps}
            className="w-full [&>*>div]:bg-transparent [&>details>summary>span>span>svg]:text-[22px] [&>details>summary]:min-h-10">
            <Collapsible
              actions={[
                {
                  variant: "primary",
                  icon: IconEnum.add,
                  tooltip: "Add",
                  onClick: () =>
                    setEntities((prev) =>
                      addById(prev, entity.id, {
                        id: crypto.randomUUID(),
                        title: "",
                        sort: entity.children.length,
                        children: [],
                        ...base,
                      })
                    ),
                },
                {
                  variant: "primary",
                  icon: IconEnum.close,
                  tooltip: "Clear",
                  onClick: () =>
                    setEntities((prev) =>
                      updateById(
                        prev,
                        entity.id,
                        {
                          id: entity.id,
                          title: "",
                          sort: entity.sort,
                          children: entity.children,
                          ...base,
                        },
                        type
                      )
                    ),
                },
                {
                  variant: "error",
                  icon: IconEnum.trash,
                  tooltip: "Remove",
                  onClick: () => setEntities((prev) => removeById(prev, entity.id)),
                },
              ]}
              icon={getDefaultEntityIcon(entity.type)}
              initialOpen
              key={entity.id}
              label={entity.title}
              size="lg">
              <div className="flex flex-col" style={{ paddingLeft: parentIndex * 10 }}>
                {entity.children.length === 0 ? null : (
                  <ManuscriptTree entities={entity.children} id={entity.id} parentIndex={parentIndex + 1} />
                )}
              </div>
            </Collapsible>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function ManuscriptTree({ id, entities, parentIndex }: { id: string; entities: ManuscriptEntityType[]; parentIndex: number }) {
  return (
    <Droppable droppableId={id}>
      {(providedDroppable) => (
        <div className="w-full">
          <div
            {...providedDroppable.droppableProps}
            className={`${parentIndex <= 1 ? "flex flex-col gap-y-2 pl-2" : ""} w-full`}
            ref={providedDroppable.innerRef}>
            {entities.map((entity) => (
              <ManuscriptItem entity={entity} key={entity.id} parentIndex={parentIndex} />
            ))}
          </div>
          {providedDroppable.placeholder}
        </div>
      )}
    </Droppable>
  );
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined) {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];

  if (permissions?.read_tags) {
    tabs.push({ id: "2", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "3", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function ManuscriptDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(data?.preselectedTab || 0);

  const [manuscript, setManuscript] = useState<Pick<
    ManuscriptType,
    "id" | "title" | "is_public" | "owner_id" | "permissions" | "tags"
  > | null>(null);
  const [entities, setEntities] = useState<ManuscriptEntityType[]>([]);
  const { data: existingManuscript, isInitialLoading } = useGetEntity<ManuscriptType>(
    data?.id,
    "manuscripts",
    {
      fields: ["id", "title", "owner_id", "is_public"],
      relations: { entities: true, permissions: true, tags: true },
    },
    { enabled: !!data?.id }
  );
  const permissions = useHasPermissions(
    ["create_manuscripts", "update_manuscripts", "read_tags"],
    existingManuscript?.data?.owner_id
  );
  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_manuscripts,
    permissions?.update_manuscripts,
    permissions?.is_owner,
    data?.id
  );

  const { handleChange } = useHandleChange({ data: manuscript, setData: setManuscript });

  const tabs = getTabs(permissions, data?.id);
  const { mutate: create, isLoading: isCreating } = useCreateEntity<InsertManuscriptType>("manuscripts");
  const { mutate: update, isLoading: isUpdating } = useUpdateEntity<UpdateManuscriptType>("manuscripts", project_id);

  useLayoutEffect(() => {
    if (existingManuscript?.data && !manuscript) {
      setManuscript(existingManuscript?.data);

      setEntities(buildManuscript(existingManuscript?.data?.entities || []));
    } else if (!existingManuscript?.data && !manuscript) {
      setEntities([{ id: crypto.randomUUID(), title: "", sort: 0, children: [], ...base }]);
    }
  }, [existingManuscript]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <Input
            isDisabled={!canCreateOrEdit || isCreating}
            label="Title (required)"
            name="title"
            onChange={handleChange}
            placeholder="Title"
            value={manuscript?.title || ""}
            variant={!manuscript?.title ? "error" : "primary"}
          />
          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox
              isDisabled={!canCreateOrEdit}
              name="is_public"
              onChange={handleChange}
              value={manuscript?.is_public ?? false}
            />
          </div>

          <hr className="border-zinc-700" />

          <ManuscriptContext.Provider value={{ entities: entities, setEntities: setEntities }}>
            <DragDropContext onDragEnd={() => {}}>
              <ManuscriptTree entities={entities} id="base" parentIndex={0} />
            </DragDropContext>
          </ManuscriptContext.Provider>
        </>
      ) : null}
      {tabs[selectedTab].id === "2" ? (
        <TagInput handleChange={handleChange} isAutofocused tags={manuscript?.tags || []} />
      ) : null}
      {tabs[selectedTab].id === "3" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={manuscript?.owner_id}
          permissions={manuscript?.permissions || []}
          related_id={manuscript?.id || null}
          selectablePermissions={["read_manuscripts", "update_manuscripts", "delete_manuscripts"]}
        />
      ) : null}
      <div>
        <Button
          isDisabled={!entities.length || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Update" : "Create"}
          onClick={() => {
            if (manuscript) {
              if (data?.id) {
                const parsed = UpdateManuscriptSchema.parse({
                  data: { id: data.id, title: manuscript.title, is_public: manuscript.is_public },
                  relations: {
                    entities: flattenManuscriptEntities(entities),
                    tags: (manuscript?.tags || []).map((t) => ({ id: t.id })),
                  },
                });
                update(parsed);
              } else {
                const parsed = InsertManuscriptSchema.parse({
                  data: { title: manuscript.title, project_id, is_public: manuscript.is_public },
                  relations: {
                    entities: flattenManuscriptEntities(entities),
                    tags: manuscript.tags.map((t) => ({ id: t.id })),
                  },
                });
                create(parsed);
              }
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
