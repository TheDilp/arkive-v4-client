import { useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useHandleChange } from "../../../hooks";
import { EventType, MonthType, onChangeValue } from "../../../types";
import { getImageURL, IconEnum, useNotifications } from "../../../utils";
import { ImageSelect } from "../../Complex";
import { ImagePreview } from "../../DataDisplay";
import { Button, Input, Search, Select, Textarea } from "../../Form";
import { Tabs } from "../../Layout";
import { Badge } from "../../Misc";
import { ColorPicker } from "..";

type EventStateType = Partial<Omit<EventType, "document">> & { startMonth: number };

function isSaveDisabled(event: EventStateType) {
  if (!event?.title) return true;
  if (!event?.startDay || !event?.startMonth || !event?.startMonth) return true;
  return false;
}

type Props = { data: { id?: string; day?: number; month: number; year: number } };
const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Details", icon: IconEnum.edit },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];
export function EventDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const hasId = "id" in data && data?.id;
  const [selectedTab, setSelectedTab] = useState(0);
  const createNotification = useNotifications();
  const { data: existingMonths, isFetching: isFetchingMonths } = useGetEntities<MonthType>(
    { data: { project_id, parent_id: item_id }, orderBy: [{ field: "sort", sort: "asc" }] },
    "months",
  );

  const [event, setEvent] = useState<EventStateType>({ startMonth: data?.month ?? 0 });
  const { handleChange } = useHandleChange({ data: event, setData: setEvent });

  function handleMonthChange({ name, value }: onChangeValue) {
    const idx = existingMonths?.data?.findIndex((month) => month.id === value) ?? -1;
    if (idx > -1) handleChange({ name, value: idx });
  }

  function handleImageChange({ name, label, value }: { name: string; label?: string; value: string }) {
    handleChange({ name, value: { id: value, title: label } });
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <Input
            label="Event title (required)"
            name="title"
            onChange={handleChange}
            placeholder="Event title"
            value={event?.title || ""}
          />
          <div className="flex items-center justify-between gap-x-2">
            <Input
              label="Start day (required)"
              max={existingMonths?.data[event.startMonth].days ?? 0}
              min={1}
              name="startDay"
              onChange={handleChange}
              type="number"
              value={event?.startDay || ""}
            />
            <Select
              isDisabled={isFetchingMonths}
              isLoading={isFetchingMonths}
              label="Start month (required)"
              name="startMonth"
              onChange={handleMonthChange}
              options={existingMonths?.data?.map((month) => ({ label: month.title, value: month.id })) || []}
              value={typeof event?.startMonth === "number" ? existingMonths?.data?.[event.startMonth].id : undefined}
            />
            <Input
              label="Start year (required)"
              name="startYear"
              onChange={handleChange}
              type="number"
              value={event?.startYear || ""}
            />
          </div>
          <div className="flex items-center justify-between gap-x-2">
            <Input
              isDisabled={typeof event?.endMonth !== "number"}
              label="End day (optional)"
              max={typeof event.endMonth === "number" ? existingMonths?.data[event.endMonth].days : 0}
              min={1}
              name="endDay"
              onChange={handleChange}
              type="number"
              value={event?.endDay || ""}
            />
            <Select
              isDisabled={isFetchingMonths}
              isLoading={isFetchingMonths}
              label="End month (optional)"
              name="endMonth"
              onChange={handleMonthChange}
              options={existingMonths?.data?.map((month) => ({ label: month.title, value: month.id })) || []}
              value={typeof event?.endMonth === "number" ? existingMonths?.data?.[event.endMonth].id : undefined}
            />
            <Input
              isDisabled={typeof event?.endMonth !== "number"}
              label="End year (optional)"
              name="endYear"
              onChange={handleChange}
              type="number"
              value={event?.endYear || ""}
            />
          </div>

          <div className="flex items-center gap-x-2">
            <Input label="Hour (optional)" name="hours" onChange={handleChange} value={event?.hours || ""} />
            <Input label="Minutes (optional)" name="minutes" onChange={handleChange} value={event?.minutes || ""} />
          </div>
        </>
      ) : null}

      {selectedTab === 1 ? (
        <>
          <div>
            <Textarea
              label="Event description (optional)"
              name="description"
              onChange={handleChange}
              placeholder="Note: the event will use a document's content if selected."
              value={event?.description || ""}
            />
          </div>
          <div>
            {event?.background_image ? (
              <ImagePreview
                clearAction={() => handleChange({ name: "background_image", value: null })}
                id={event.background_image.id}
                title={event.background_image.title}
                url={getImageURL(project_id as string, "images", event.background_image.id)}
              />
            ) : (
              <ImageSelect
                label="Event image (optional)"
                name="background_image"
                onChange={handleImageChange}
                type="images"
                value={event.image_id}
              />
            )}
          </div>
          <div>{/* <Search label="Document (optional)" searchEntity="documents" /> */}</div>
          <div className="flex items-center justify-between">
            <span>Event color:</span>
            <ColorPicker name="background_color" onChange={handleChange} value={event?.background_color || ""} />
          </div>
        </>
      ) : null}
      {selectedTab === 2 ? (
        <>
          <Search
            name="tags"
            onChange={({ name, label, value, color }) => {
              if ((event?.tags || [])?.some((tag) => tag.id === value)) {
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
                value: (event?.tags || []).concat({
                  title: label as string,
                  id: value,
                  project_id: project_id as string,
                  color: color as string,
                }),
              });
            }}
            placeholder="Press enter to search tags."
            searchEntity="tags"
            value={undefined}
          />

          <div className="flex flex-wrap gap-2">
            {event?.tags?.length
              ? event.tags.map((tag) => (
                  <div key={tag.id} className="w-fit">
                    <Badge
                      clearAction={() => {
                        handleChange({ name: "tags", value: (event?.tags || []).filter((t) => t.id !== tag.id) });
                      }}
                      customColor={tag.color}
                      label={tag.title}
                      size="lg"
                    />
                  </div>
                ))
              : null}
          </div>
        </>
      ) : null}

      <Button
        icon={hasId ? IconEnum.save : IconEnum.add}
        isDisabled={isSaveDisabled(event)}
        label={hasId ? "Save" : "Create"}
        onClick={() => {}}
        variant="success"
      />
    </div>
  );
}
