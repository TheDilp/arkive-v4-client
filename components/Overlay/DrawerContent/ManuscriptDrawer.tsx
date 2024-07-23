import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useHasPermissions, useUpdateEntity } from "../../../hooks";
import { TabType, UserHasPermissionsType } from "../../../types";
import { AvailableManuscriptEntityTypes, ManuscriptType } from "../../../types/EntityTypes/manuscriptTypes";
import { AvailableManuscriptEntityTypesEnum, createOrEditPermission, getDefaultEntityIcon, IconEnum } from "../../../utils";
import {
  InsertManuscriptSchema,
  InsertManuscriptType,
  UpdateManuscriptSchema,
  UpdateManuscriptType,
} from "../../../validation/manuscripts";
import { EntityPermission } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, Select, TagInput } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Icon, Skeleton } from "../../Misc";

type Props = {
  data: {
    id?: string;
    preselectedTab?: number;
  };
};

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

  const [manuscript, setManuscript] = useState<Partial<ManuscriptType>>({});
  const [entities, setEntities] = useState<
    { id: string; image_id: string; title: string; related_id: string; sort: number; type: AvailableManuscriptEntityTypes }[]
  >([]);
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

          <div className="flex items-center justify-between">
            <span>Add:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isIconOnly
                onClick={() => {
                  setEntities((prev) =>
                    prev.concat({
                      title: "",
                      related_id: "",
                      image_id: "",
                      id: crypto.randomUUID(),
                      type: "documents",
                      sort: entities.length,
                    })
                  );
                }}
                variant="info"
              />
            </div>
          </div>

          <DragDropContext
            onDragEnd={(result) => {
              const sourceIndex = result.source.index;
              const destinationIndex = result?.destination?.index;

              if (typeof destinationIndex === "number") {
                setEntities((prev) => {
                  const temp = [...prev];
                  const toMove = temp.splice(sourceIndex, 1)?.[0];
                  temp.splice(destinationIndex, 0, toMove);
                  return temp;
                });
              }
            }}>
            <Droppable droppableId="manuscript">
              {(providedDroppable) => (
                <div className="flex flex-col" ref={providedDroppable.innerRef} {...providedDroppable.droppableProps}>
                  {entities.map((entity, index) => {
                    return (
                      <Draggable draggableId={entity.id} index={index} key={entity.id}>
                        {(providedDraggable) => (
                          <div
                            className="my-1 flex items-center gap-x-2"
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}>
                            <span {...providedDraggable.dragHandleProps}>
                              <Icon fontSize={24} icon={IconEnum.menu} />
                            </span>
                            {entity.related_id === "" ? (
                              <>
                                <div className="flex-1">
                                  <Search
                                    name="related_id"
                                    onChange={({ label, value, image }) => {
                                      setEntities((prev) => {
                                        const temp = [...prev];
                                        temp[index].title = label as string;
                                        temp[index].related_id = value as string;
                                        if (image) temp[index].image_id = image;
                                        return temp;
                                      });
                                    }}
                                    searchEntity={entity.type}
                                  />
                                </div>
                                <div className="w-1/3">
                                  <Select
                                    name="type"
                                    onChange={({ value }) =>
                                      setEntities((prev) => {
                                        const temp = [...prev];
                                        temp[index].type = value as AvailableManuscriptEntityTypes;
                                        return temp;
                                      })
                                    }
                                    options={AvailableManuscriptEntityTypesEnum}
                                    value={entity.type}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="flex-1">
                                <EntityPreview
                                  clearAction={() => setEntities((prev) => prev.toSpliced(index, 1))}
                                  icon={getDefaultEntityIcon(entity.type)}
                                  id={entity.related_id}
                                  image_id={entity.image_id}
                                  title={entity.title}
                                  type={entity.type}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {providedDroppable.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
          isDisabled={isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Update" : "Create"}
          onClick={() => {
            if (manuscript) {
              if (data?.id) {
                const parsed = UpdateManuscriptSchema.parse({
                  data: { id: data.id, title: manuscript.title, is_public: manuscript.is_public },
                  relations: {
                    characters: manuscript?.characters,
                    blueprint_instances: manuscript?.blueprint_instances,
                    documents: manuscript?.documents,
                    maps: manuscript?.maps,
                    map_pins: manuscript?.map_pins,
                    graphs: manuscript?.graphs,
                    events: manuscript?.events,
                    images: manuscript?.images,
                    tags: (manuscript?.tags || []).map((t) => ({ id: t.id })),
                  },
                });
                update(parsed);
              } else {
                const relations = entities.reduce(
                  (prev, curr, currIndex) => {
                    const formatted = { related_id: curr.related_id, sort: currIndex, id: curr.id };
                    prev[curr.type].push(formatted);

                    return prev;
                  },
                  {
                    characters: [],
                    blueprint_instances: [],
                    documents: [],
                    maps: [],
                    map_pins: [],
                    graphs: [],
                    events: [],
                    images: [],
                    tags: [],
                  } as Pick<
                    ManuscriptType,
                    | "characters"
                    | "blueprint_instances"
                    | "documents"
                    | "maps"
                    | "map_pins"
                    | "graphs"
                    | "events"
                    | "images"
                    | "tags"
                  >
                );
                const parsed = InsertManuscriptSchema.parse({
                  data: { title: manuscript.title, project_id },
                  relations,
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
