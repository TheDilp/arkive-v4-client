import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { MapType } from "../../../types";
import { drawerAtom, getImageURL, IconEnum, onDragEnd, useNotifications } from "../../../utils";
import { InsertMapSchema, InsertMapType, UpdateMapSchema, UpdateMapType } from "../../../validation/maps/maps";
import { ImageSelect } from "../../Complex";
import { ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search } from "../../Form";
import { Tabs } from "../../Layout";
import { Badge, Icon, Skeleton } from "../../Misc";

function isDisabled(map: Partial<MapType> & { project_id: string }) {
  if (!map?.title) return true;
  if (!map?.image_id) return true;
  if (map?.map_layers?.length) {
    return map.map_layers.some((layer) => !layer.title || !layer.image?.id);
  }

  return false;
}

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Map layers", icon: IconEnum.map_layers },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];

export function MapDrawer({ data }: { data: { id?: string } }) {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();

  const { data: existingMap, isFetching } = useGetEntity<MapType>(data?.id, "maps", { data: {} }, { enabled: !!data?.id });

  const [map, setMap] = useState<Partial<MapType> & { project_id: string }>(
    existingMap?.data || { project_id: project_id as string },
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: create } = useCreateEntity<InsertMapType>("maps");

  const { mutateAsync: update } = useUpdateEntity<UpdateMapType>("maps", project_id as string);
  const { handleChange } = useHandleChange({ data: map, setData: setMap });

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, indx) => setSelectedTab(indx)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <Input label="Title (required)" name="title" onChange={handleChange} value={map?.title || ""} />
          <ImageSelect
            isIconOnly
            label="Map image (required)"
            name="image_id"
            onChange={handleChange}
            type="maps"
            value={map?.image_id}
          />
          <div className="flex flex-nowrap justify-between">
            <span>Cluster pins:</span>
            <Checkbox name="cluster_pins" onChange={handleChange} value={map?.cluster_pins ?? false} />
          </div>
          <div className="flex flex-nowrap justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={map?.is_public ?? false} />
          </div>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <div className="mt-2 flex flex-col gap-y-2 pr-2">
          <div className="sticky top-0 z-20 flex flex-nowrap justify-between bg-zinc-800">
            <span>Insert new layer:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isIconOnly
                onClick={
                  () => {
                    setMap((prev) => ({
                      ...prev,
                      map_layers: (prev.map_layers || []).concat({
                        id: crypto.randomUUID(),
                        title: "New layer",
                        parent_id: item_id as string,
                        image_id: "",
                        is_public: false,
                      }),
                    }));
                  }
                  // setMonths((prev) =>
                  //   prev.concat([{ id: crypto.randomUUID(), title: "New month", sort: prev.length, days: 0 }]),
                  // )
                }
                variant="info"
              />
            </div>
          </div>
          <DragDropContext
            onDragEnd={(result) =>
              onDragEnd(result, map?.map_layers || [], (newLayers) => handleChange({ name: "map_layers", value: newLayers }))
            }>
            <Droppable droppableId="droppable">
              {(providedDroppable) => (
                <div className="flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                  {map?.map_layers?.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id || item.title + index} index={index}>
                      {(provided, draggableSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          className={`my-1 flex flex-nowrap items-center gap-x-2 bg-zinc-800 ${
                            draggableSnapshot.isDragging ? "rounded shadow-sm" : ""
                          }`}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            left: 16,
                          }}>
                          <div {...provided.dragHandleProps} className="self-end pb-2">
                            <Icon fontSize={24} icon={IconEnum.menu} />
                          </div>
                          <div>
                            <Input
                              label="Layer name (required)"
                              name={`[${index}].title`}
                              onChange={handleChange}
                              placeholder="Eg November"
                              value={item.title}
                            />
                          </div>
                          {item?.image ? (
                            <div className="flex w-full flex-col">
                              <span className="font-lato text-sm text-zinc-300">Layer image (required)</span>
                              <ImagePreview
                                clearAction={() => handleChange({ name: `map_layers[${index}].image`, value: null })}
                                id={item?.image?.id}
                                title={item.image.title}
                                url={getImageURL(project_id as string, "images", item?.image?.id)}
                              />
                            </div>
                          ) : (
                            <ImageSelect
                              isIconOnly
                              label="Layer image (required)"
                              name={`map_layers[${index}].image`}
                              onChange={({ name, label, value }) => {
                                handleChange({ name, value: { id: value, title: label } });
                              }}
                              type="images"
                            />
                          )}
                          <div className="h-10 self-end">
                            <Button
                              hasNoBackground
                              icon={IconEnum.trash}
                              isIconOnly
                              onClick={() =>
                                handleChange({
                                  name: "map_layers",
                                  value: map?.map_layers?.filter((layer) => layer.id !== item.id),
                                })
                              }
                              variant="error"
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {providedDroppable.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : null}
      {selectedTab === 2 ? (
        <div className="flex flex-col gap-y-2">
          <Search
            name="tags"
            onChange={({ name, label, value, color }) => {
              if ((map?.tags || [])?.some((tag) => tag.id === value)) {
                createNotification({
                  title: "Cannot add the same tag twice.",
                  variant: "warning",
                  icon: IconEnum.info_circle,
                  timer: 3,
                });
                return;
              }

              handleChange({
                name,
                value: (map?.tags || []).concat({
                  title: label as string,
                  id: value,
                  project_id: project_id as string,
                  color: color as string,
                }),
              });
            }}
            placeholder="Press enter to search tags"
            searchEntity="tags"
          />

          <div className="flex flex-wrap gap-2">
            {map?.tags?.length
              ? map.tags.map((tag) => (
                  <div key={tag.id} className="w-fit">
                    <Badge
                      clearAction={() => {
                        handleChange({ name: "tags", value: (map?.tags || []).filter((t) => t.id !== tag.id) });
                      }}
                      customColor={tag.color}
                      label={tag.title}
                      size="lg"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isDisabled(map)}
        label={data?.id ? "Save" : "Create"}
        onClick={async () => {
          const { tags, ...rest } = map;
          if (!data?.id) {
            const parsedData = InsertMapSchema.parse({ data: rest, relations: { tags } });
            await create(parsedData);
          } else {
            const parsedData = UpdateMapSchema.parse({ data: rest, relations: { tags } });
            await update(parsedData);
          }

          resetDrawerAtom();
        }}
        variant="success"
      />
    </div>
  );
}
