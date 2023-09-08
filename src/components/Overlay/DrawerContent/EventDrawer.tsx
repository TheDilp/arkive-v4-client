import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetEntities, useHandleChange } from "../../../hooks";
import { EventStateType, MonthType, onChangeValue } from "../../../types";
import {
  checkIfDayCorrect,
  checkIfMonthCorrect,
  checkIfYearCorrect,
  drawerAtom,
  getImageURL,
  IconEnum,
  useNotifications,
} from "../../../utils";
import { InsertEventSchema } from "../../../validation/calendars/event";
import { ImageSelect } from "../../Complex";
import { ImagePreview } from "../../DataDisplay";
import { Button, Input, Search, Select, Textarea } from "../../Form";
import { Tabs } from "../../Layout";
import { Badge } from "../../Misc";
import { ColorPicker } from "..";

function isSaveDisabled(event: EventStateType, { isDateCorrect }: { isDateCorrect: boolean }) {
  if (!isDateCorrect) return true;
  if (!Number.isInteger(event?.startDay)) return true;
  if (!Number.isInteger(event?.startMonth)) return true;
  if (!Number.isInteger(event?.startYear)) return true;
  if (!event?.title) return true;

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
  const resetDrawer = useResetAtom(drawerAtom);
  const { data: existingMonths, isFetching: isFetchingMonths } = useGetEntities<MonthType>(
    { data: { project_id, parent_id: item_id }, orderBy: [{ field: "sort", sort: "asc" }] },
    "months",
  );
  const { mutateAsync: createEvent, isLoading: isCreating } = useCreateSubEntity<{
    data: EventStateType & { parent_id: string };
  }>("events");
  const [event, setEvent] = useState<EventStateType>({ startMonth: data?.month ?? 0, parent_id: item_id as string });
  const { handleChange } = useHandleChange({ data: event, setData: setEvent });

  function handleMonthChange({ name, value }: onChangeValue) {
    if (value === undefined) {
      handleChange({ name, value });
      return;
    }
    const idx = existingMonths?.data?.findIndex((month) => month.id === value) ?? -1;
    if (idx > -1) handleChange({ name, value: idx });
  }

  function handleImageChange({ name, label, value }: { name: string; label?: string; value: string }) {
    handleChange({ name, value: { id: value, title: label } });
  }

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertEventSchema.parse({ data: event, relations: event?.tags?.map((tag) => ({ id: tag.id })) });

      createEvent(parsedData, { onSuccess: resetDrawer });
    }
  }

  const isYearCorrect = checkIfYearCorrect(event.startYear, event?.endYear);
  const isMonthCorrect = checkIfMonthCorrect(event, isYearCorrect);
  const isDayCorrect = checkIfDayCorrect(event, isYearCorrect, isMonthCorrect);
  const isDateCorrect = isYearCorrect && isMonthCorrect && isDayCorrect;

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <div className="flex flex-nowrap gap-x-2">
            <Input
              label="Event title (required)"
              name="title"
              onChange={handleChange}
              placeholder="Event title"
              value={event?.title || ""}
            />
            <div className="flex flex-col justify-between">
              <span className="block min-h-[20px] truncate text-center text-sm text-zinc-300">Color</span>
              <div className="flex items-center justify-center gap-x-2 pb-2">
                <ColorPicker hasCustom name="background_color" onChange={handleChange} value={event.background_color || ""} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-2">
            <Input
              label="Start day (required)"
              max={existingMonths?.data[event?.startMonth]?.days ?? 0}
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
          <div className="grid grid-cols-3 gap-x-2">
            <Input
              helperText={isDayCorrect ? "" : "End day must be more or equal to start day if in the same month and year."}
              isDisabled={typeof event?.endMonth !== "number"}
              label="End day (optional)"
              max={typeof event.endMonth === "number" ? existingMonths?.data[event.endMonth].days : 0}
              min={1}
              name="endDay"
              onChange={handleChange}
              placeholder={typeof event?.endMonth !== "number" ? "Select a month." : ""}
              type="number"
              value={event?.endDay || ""}
              variant={isDayCorrect ? "primary" : "error"}
            />
            <Select
              helperText={isMonthCorrect ? "" : "End month must be more or equal to start month if in the same year."}
              isClearable
              isDisabled={isFetchingMonths}
              isLoading={isFetchingMonths}
              label="End month (optional)"
              name="endMonth"
              onChange={handleMonthChange}
              options={existingMonths?.data?.map((month) => ({ label: month.title, value: month.id })) || []}
              value={typeof event?.endMonth === "number" ? existingMonths?.data?.[event.endMonth].id : undefined}
              variant={isMonthCorrect ? "primary" : "error"}
            />
            <Input
              helperText={isYearCorrect ? "" : "End year must be more or equal to start year."}
              isDisabled={typeof event?.endMonth !== "number"}
              label="End year (optional)"
              name="endYear"
              onChange={handleChange}
              placeholder={typeof event?.endMonth !== "number" ? "Select a month." : ""}
              type="number"
              value={event?.endYear || ""}
              variant={isYearCorrect ? "primary" : "error"}
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
            {event?.image ? (
              <ImagePreview
                clearAction={() => handleChange({ name: "background_image", value: null })}
                id={event.image.id}
                title={event.image.title}
                url={getImageURL(project_id as string, "images", event.image.id)}
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
        isDisabled={isSaveDisabled(event, { isDateCorrect }) || isCreating}
        isLoading={isCreating}
        label={hasId ? "Save" : "Create"}
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
