import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { MapType } from "../../../types";
import { drawerAtom, IconEnum, useNotifications } from "../../../utils";
import { InsertMapSchema, InsertMapType, UpdateMapSchema, UpdateMapType } from "../../../validation/maps/maps";
import { ImageSelect } from "../../Complex";
import { Button, Checkbox, Input, Search } from "../../Form";
import { Tabs } from "../../Layout";
import { Badge, Skeleton } from "../../Misc";

function isDisabled(map: Partial<MapType> & { project_id: string }) {
  if (!map?.title) return true;
  if (!map?.image_id) return true;

  return false;
}

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Tags", icon: IconEnum.tags },
];

export function MapDrawer({ data }: { data: { id?: string } }) {
  const { project_id } = useParams();
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
        </>
      ) : null}
      {selectedTab === 1 ? (
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
