import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetSubEntity, useHandleChange, useUpdateMapSubEntity } from "../../../hooks";
import { MapPinType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertMapPinSchema, InsertMapPinType, UpdateMapPinSchema, UpdateMapPinType } from "../../../validation/maps/map_pins";
import { CharacterPreview, ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search } from "../../Form";
import { Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";
import { ColorPicker, IconPicker } from "..";

function isSaveDisabled(mapPin: Partial<MapPinType>) {
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
    label: "Characters",
    icon: IconEnum.character,
  },
];

type Props = {
  data: { id?: string; lat: number; lng: number };
};

export function MapPinDrawer({ data }: Props) {
  const { item_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [mapPin, setMapPin] = useState<Partial<MapPinType>>({
    parent_id: item_id as string,
  });
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { data: existingMapPin, isFetching } = useGetSubEntity(data?.id, "map_pins", { data: {} }, { enabled: !!data?.id });
  const { mutateAsync: createMapPin } = useCreateSubEntity<InsertMapPinType>("map_pins");
  const { mutateAsync: updateMapPin } = useUpdateMapSubEntity<UpdateMapPinType>("map_pins", item_id as string);
  const queryClient = useQueryClient();

  const { handleChange } = useHandleChange({ data: mapPin, setData: setMapPin });
  useLayoutEffect(() => {
    if (existingMapPin?.data) {
      setMapPin(existingMapPin.data);
    } else {
      setMapPin({
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

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <div className="flex flex-nowrap gap-x-2">
            <Input label="Map pin title (optional)" name="title" onChange={handleChange} value={mapPin?.title || ""} />

            <div className="flex flex-col justify-between">
              <span className="block min-h-[20px] truncate text-center text-sm text-zinc-300">Icon</span>
              <div className="flex items-center gap-x-2 pb-2">
                <ColorPicker hasCustom name="color" onChange={handleChange} value={mapPin.color as string} />
                <IconPicker
                  icon={mapPin.icon || ""}
                  iconColor={mapPin.color || "#ffffff"}
                  name="icon"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-nowrap justify-between">
            <span className="block min-h-[20px] truncate">Marker border:</span>
            <div className="flex items-center gap-x-2 pb-2">
              <ColorPicker hasCustom name="border_color" onChange={handleChange} value={mapPin.border_color as string} />
              <Checkbox name="show_border" onChange={handleChange} value={mapPin?.show_border} />
            </div>
          </div>
          <div className="flex flex-nowrap justify-between">
            <span className="block min-h-[20px] truncate">Marker background:</span>
            <div className="flex items-center gap-x-2 pb-2">
              <ColorPicker
                hasCustom
                name="background_color"
                onChange={handleChange}
                value={mapPin.background_color as string}
              />
              <Checkbox name="show_background" onChange={handleChange} value={mapPin?.show_background} />
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
          {mapPin?.characters?.length
            ? mapPin.characters.map((character) => (
                <div key={character.id} className="w-full">
                  <CharacterPreview
                    character_name={character?.first_name}
                    clearAction={() => {
                      handleChange({
                        name: "characters",
                        value: (mapPin?.characters || []).filter((char) => char.id !== character.id),
                      });
                    }}
                    id={character.id}
                  />
                </div>
              ))
            : null}
        </div>
      ) : null}
      <Button
        icon={IconEnum.save}
        isDisabled={isSaveDisabled(mapPin)}
        label="Save"
        onClick={async () => {
          if (!("id" in data) || !data?.id) {
            const parsed = InsertMapPinSchema.parse({ data: mapPin });
            await createMapPin(parsed, {
              onSuccess: (res) => {
                if (res?.ok) {
                  queryClient.invalidateQueries({ queryKey: ["maps", item_id] });
                  resetDrawerAtom();
                }
              },
            });
          } else {
            const parsed = UpdateMapPinSchema.parse({ data: mapPin });
            await updateMapPin(parsed, {
              onSuccess: (res) => {
                if (res?.ok) {
                  queryClient.invalidateQueries({ queryKey: ["maps", item_id] });
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
