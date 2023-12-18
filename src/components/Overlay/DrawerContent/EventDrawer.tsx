import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntity, useGetEntities, useGetSubEntity, useHandleChange, useUpdateSubEntity } from "../../../hooks";
import { AvailableEntityType, EventStateType, EventType, MonthType, onChangeValue } from "../../../types";
import {
  checkIfDayCorrect,
  checkIfMonthCorrect,
  checkIfYearCorrect,
  drawerAtom,
  getDefaultEntityIcon,
  getImageURL,
  getSearchLink,
  IconEnum,
} from "../../../utils";
import { InsertEventSchema, UpdateEventSchema } from "../../../validation/calendars/event";
import { ImageSelect } from "../../Complex";
import { EntityPreview, ImagePreview } from "../../DataDisplay";
import { Button, Input, Search, Select, TagInput, Textarea } from "../../Form";
import { Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";
import { ColorPicker } from "..";

function isSaveDisabled(event: EventStateType, { isDateCorrect }: { isDateCorrect: boolean }) {
  if (!isDateCorrect) return true;
  if (!Number.isInteger(event?.start_day)) return true;
  if (!Number.isInteger(event?.start_month)) return true;
  if (!Number.isInteger(event?.start_year)) return true;
  if (!event?.title) return true;

  return false;
}

type Props = { data: { id?: string; day?: number; month?: number; year?: number; isReadOnly?: boolean } };
const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Details", icon: IconEnum.edit },
  { id: "3", label: "Tags", icon: IconEnum.tags },
];
export function EventDrawer({ data }: Props) {
  const queryClient = useQueryClient();
  const { project_id, item_id } = useParams();
  const hasId = "id" in data && data?.id;
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawer = useResetAtom(drawerAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const { data: existingEvent, isFetching: isFetchingEvent } = useGetSubEntity<EventType>(
    data?.id,
    "events",
    {
      data: { project_id },
      relations: { tags: true, image: true, document: true },
    },
    { enabled: !!data?.id },
  );
  const { data: existingMonths, isFetching: isFetchingMonths } = useGetEntities<MonthType>(
    { data: { parent_id: item_id || existingEvent?.data?.parent_id }, orderBy: [{ field: "sort", sort: "asc" }] },
    "months",
    { enabled: !!existingEvent?.data, staleTime: 5 * 60 * 1000 },
  );
  const { mutateAsync: createEvent, isLoading: isCreating } = useCreateSubEntity<{
    data: EventStateType & { parent_id: string };
  }>("events", project_id as string);

  const { mutateAsync: updateEvent, isLoading: isUpdating } = useUpdateSubEntity(
    "events",
    project_id as string,
    item_id as string,
  );

  const [event, setEvent] = useState<EventStateType>(
    existingEvent?.data ?? {
      start_month: data?.month ?? 0,
      start_day: data?.day,
      start_year: data?.year,
      parent_id: item_id as string,
    },
  );

  useLayoutEffect(() => {
    if (existingEvent?.data) {
      setEvent(existingEvent?.data);
    }
  }, [existingEvent]);

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
      const parsedData = InsertEventSchema.parse({
        data: { ...event, image_id: event?.image?.id, document_id: event?.document?.id },
        relations: { tags: event?.tags?.map((tag) => ({ id: tag.id })) },
      });

      await createEvent(parsedData, {
        onSuccess: () => {
          resetDrawer();
          queryClient.refetchQueries({
            queryKey: ["allEntities", project_id, "events"],
            exact: false,
            type: "active",
          });
        },
      });
    } else {
      const parsedData = UpdateEventSchema.parse({
        data: { ...event, image_id: event?.image?.id, document_id: event?.document?.id },
        relations: { tags: event?.tags?.map((tag) => ({ id: tag.id })) },
      });
      await updateEvent(parsedData, {
        onSuccess: () => {
          resetDrawer();
          queryClient.refetchQueries({
            queryKey: ["allEntities", project_id, "events"],
            exact: false,
            type: "active",
          });
        },
      });
    }
  }

  const isYearCorrect = checkIfYearCorrect(event.start_year, event?.end_year);
  const isMonthCorrect = checkIfMonthCorrect(event, isYearCorrect);
  const isDayCorrect = checkIfDayCorrect(event, isYearCorrect, isMonthCorrect);
  const isDateCorrect = isYearCorrect && isMonthCorrect && isDayCorrect;

  const isLoading = isFetchingEvent || isFetchingMonths;

  if (isLoading) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <div className="flex flex-nowrap gap-x-2">
            <Input
              isDisabled={data?.isReadOnly}
              label="Event title (required)"
              name="title"
              onChange={handleChange}
              placeholder="Event title"
              value={event?.title || ""}
            />
            <div className="flex flex-col justify-between">
              <span className="block min-h-[20px] truncate text-center text-sm text-zinc-300">Color</span>
              <div className="flex items-center justify-center gap-x-2 pb-2">
                <ColorPicker
                  hasCustom
                  isDisabled={data?.isReadOnly}
                  name="background_color"
                  onChange={handleChange}
                  value={event.background_color || ""}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-x-2">
            <Input
              isDisabled={data?.isReadOnly}
              label="Start day (required)"
              max={existingMonths?.data?.[event?.start_month || 0]?.days ?? 0}
              min={1}
              name="start_day"
              onChange={handleChange}
              type="number"
              value={event?.start_day || ""}
            />
            <Select
              isDisabled={isFetchingMonths || data?.isReadOnly}
              isLoading={isFetchingMonths}
              label="Start month (required)"
              name="start_month"
              onChange={handleMonthChange}
              options={existingMonths?.data?.map((month) => ({ label: month.title, value: month.id })) || []}
              value={typeof event?.start_month === "number" ? existingMonths?.data?.[event.start_month].id : undefined}
            />
            <Input
              isDisabled={data?.isReadOnly}
              label="Start year (required)"
              name="start_year"
              onChange={handleChange}
              type="number"
              value={event?.start_year || ""}
            />
          </div>
          <div className="grid grid-cols-3 gap-x-2">
            <Input
              helperText={isDayCorrect ? "" : "End day must be more or equal to start day if in the same month and year."}
              isDisabled={typeof event?.end_month !== "number" || data?.isReadOnly}
              label="End day (optional)"
              max={typeof event.end_month === "number" ? existingMonths?.data[event.end_month].days : 0}
              min={1}
              name="end_day"
              onChange={handleChange}
              placeholder={typeof event?.end_month !== "number" ? "Select a month." : ""}
              type="number"
              value={event?.end_day || ""}
              variant={isDayCorrect ? "primary" : "error"}
            />
            <Select
              helperText={isMonthCorrect ? "" : "End month must be more or equal to start month if in the same year."}
              isClearable
              isDisabled={isFetchingMonths || data?.isReadOnly}
              isLoading={isFetchingMonths}
              label="End month (optional)"
              name="end_month"
              onChange={handleMonthChange}
              options={existingMonths?.data?.map((month) => ({ label: month.title, value: month.id })) || []}
              value={typeof event?.end_month === "number" ? existingMonths?.data?.[event.end_month].id : undefined}
              variant={isMonthCorrect ? "primary" : "error"}
            />
            <Input
              helperText={isYearCorrect ? "" : "End year must be more or equal to start year."}
              isDisabled={typeof event?.end_month !== "number" || data?.isReadOnly}
              label="End year (optional)"
              name="end_year"
              onChange={handleChange}
              placeholder={typeof event?.end_month !== "number" ? "Select a month." : ""}
              type="number"
              value={event?.end_year || ""}
              variant={isYearCorrect ? "primary" : "error"}
            />
          </div>

          <div className="flex items-center gap-x-2">
            <Input
              isDisabled={data?.isReadOnly}
              label="Hour (optional)"
              name="hours"
              onChange={handleChange}
              type="number"
              value={event?.hours || ""}
            />
            <Input
              isDisabled={data?.isReadOnly}
              label="Minutes (optional)"
              name="minutes"
              onChange={handleChange}
              type="number"
              value={event?.minutes || ""}
            />
          </div>
        </>
      ) : null}

      {selectedTab === 1 ? (
        <>
          <div>
            <Textarea
              isDisabled={data?.isReadOnly}
              label="Event description (optional)"
              name="description"
              onChange={handleChange}
              placeholder="Note: the event will use a document's content if selected."
              value={event?.description || ""}
            />
          </div>
          <div>
            {event?.image?.id ? (
              <ImagePreview
                clearAction={
                  data?.isReadOnly
                    ? undefined
                    : () => {
                        handleChange({ name: "image", value: null });
                      }
                }
                id={event.image.id}
                label="Event image (optional)"
                title={event.image.title}
                url={getImageURL(project_id as string, "images", event.image.id)}
              />
            ) : (
              <ImageSelect
                isDisabled={data?.isReadOnly}
                label="Event image (optional)"
                name="image"
                onChange={handleImageChange}
                type="images"
                value={event.image_id}
              />
            )}
          </div>
          <div>
            {event?.document ? (
              <EntityPreview
                clearAction={data?.isReadOnly ? undefined : () => handleChange({ name: "document", value: null })}
                icon={event.document?.icon ?? getDefaultEntityIcon("documents")}
                id={event.document.id}
                label="Document"
                link={getSearchLink(project_id as string, "documents", event.document.id, null)}
                previewAction={() =>
                  setDrawer((prev) => ({
                    ...prev,
                    title: "Preview",
                    data: { id: event?.document?.id as string, entity_type: "documents" as AvailableEntityType },
                    type: "entity_preview",
                    size: "half",
                  }))
                }
                title={event.document.title}
                type="documents"
              />
            ) : (
              <Search
                isDisabled={data?.isReadOnly}
                label="Event document (optional)"
                name="document"
                onChange={handleImageChange}
                searchEntity="documents"
                value={event.document_id}
              />
            )}
          </div>
        </>
      ) : null}
      {selectedTab === 2 ? (
        <TagInput handleChange={handleChange} isDisabled={data?.isReadOnly} isMultiple tags={event?.tags || []} />
      ) : null}

      {data?.isReadOnly ? null : (
        <Button
          icon={hasId ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(event, { isDateCorrect }) || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={hasId ? "Save" : "Create"}
          onClick={handleSave}
          variant="success"
        />
      )}
    </div>
  );
}
