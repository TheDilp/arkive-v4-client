import { useResetAtom } from "jotai/utils";
import omit from "lodash.omit";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { MapType } from "../../../types";
import { drawerAtom, IconEnum, useNotifications } from "../../../utils";
import { InsertMapSchema } from "../../../validation/maps/maps";
import { ImageSelect } from "../../Complex";
import { Button, Input, Search } from "../../Form";
import { Tabs } from "../../Layout";
import { Badge } from "../../Misc";

function isDisabled(map: Partial<MapType> & { project_id: string }) {
  if (!map?.title) return true;
  if (!map?.image_id) return true;

  return false;
}

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Tags", icon: IconEnum.tags },
];

export function MapDrawer({ data }: { data: MapType }) {
  const { project_id } = useParams();
  const createNotification = useNotifications();

  const [map, setMap] = useState<Partial<MapType> & { project_id: string }>(
    data?.id ? data : { project_id: project_id as string },
  );
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { mutateAsync: create } = useCreateEntity<{ data: Omit<MapType, "id"> }>("maps");

  const { mutateAsync: update } = useUpdateEntity<{ data: Omit<MapType, "project_id"> }>("maps", project_id as string);
  const { handleChange } = useHandleChange({ data: map, setData: setMap });

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, indx) => setSelectedTab(indx)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <Input label="Title (required)" name="title" onChange={handleChange} value={map?.title || ""} />
          <ImageSelect label="Map image (required)" name="image_id" onChange={handleChange} type="maps" value={map?.image_id} />
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
          if (!data?.id) {
            const { tags, ...rest } = map;
            const parsedData = InsertMapSchema.parse({ data: rest, relations: { tags } });
            await create(parsedData);
          } else if (!Array.isArray(map)) {
            await update({ data: omit(map, ["project_id"]) });
          }

          resetDrawerAtom();
        }}
        variant="success"
      />
    </div>
  );
}
