import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { MapPinTypesType } from "../../../types";
import { DefaultTagColor, drawerAtom, IconEnum } from "../../../utils";
import { InsertMapPinTypeSchema, UpdateMapPinTypeSchema } from "../../../validation/maps/map_pin_types";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Skeleton } from "../../Misc";
import { ColorPicker, IconPicker } from "..";

type Props = {
  data: {
    id?: string;
    project_id?: string;
  };
};

export function MapPinTypeDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [mapPinType, setMapPinType] = useState<Partial<MapPinTypesType>>({
    title: "New map pin type",
    project_id: data?.project_id || project_id,
  });
  const client = useQueryClient();
  const { handleChange } = useHandleChange({ data: mapPinType, setData: setMapPinType });

  const { data: existingMapPinType, isInitialLoading } = useGetEntity<MapPinTypesType>(
    data?.id,
    "map_pin_types",
    {
      fields: ["id", "title", "default_icon", "default_icon_color"],
    },
    { enabled: !!data?.id },
  );
  const { mutateAsync: create, isLoading: isCreating } = useCreateEntity<{ data: { title: string; project_id: string } }>(
    "map_pin_types",
  );
  const { mutateAsync: update, isLoading: isUpdating } = useUpdateEntity<{ data: { id: string; title: string } }>(
    "map_pin_types",
    data?.project_id as string,
  );

  const resetDrawerAtom = useResetAtom(drawerAtom);
  useLayoutEffect(() => {
    if (existingMapPinType?.data) {
      setMapPinType(existingMapPinType?.data);
    }
  }, [existingMapPinType]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;
  return (
    <DrawerLayout>
      <Input label="Title" name="title" onChange={handleChange} value={mapPinType.title || ""} />

      <div className="flex items-center justify-between">
        <span>Default icon color:</span>
        <div className="flex w-8 justify-center">
          <ColorPicker
            hasCustom
            name="default_icon_color"
            onChange={handleChange}
            value={mapPinType.default_icon_color || DefaultTagColor}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span>Default icon:</span>
        <div className="flex w-8 justify-center">
          <IconPicker
            icon={mapPinType.default_icon || ""}
            iconColor={mapPinType.default_icon_color || DefaultTagColor}
            name="default_icon"
            onChange={handleChange}
          />
        </div>
      </div>

      <Button
        icon={mapPinType?.id ? IconEnum.save : IconEnum.add}
        isDisabled={!mapPinType.title || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={mapPinType?.id ? "Update" : "Create"}
        onClick={async () => {
          if (mapPinType?.id && existingMapPinType?.data) {
            const parsedData = UpdateMapPinTypeSchema.parse({ data: mapPinType });
            await update(parsedData, {
              onSuccess: async (res) => {
                client.invalidateQueries(["projects", data?.project_id || project_id, "settings"]);
                if (res?.ok) resetDrawerAtom();
              },
            });
          } else {
            const parsedData = InsertMapPinTypeSchema.parse({ data: mapPinType });
            await create(parsedData, {
              onSuccess: async (res) => {
                if (res?.ok) resetDrawerAtom();
              },
            });
            client.invalidateQueries(["projects", data?.project_id || project_id, "settings"]);
          }
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
