import { useState } from "react";

import { useHandleChange } from "../../../hooks";
import { MapPinType } from "../../../types";
import { DefaultTagColor, IconEnum } from "../../../utils";
import { ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search } from "../../Form";
import { ColorPicker, IconPicker } from "..";

export function MapPinDrawer() {
  const [mapPin, setMapPin] = useState<Partial<MapPinType>>({ icon: "", color: DefaultTagColor });

  const { handleChange } = useHandleChange({ data: mapPin, setData: setMapPin });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex flex-nowrap gap-x-2">
        <Input label="Map pin text (optional)" name="text" onChange={handleChange} value={mapPin?.text || ""} />

        <div className="flex flex-col justify-between">
          <span className="block min-h-[20px] truncate text-center text-sm text-zinc-300">Icon</span>
          <div className="flex items-center gap-x-2 pb-2">
            <ColorPicker hasCustom name="color" onChange={handleChange} value={mapPin.color as string} />
            <IconPicker icon={mapPin.icon || ""} iconColor={mapPin.color || "#ffffff"} name="icon" onChange={handleChange} />
          </div>
        </div>
      </div>
      <div className="flex flex-nowrap justify-between">
        <span className="block min-h-[20px] truncate">Marker border:</span>
        <div className="flex items-center gap-x-2 pb-2">
          <ColorPicker hasCustom name="color" onChange={handleChange} value={mapPin.border_color as string} />
          <Checkbox name="show_border" onChange={handleChange} value={mapPin?.show_border} />
        </div>
      </div>
      <div className="flex flex-nowrap justify-between">
        <span className="block min-h-[20px] truncate">Marker background:</span>
        <div className="flex items-center gap-x-2 pb-2">
          <ColorPicker hasCustom name="color" onChange={handleChange} value={mapPin.background_color as string} />
          <Checkbox name="show_border" onChange={handleChange} value={mapPin?.show_background} />
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
      <Button icon={IconEnum.save} label="Save" variant="success" />
    </div>
  );
}
