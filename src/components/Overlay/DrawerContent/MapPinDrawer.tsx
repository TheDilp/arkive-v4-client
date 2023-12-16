import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetEntities, useGetSubEntity, useHandleChange, useUpdateMapSubEntity } from "../../../hooks";
import { MapPinType, MapPinTypesType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertMapPinSchema, InsertMapPinType, UpdateMapPinSchema, UpdateMapPinType } from "../../../validation/maps/map_pins";
import { EntityPreview, ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, Select } from "../../Form";
import { Tabs } from "../../Layout";
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

  const { data: existingMapPinTypes } = useGetEntities<MapPinTypesType>({ data: { project_id } }, "map_pin_types");

  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { data: existingMapPin, isFetching } = useGetSubEntity<MapPinType>(
    data?.id,
    "map_pins",
    { data: {} },
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
      {exceptions?.characterPin ? (
        <div className="flex flex-col gap-y-2">
          {character ? (
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
              isDisabled={!!character}
              name="character_id"
              onChange={({ value: id, label, image: portrait_id }) => {
                setCharacter({ id, full_name: label, portrait_id });
              }}
              placeholder="Press enter to search characters"
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
        </div>
      ) : (
        <>
          <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
          {selectedTab === 0 ? (
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
          ) : null}
          {selectedTab === 1 ? (
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
              {mapPin?.linked_map ? (
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
              ) : (
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
              )}
            </div>
          ) : null}
        </>
      )}

      <Button
        icon={IconEnum.save}
        isDisabled={isSaveDisabled(mapPin, { exceptions }) || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label="Save"
        onClick={async () => {
          if (!("id" in data) || !data?.id) {
            const parsed = InsertMapPinSchema.parse({ data: mapPin });
            const final: typeof parsed & { character?: MapPinType["character"] | null } = parsed;
            if (character) final.character = character;
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
            if (character) final.character = character;
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
