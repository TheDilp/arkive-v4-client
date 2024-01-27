import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetEntities, useGetSubEntity, useHandleChange, useUpdateMapSubEntity } from "../../../hooks";
import { MapPinType, MapPinTypesType, MapType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertMapPinSchema, InsertMapPinType, UpdateMapPinSchema, UpdateMapPinType } from "../../../validation/maps/map_pins";
import { EntityPreview, ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, Select } from "../../Form";
import { Collapsible, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";
import { ColorPicker, IconPicker } from "..";

type Props = {
  data: { id?: string; lat: number; lng: number };
  exceptions?: {
    characterPin?: boolean;
  };
};

function isSaveDisabled(mapPin: Partial<MapPinType>, { exceptions }: Pick<Props, "exceptions">) {
  if (exceptions?.characterPin) {
    if (!mapPin.character_id) return true;
    return false;
  }
  if (!mapPin.icon && !mapPin.image_id) return true;
  return false;
}

const tabs = [
  {
    id: "1",
    label: "Basic info",
    icon: IconEnum.info_circle,
  },
  {
    id: "2",
    label: "Links",
    icon: IconEnum.link,
  },
];

export function MapPinDrawer({ data, exceptions }: Props) {
  const { project_id, item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [mapPin, setMapPin] = useState<Partial<MapPinType>>({
    parent_id: item_id as string,
  });
  const queryClient = useQueryClient();
  const { data: existingMapPinTypes } = useGetEntities<MapPinTypesType>(
    { data: { project_id }, fields: ["id", "title", "default_icon", "default_icon_color"] },
    "map_pin_types",
  );

  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { data: existingMapPin, isFetching } = useGetSubEntity<MapPinType>(
    data?.id,
    "map_pins",
    {
      data: {},
      fields: [
        "id",
        "title",
        "map_pin_type_id",
        "background_color",
        "border_color",
        "character_id",
        "color",
        "doc_id",
        "icon",
        "image_id",
        "is_public",
        "map_link",
        "show_background",
        "show_border",
      ],
      relations: {
        events: true,
      },
    },
    { enabled: !!data?.id },
  );
  const { mutateAsync: createMapPin, isLoading: isCreating } = useCreateSubEntity<
    InsertMapPinType & { character?: MapPinType["character"] | null }
  >("map_pins", item_id as string);
  const { mutateAsync: updateMapPin, isLoading: isUpdating } = useUpdateMapSubEntity<UpdateMapPinType>(
    "map_pins",
    item_id as string,
  );
  const [character, setCharacter] = useState<MapPinType["character"] | null>(null);
  const { handleChange } = useHandleChange({ data: mapPin, setData: setMapPin });
  useLayoutEffect(() => {
    if (existingMapPin?.data) {
      const { character: char, ...existingMapPinData } = existingMapPin.data;
      setMapPin(existingMapPinData);
      setCharacter(char);
    } else {
      setMapPin({
        id: crypto.randomUUID(),
        parent_id: item_id as string,
        lat: data.lat,
        lng: data.lng,
        background_color: "#000000",
        border_color: "#ffffff",
        show_background: true,
        show_border: true,
        color: "#ffffff",
      });
    }
  }, [existingMapPin]);

  useLayoutEffect(() => {
    if (character) {
      setMapPin((prev) => ({ ...prev, character_id: character.id }));
    }
  }, [character]);

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs
        onChange={(_, index) => setSelectedTab(index)}
        selectedTab={selectedTab}
        tabs={tabs.slice(0, exceptions?.characterPin ? 1 : 2)}
      />

      {selectedTab === 0 ? (
        <div>
          {exceptions?.characterPin ? (
            <div className="flex flex-col gap-y-2">
              {character && mapPin.character_id ? (
                <EntityPreview
                  clearAction={() => setCharacter(null)}
                  id={character.id}
                  image_id={character.portrait_id}
                  label="Character"
                  title={character?.full_name || ""}
                  type="characters"
                />
              ) : (
                <Search
                  isAutofocused
                  isDisabled={!!character && !!mapPin.character_id}
                  name="character_id"
                  onChange={({ value: id, label, image: portrait_id }) => {
                    setCharacter({ id, full_name: label || "", portrait_id });
                  }}
                  placeholder="Type at least 2 characters"
                  searchEntity="characters"
                />
              )}
              <div className="flex flex-nowrap justify-between">
                <span className="block min-h-[20px] truncate">Marker border:</span>
                <div className="flex items-center gap-x-2 pb-2">
                  <ColorPicker hasCustom name="border_color" onChange={handleChange} value={mapPin.border_color as string} />
                  <Checkbox name="show_border" onChange={handleChange} value={mapPin?.show_border} />
                </div>
              </div>
              <div className="flex flex-nowrap justify-between">
                <span className="block min-h-[20px] truncate">Public:</span>
                <div className="flex items-center gap-x-2 pb-2">
                  <Checkbox name="is_public" onChange={handleChange} value={!!mapPin?.is_public} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-nowrap gap-x-2">
                <Select
                  label="Map pin type (optional)"
                  name="map_pin_type_id"
                  onChange={({ name, value }) => {
                    const mapPinType = existingMapPinTypes?.data?.find((type) => type.id === value);
                    const valuesToChange = [{ name, value }];
                    if (mapPinType) {
                      if (mapPinType.default_icon) {
                        valuesToChange.push({ name: "icon", value: mapPinType.default_icon });
                      }
                      if (mapPinType.default_icon_color) {
                        valuesToChange.push({ name: "color", value: mapPinType.default_icon_color });
                      }
                    }
                    handleChange(valuesToChange);
                  }}
                  options={(existingMapPinTypes?.data || []).map((type) => ({ label: type.title, value: type.id }))}
                  value={mapPin?.map_pin_type_id}
                />

                <div className="flex w-16 flex-col justify-between">
                  <span className="block min-h-[20px] truncate text-center text-sm text-zinc-300">Icon (required)</span>
                  <div className="flex items-center justify-end pb-2">
                    <div className="w-1/2">
                      <ColorPicker hasCustom name="color" onChange={handleChange} value={mapPin.color as string} />
                    </div>
                    <div className="w-1/2">
                      <IconPicker
                        icon={mapPin.icon || ""}
                        iconColor={mapPin.color || "#ffffff"}
                        name="icon"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Input label="Map pin title (optional)" name="title" onChange={handleChange} value={mapPin?.title || ""} />
              </div>
              <div className="flex flex-nowrap justify-between">
                <span className="block min-h-[20px] truncate">Marker border:</span>
                <div className="flex w-16 items-center gap-x-2 pb-2">
                  <div className="w-1/2">
                    <ColorPicker hasCustom name="border_color" onChange={handleChange} value={mapPin.border_color as string} />
                  </div>
                  <div className="w-1/2">
                    <Checkbox name="show_border" onChange={handleChange} value={mapPin?.show_border} />
                  </div>
                </div>
              </div>
              <div className="flex flex-nowrap justify-between">
                <span className="block min-h-[20px] truncate">Marker background:</span>
                <div className="flex w-16 items-center gap-x-2 pb-2">
                  <div className="w-1/2">
                    <ColorPicker
                      hasCustom
                      name="background_color"
                      onChange={handleChange}
                      value={mapPin.background_color as string}
                    />
                  </div>
                  <div className="w-1/2">
                    <Checkbox name="show_background" onChange={handleChange} value={mapPin?.show_background} />
                  </div>
                </div>
              </div>
              <div className="flex flex-nowrap justify-between">
                <span className="block min-h-[20px] truncate">Public:</span>
                <div className="flex items-center gap-x-2 pb-2">
                  <Checkbox name="is_public" onChange={handleChange} value={!!mapPin?.is_public} />
                </div>
              </div>
              <div className="w-full">
                {!mapPin?.image_id ? (
                  <Search
                    imageType="images"
                    label="Image (replaces icon if selected)"
                    name="image_id"
                    onChange={handleChange}
                    searchEntity="images"
                    value={mapPin.image_id || ""}
                  />
                ) : (
                  <ImagePreview
                    clearAction={() => handleChange({ name: "image_id", value: null })}
                    id={mapPin?.image_id}
                    title={mapPin?.image?.title || ""}
                  />
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
      {selectedTab === 1 && !exceptions?.characterPin ? (
        <div className="flex flex-wrap gap-2">
          {mapPin?.document ? (
            <div className="w-full">
              <EntityPreview
                clearAction={() =>
                  handleChange([
                    {
                      name: "doc_id",
                      value: null,
                    },
                    { name: "document", value: null },
                  ])
                }
                id={mapPin.document.id}
                label="Document"
                title={mapPin.document.title}
                type="documents"
              />
            </div>
          ) : (
            <Search
              label="Document"
              name="doc_id"
              onChange={({ name, label, value }) => {
                handleChange([
                  { name, value },
                  { name: "document", value: { title: label, id: value } },
                ]);
              }}
              searchEntity="documents"
              value={mapPin.doc_id || ""}
            />
          )}
          {!exceptions?.characterPin && mapPin?.linked_map ? (
            <div className="w-full">
              <EntityPreview
                clearAction={() =>
                  handleChange([
                    {
                      name: "map_link",
                      value: null,
                    },
                    { name: "linked_map", value: null },
                  ])
                }
                id={mapPin.linked_map.id}
                image_id={mapPin?.linked_map?.image_id}
                label="Linked map"
                title={mapPin.linked_map?.title}
                type="maps"
              />
            </div>
          ) : null}
          {!exceptions?.characterPin && !mapPin?.linked_map ? (
            <Search
              imageType="map_images"
              label="Linked map"
              name="map_link"
              onChange={({ name, label, value, image }) => {
                handleChange([
                  { name, value },
                  { name: "linked_map", value: { title: label, id: value, image } },
                ]);
              }}
              searchEntity="maps"
            />
          ) : null}

          {!exceptions?.characterPin ? (
            <div className="w-full">
              <Collapsible icon={IconEnum.event} initialOpen={false} label="Events">
                <div className="flex flex-col gap-y-1 p-2">
                  <Search
                    isMultiple
                    label="Events (optional)"
                    limit={10}
                    name="events"
                    onChange={({ name, value, label, image, parent_id }) => {
                      if ((mapPin.events || [])?.some((event) => event.id === value)) {
                        handleChange({
                          name,
                          value: (mapPin.events || []).filter((t) => t.id !== value),
                        });
                        return;
                      }
                      handleChange({
                        name,
                        value: (mapPin.events || []).concat({
                          id: value,
                          title: label || "",
                          image_id: image,
                          parent_id: parent_id || "",
                        }),
                      });
                    }}
                    searchEntity="events"
                    value={mapPin.events?.map((pin) => pin.id)}
                  />
                  {mapPin.events?.map((event) => (
                    <EntityPreview
                      clearAction={(id) => handleChange({ name: "events", value: mapPin.events?.filter((c) => c.id !== id) })}
                      id={event.id}
                      image_id={event.image_id}
                      title={event.title || ""}
                      type="events"
                    />
                  ))}
                </div>
              </Collapsible>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button
        icon={IconEnum.save}
        isDisabled={isSaveDisabled(mapPin, { exceptions }) || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label="Save"
        onClick={async () => {
          if (!("id" in data) || !data?.id) {
            const parsed = InsertMapPinSchema.parse({ data: mapPin });
            const final: typeof parsed & { character?: MapPinType["character"] | null } = parsed;

            // Must insert character into query data here as the character prop/data itself
            // is not sent via request
            if (character) {
              queryClient.setQueryData<{ data: MapType }>(["maps", mapPin.parent_id], (old) => {
                if (old)
                  return {
                    ...old,
                    data: { ...old.data, map_pins: [...(old?.data?.map_pins || []), { ...mapPin, character } as MapPinType] },
                  };
                return old;
              });
            }

            await createMapPin(final, {
              onSuccess: (res) => {
                if (res?.ok) {
                  resetDrawerAtom();
                }
              },
            });
          } else {
            const parsed = UpdateMapPinSchema.parse({ data: mapPin });
            const final: typeof parsed & { character?: MapPinType["character"] | null } = parsed;
            // if (character) final.character = character;
            await updateMapPin(final, {
              onSuccess: (res) => {
                if (res?.ok) {
                  resetDrawerAtom();
                }
              },
            });
          }
        }}
        variant="success"
      />
    </div>
  );
}
