import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateEntity,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateEntity,
} from "../../../hooks";
import { TabType, TagType, UserHasPermissionsType } from "../../../types";
import {
  AvailableManuscriptEntityTypes,
  FlatManuscriptEntityType,
  ManuscriptType,
} from "../../../types/EntityTypes/manuscriptTypes";
import {
  AvailableIcons,
  AvailableManuscriptEntityTypesEnum,
  buildManuscript,
  createOrEditPermission,
  getDefaultEntityIcon,
  IconEnum,
} from "../../../utils";
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
import { IconPicker } from "../IconPicker";

type Props = {
  data: {
    id?: string;
    preselectedTab?: number;
  };
};

type EntityType = {
  id: string;
  image_id?: string | null;
  title: string;
  related_id: string;
  sort: number;
  type: AvailableManuscriptEntityTypes;
};

function isSaveDisabled(manuscript: Partial<ManuscriptType>, entities: EntityType[]) {
  if (!manuscript.title) return true;
  if (!entities.length) return true;

  if (entities.some((ent) => !ent.related_id || !ent.type)) return true;

  return false;
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
  const [manuscript, setManuscript] = useState<Partial<ManuscriptType>>({});
  const [entities, setEntities] = useState<EntityType[]>([]);
  const resetDrawer = useToggledResetAtom();
  const { data: existingManuscript, isInitialLoading } = useGetEntity<ManuscriptType>(
    data?.id,
    "manuscripts",
    {
      fields: ["id", "icon", "title", "owner_id", "is_public"],
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

  const { handleChange, resetChanges } = useHandleChange({ data: manuscript, setData: setManuscript });

  const tabs = getTabs(permissions, data?.id);
  const { mutate: create, isLoading: isCreating } = useCreateEntity<InsertManuscriptType>("manuscripts");
  const { mutate: update, isLoading: isUpdating } = useUpdateEntity<UpdateManuscriptType>("manuscripts", project_id);

  useLayoutEffect(() => {
    if (existingManuscript?.data && !manuscript?.id) {
      setManuscript(existingManuscript?.data);

      setEntities(buildManuscript(existingManuscript?.data));
    }
  }, [existingManuscript]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex items-center justify-between gap-x-2">
            <Input
              isDisabled={!canCreateOrEdit || isCreating}
              label="Title (required)"
              name="title"
              onChange={handleChange}
              placeholder="Title"
              value={manuscript?.title || ""}
              variant={!manuscript?.title ? "error" : "primary"}
            />
            <div className="self-end pb-1.5">
              <IconPicker
                icon={(manuscript?.icon as AvailableIcons | undefined) || IconEnum.manuscripts}
                isDisabled={!canCreateOrEdit}
                name="icon"
                onChange={handleChange}
              />
            </div>
          </div>
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
                <div ref={providedDroppable.innerRef} className="flex flex-col" {...providedDroppable.droppableProps}>
                  {entities.map((entity, index) => {
                    return (
                      <Draggable key={entity.id} draggableId={entity.id} index={index}>
                        {(providedDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            className="my-1 flex items-center gap-x-2"
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
                                    variant={entity.related_id ? "primary" : "error"}
                                  />
                                </div>
                                <div className="flex w-1/3 items-center gap-x-1">
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
                                  <div>
                                    <Button
                                      hasNoBackground
                                      icon={IconEnum.trash}
                                      iconSize={24}
                                      isIconOnly
                                      onClick={() =>
                                        setEntities((prev) => {
                                          return prev.toSpliced(index, 1);
                                        })
                                      }
                                      size="lg"
                                      variant="error"
                                    />
                                  </div>
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
          isDisabled={isCreating || isUpdating || isSaveDisabled(manuscript, entities)}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Update" : "Create"}
          onClick={() => {
            if (manuscript) {
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
                } as Record<string, FlatManuscriptEntityType[]> & { tags: TagType[] }
              );

              if (manuscript.tags) {
                relations.tags = manuscript.tags;
              }
              if (data?.id) {
                const parsed = UpdateManuscriptSchema.parse({
                  data: {
                    id: data.id,
                    icon: manuscript.icon,
                    title: manuscript.title,
                    is_public: manuscript.is_public ?? null,
                  },
                  relations,
                });
                update(parsed);
              } else {
                const parsed = InsertManuscriptSchema.parse({
                  data: {
                    title: manuscript.title,
                    project_id,
                    is_public: manuscript?.is_public ?? null,
                    icon: manuscript.icon,
                  },
                  relations,
                });
                create(parsed, {
                  onSuccess: () => {
                    resetChanges();
                    setManuscript({});
                    setEntities([]);
                  },
                });
              }
            }
            resetDrawer();
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
