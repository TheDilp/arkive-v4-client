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
import { DrawerAtomType, MapType, TabType, UserHasPermissionsType } from "../../../types";
import { createOrEditPermission, getImageURL, IconEnum, onDragEnd } from "../../../utils";
import { InsertMapSchema, InsertMapType, UpdateMapSchema, UpdateMapType } from "../../../validation/maps/maps";
import { FolderSelect, ImageSelect } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, TagInput } from "../../Form";
import { Tabs } from "../../Layout";
import { Icon, Skeleton } from "../../Misc";

function isDisabled(map: Partial<MapType> & { project_id: string }) {
  if (!map?.title) return true;
  if (!map?.image_id) return true;
  if (map?.map_layers?.length) {
    return map.map_layers.some((layer) => !layer.title || !layer.image?.id);
  }

  return false;
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    { id: "2", label: "Map layers", icon: IconEnum.map_layers },
  ];
  if (permissions?.read_tags) {
    tabs.push({ id: "3", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "4", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function MapDrawer({
  data,
  exceptions,
}: {
  data: { id?: string; title?: string };
  exceptions: DrawerAtomType["exceptions"];
}) {
  const { project_id, item_id } = useParams();

  const { data: existingMap, isFetching } = useGetEntity<MapType>(
    data?.id,
    "maps",
    {
      fields: ["id", "icon", "title", "cluster_pins", "image_id", "is_public", "owner_id"],
      relations: { map_pins: true, map_layers: true },
      permissions: true,
    },
    { enabled: !!data?.id, queryKeyConcat: ["drawer"] },
  );

  const permissions = useHasPermissions(["read_maps", "create_maps", "update_maps", "read_tags"], existingMap?.data?.owner_id);

  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_maps,
    permissions?.update_maps,
    permissions?.is_owner,
    data?.id,
  );

  const tabs = getTabs(permissions, data?.id);

  const [map, setMap] = useState<Partial<MapType> & { project_id: string }>(
    existingMap?.data || {
      title: data?.title,
      parent_id: exceptions?.globalCreate ? null : item_id,
      project_id: project_id as string,
    },
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawerAtom = useToggledResetAtom();
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<InsertMapType>("maps");

  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<UpdateMapType>("maps", project_id as string);
  const { handleChange } = useHandleChange({ data: map, setData: setMap });

  useLayoutEffect(() => {
    if (existingMap?.data) setMap(existingMap?.data);
  }, [existingMap]);

  if (isFetching) return <Skeleton type="drawer_form" />;
  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, indx) => setSelectedTab(indx)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <Input
            isDisabled={!canCreateOrEdit}
            label="Title (required)"
            name="title"
            onChange={handleChange}
            value={map?.title || ""}
            variant={map?.title ? "primary" : "error"}
          />
          <ImageSelect
            isDisabled={!canCreateOrEdit}
            isIconOnly
            label="Map image (required)"
            name="image_id"
            onChange={handleChange}
            type="map_images"
            value={map?.image_id}
            variant={map?.image_id ? "primary" : "error"}
          />
          <FolderSelect
            handleChange={handleChange}
            isDisabled={!canCreateOrEdit}
            parent_id={map?.parent_id ?? null}
            type="maps"
          />
          <div className="flex flex-nowrap justify-between">
            <span>Cluster pins:</span>
            <Checkbox
              isDisabled={!canCreateOrEdit}
              name="cluster_pins"
              onChange={handleChange}
              value={map?.cluster_pins ?? false}
            />
          </div>

          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox isDisabled={!canCreateOrEdit} name="is_public" onChange={handleChange} value={map?.is_public ?? false} />
          </div>
        </>
      ) : null}
      {tabs[selectedTab].id === "2" && canCreateOrEdit ? (
        <div className="mt-2 flex flex-col gap-y-2 pr-2">
          <div className="sticky top-0 z-20 flex flex-nowrap items-center justify-between bg-zinc-900">
            <span>Insert new layer:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                isDisabled={!canCreateOrEdit}
                isIconOnly
                onClick={() => {
                  handleChange({
                    name: "map_layers",
                    value: (map.map_layers || []).concat({
                      id: crypto.randomUUID(),
                      title: "New layer",
                      parent_id: map?.id || null,
                      image_id: "",
                      is_public: false,
                    }),
                  });
                }}
                variant="info"
              />
            </div>
          </div>
          <DragDropContext
            onDragEnd={
              canCreateOrEdit
                ? (result) =>
                    onDragEnd(result, map?.map_layers || [], (newLayers) =>
                      handleChange({ name: "map_layers", value: newLayers }),
                    )
                : () => {}
            }>
            <Droppable droppableId="droppable" isDropDisabled={!canCreateOrEdit}>
              {(providedDroppable) => (
                <div className="flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
                  {map?.map_layers?.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id || item.title + index}
                      index={index}
                      isDragDisabled={!canCreateOrEdit}>
                      {(provided, draggableSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          className={`my-1 flex w-full flex-nowrap items-center gap-x-2 ${
                            draggableSnapshot.isDragging ? "ml-8 w-full rounded bg-transparent bg-none shadow-sm" : ""
                          }`}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            left: "calc(100%-3px)",
                            right: 24,
                          }}>
                          <div {...provided.dragHandleProps} className="self-end pb-2">
                            <Icon fontSize={24} icon={IconEnum.menu} />
                          </div>
                          <div>
                            <Input
                              isDisabled={!canCreateOrEdit}
                              label="Layer name (required)"
                              name={`map_layers[${index}].title`}
                              onChange={handleChange}
                              placeholder="Eg New layer"
                              value={item.title}
                              variant={item.title ? "primary" : "error"}
                            />
                          </div>
                          {item?.image ? (
                            <div className="flex w-full flex-col">
                              <span className="font-lato text-sm text-zinc-300">Layer image (required)</span>
                              <ImagePreview
                                clearAction={
                                  canCreateOrEdit
                                    ? () => handleChange({ name: `map_layers[${index}].image`, value: null })
                                    : undefined
                                }
                                id={item?.image?.id}
                                title={item.image.title}
                                url={getImageURL(project_id as string, "map_images", item?.image?.id)}
                              />
                            </div>
                          ) : (
                            <ImageSelect
                              isDisabled={!canCreateOrEdit}
                              isIconOnly
                              label="Layer image (required)"
                              name={`map_layers[${index}].image`}
                              onChange={({ name, label, value }) => {
                                handleChange({ name, value: { id: value, title: label } });
                              }}
                              type="map_images"
                              variant={item?.image?.title && item?.image_id ? "primary" : "error"}
                            />
                          )}
                          <div className="h-10 self-end">
                            <Button
                              hasNoBackground
                              icon={IconEnum.trash}
                              isDisabled={!canCreateOrEdit}
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
      {tabs[selectedTab].id === "3" && permissions?.read_tags ? (
        <TagInput handleChange={handleChange} isDisabled={!canCreateOrEdit} isMultiple tags={map?.tags || []} />
      ) : null}
      {tabs[selectedTab].id === "4" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={map?.owner_id}
          permissions={map?.permissions || []}
          related_id={data?.id || null}
          selectablePermissions={["read_maps", "update_maps", "delete_maps"]}
        />
      ) : null}
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={isDisabled(map) || isCreating || isUpdating || !canCreateOrEdit}
        isLoading={isCreating || isUpdating}
        label={data?.id ? "Save" : "Create"}
        onClick={async () => {
          const { tags, map_layers, ...rest } = map;
          if (!data?.id) {
            const formattedMapLayers = (map_layers || []).map((layer) => ({
              data: {
                id: layer.id,
                title: layer.title,
                image_id: layer?.image?.id,
                is_public: layer.is_public,
                parent_id: item_id as string,
              },
            }));
            const parsedData = InsertMapSchema.parse({
              data: rest,
              relations: { tags, map_layers: formattedMapLayers },
              permissions: rest.permissions,
            });
            await create(parsedData);
          } else {
            const formattedMapLayers = (map_layers || []).map((layer) => ({
              data: {
                id: layer.id,
                title: layer.title,
                image_id: layer?.image?.id,
                is_public: layer.is_public,
                parent_id: item_id as string,
              },
            }));

            const parsedData = UpdateMapSchema.parse({
              data: rest,
              relations: { tags, map_layers: formattedMapLayers },
              permissions: rest.permissions,
            });
            await update(parsedData);
          }

          resetDrawerAtom();
        }}
        variant="success"
      />
    </div>
  );
}
