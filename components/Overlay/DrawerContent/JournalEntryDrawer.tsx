import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateJournalEntry } from "../../../arkive-v4-dyce-vtt/src/hooks";
import { useGetEntity, useHandleChange, useToggledResetAtom, useUpdateEntity } from "../../../hooks";
import { GameJournalEntryType } from "../../../types";
import { AvailableManuscriptEntityTypes, FlatManuscriptEntityType } from "../../../types/EntityTypes/manuscriptTypes";
import { AvailableManuscriptEntityTypesEnum, getDefaultEntityIcon, getSentenceCase, IconEnum } from "../../../utils";
import { InsertJournalEntrySchema, UpdateJournalEntrySchema } from "../../../validation/games/journal_entries";
import { UpdateManuscriptType } from "../../../validation/manuscripts";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Icon, Skeleton } from "../../Misc";
import { Dropdown } from "../Dropdown";

type Props = {
  data: {
    id?: string;
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

function isSaveDisabled(journal_entry: Partial<GameJournalEntryType>, entities: EntityType[]) {
  if (!journal_entry.title) return true;
  if (!entities.length) return true;

  if (entities.some((ent) => !ent.related_id || !ent.type)) return true;

  return false;
}

export function JournalEntryDrawer({ data }: Props) {
  const { game_id } = useParams();
  const [journalEntry, setJournalEntry] = useState<Partial<GameJournalEntryType>>({});
  const [entities, setEntities] = useState<EntityType[]>([]);
  const resetDrawer = useToggledResetAtom();
  const { data: existingGameJournalEntry, isInitialLoading } = useGetEntity<GameJournalEntryType>(
    data?.id,
    "journal_entries",
    {
      fields: ["id", "title"],
    },
    { enabled: !!data?.id }
  );

  const { handleChange, resetChanges } = useHandleChange({ data: journalEntry, setData: setJournalEntry });

  const { mutate: create, isLoading: isCreating } = useCreateJournalEntry();
  const { mutate: update, isLoading: isUpdating } = useUpdateEntity<UpdateManuscriptType>("journal_entries", game_id);

  useLayoutEffect(() => {
    if (existingGameJournalEntry?.data && !journalEntry?.id) {
      setJournalEntry(existingGameJournalEntry?.data);

      // setEntities(buildManuscript(existingGameJournalEntry?.data));
    }
  }, [existingGameJournalEntry]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <>
        <div className="flex items-center justify-between gap-x-2">
          <Input
            isDisabled={isCreating || isUpdating}
            label="Title (required)"
            name="title"
            onChange={handleChange}
            placeholder="Title"
            value={journalEntry?.title || ""}
            variant={!journalEntry?.title ? "error" : "primary"}
          />
        </div>

        <hr className="border-zinc-700" />

        <div className="flex items-center justify-between">
          <span>Add:</span>
          <Dropdown
            allowedPlacements={["left-start", "left-end"]}
            items={[
              {
                id: "new",
                title: "New",
                icon: IconEnum.add,
              },
              {
                id: "existing",
                title: "Existing",
                icon: IconEnum.search,
                subItems: AvailableManuscriptEntityTypesEnum.map((entity) => ({
                  id: entity.type,
                  title: getSentenceCase(entity.type),
                  icon: entity.icon,
                  onClick: () =>
                    setEntities((prev) =>
                      prev.concat({
                        title: "",
                        related_id: "",
                        image_id: "",
                        id: crypto.randomUUID(),
                        type: entity.type,
                        sort: entities.length,
                      })
                    ),
                })),
              },
            ]}>
            <div className="h-8 w-8">
              <Button icon={IconEnum.add} isIconOnly onClick={undefined} variant="info" />
            </div>
          </Dropdown>
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
                              <div className="flex items-center gap-x-1">
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
                                image_id={entity.type === "images" ? entity.related_id : entity.image_id}
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

      <div>
        <Button
          isDisabled={isCreating || isUpdating || isSaveDisabled(journalEntry, entities)}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Update" : "Create"}
          onClick={() => {
            if (journalEntry) {
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
                } as Record<string, FlatManuscriptEntityType[]>
              );

              if (data?.id) {
                const parsed = UpdateJournalEntrySchema.parse({
                  data: {
                    id: data.id,
                    title: journalEntry.title,
                  },
                  relations,
                });
                update(parsed);
              } else {
                const parsed = InsertJournalEntrySchema.parse({
                  data: {
                    title: journalEntry.title,
                    game_id,
                  },
                  relations,
                });
                create(parsed, {
                  onSuccess: () => {
                    resetChanges();
                    setJournalEntry({});
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
