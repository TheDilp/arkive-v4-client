import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useResetAtom } from "jotai/utils";
import { Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { CalendarType, DayStateType, MonthStateType } from "../../../types";
import { capitalizeFirstLetter, drawerAtom, IconEnum, onDragEnd } from "../../../utils";
import { InsertCalendarSchema, InsertCalendarType, UpdateCalendarSchema, UpdateCalendarType } from "../../../validation";
import { Button, Checkbox, Input, Select, TagInput } from "../../Form";
import { Collapsible, Tabs } from "../../Layout";
import { Icon, Skeleton } from "../../Misc";
import { IconPicker } from "../IconPicker";

type Props = {
  data: { id?: string };
};

function isSaveDisabled(calendar: Partial<CalendarType>, months: MonthStateType[], days: DayStateType[]) {
  if (!calendar?.title) return true;
  if (!months.length) return true;
  if (!days.length) return true;
  if (months.some((month) => !month.title || !month.days)) return true;
  if (days.some((day) => !day.title)) return true;
  return false;
}

function MonthsTab({ months, setMonths }: { months: MonthStateType[]; setMonths: Dispatch<SetStateAction<MonthStateType[]>> }) {
  const { handleChange } = useHandleChange({ data: months, setData: setMonths });
  return (
    <div className="mt-2 flex flex-col gap-y-2 p-2">
      <div className="sticky top-0 z-20 flex flex-nowrap justify-between bg-zinc-950">
        <span>Insert new month:</span>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            isIconOnly
            onClick={() =>
              setMonths((prev) => prev.concat([{ id: crypto.randomUUID(), title: "New month", sort: prev.length, days: 0 }]))
            }
            variant="info"
          />
        </div>
      </div>
      <DragDropContext onDragEnd={(result) => onDragEnd<MonthStateType>(result, months, setMonths)}>
        <Droppable droppableId="droppable">
          {(providedDroppable) => (
            <div className="flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
              {months.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id || item.title + index} index={index}>
                  {(provided, draggableSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      className={`my-1 flex w-full flex-nowrap items-center gap-x-2 rounded bg-zinc-800 px-1 ${
                        draggableSnapshot.isDragging ? "ml-8 w-full rounded bg-transparent bg-none shadow-sm" : ""
                      }`}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        left: "calc(100%-1px)",
                        right: 24,
                      }}>
                      <div {...provided.dragHandleProps} className="self-end pb-2">
                        <Icon fontSize={24} icon={IconEnum.menu} />
                      </div>

                      <Input
                        label="Month name (required)"
                        name={`[${index}].title`}
                        onChange={handleChange}
                        placeholder="Eg November"
                        value={item.title}
                      />
                      <div className="w-1/3">
                        <Input
                          label="Days in month (required)"
                          name={`[${index}].days`}
                          onChange={handleChange}
                          type="number"
                          value={item.days ?? 0}
                        />
                      </div>
                      <div className="h-10 self-end">
                        <Button
                          hasNoBackground
                          icon={IconEnum.trash}
                          isIconOnly
                          onClick={() => setMonths((prev) => prev.filter((m) => m.id !== item.id))}
                          variant="error"
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {providedDroppable.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
function DaysTab({ days, setDays }: { days: DayStateType[]; setDays: Dispatch<SetStateAction<DayStateType[]>> }) {
  const { handleChange } = useHandleChange({ data: days, setData: setDays });
  return (
    <div className="mt-2 flex flex-col gap-y-2 p-2">
      <div className="sticky top-0 z-20 flex flex-nowrap justify-between bg-zinc-950">
        <span>Insert new day:</span>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            isIconOnly
            onClick={() => setDays((prev) => prev.concat([{ id: crypto.randomUUID(), title: "New day" }]))}
            variant="info"
          />
        </div>
      </div>
      <DragDropContext onDragEnd={(result) => onDragEnd<DayStateType>(result, days, setDays)}>
        <Droppable droppableId="droppableDays">
          {(providedDroppable) => (
            <div className="flex flex-col" {...providedDroppable.droppableProps} ref={providedDroppable.innerRef}>
              {days.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id || item.title + index} index={index}>
                  {(provided, draggableSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      className={`my-1 flex w-full flex-nowrap items-center gap-x-2 rounded bg-zinc-800 px-1 ${
                        draggableSnapshot.isDragging ? "ml-8 w-full rounded bg-transparent bg-none shadow-sm" : ""
                      }`}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        left: "calc(100%-1px)",
                        right: 24,
                      }}>
                      <div {...provided.dragHandleProps} className="self-end pb-2">
                        <Icon fontSize={24} icon={IconEnum.menu} />
                      </div>

                      <Input
                        label="Day name (required)"
                        name={`[${index}].title`}
                        onChange={handleChange}
                        placeholder="Eg Saturday"
                        value={item.title}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {providedDroppable.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Tags", icon: IconEnum.tags },
];

export function CalendarDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [calendar, setCalendar] = useState<Partial<CalendarType>>({ project_id });
  const [months, setMonths] = useState<MonthStateType[]>([]);
  const [days, setDays] = useState<DayStateType[]>([]);
  const resetDrawer = useResetAtom(drawerAtom);
  const { data: existingCalendar, isFetching } = useGetEntity<CalendarType>(
    data?.id,
    "calendars",
    {
      fields: ["id", "title", "icon", "hours", "minutes", "days", "starts_on_day", "is_folder", "is_public"],
      relations: { months: true, tags: true },
    },
    { enabled: !!data?.id, queryKeyConcat: ["drawer"] },
  );

  const { handleChange } = useHandleChange({ data: calendar, setData: setCalendar });

  const { mutateAsync: createCalendar, isLoading: isCreating } = useCreateEntity<InsertCalendarType>("calendars");
  const { mutateAsync: updateCalendar, isLoading: isUpdating } = useUpdateEntity<UpdateCalendarType>(
    "calendars",
    project_id as string,
  );

  useLayoutEffect(() => {
    if (existingCalendar?.data) {
      const { months: mths, ...cal } = existingCalendar.data;
      setCalendar(cal);
      setMonths(mths);
      setDays(cal.days.map((d) => ({ id: crypto.randomUUID(), title: d })));
    }
  }, [existingCalendar]);

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertCalendarSchema.parse({
        data: { ...calendar, days: days.map((d) => d.title) },
        relations: { months, tags: calendar.tags },
      });
      await createCalendar(parsedData, { onSuccess: resetDrawer });
    } else {
      const parsedData = UpdateCalendarSchema.parse({
        data: { ...calendar, days: days.map((d) => d.title) },
        relations: { months, tags: calendar.tags },
      });

      await updateCalendar(parsedData, { onSuccess: resetDrawer });
    }
  }

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2 overflow-y-auto">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {selectedTab === 0 ? (
        <>
          <div className="flex flex-nowrap gap-x-2">
            <Input label="Title (required)" name="title" onChange={handleChange} value={calendar?.title || ""} />

            <div className="self-end pb-1.5">
              <IconPicker icon={calendar?.icon || IconEnum.calendar} name="icon" onChange={handleChange} />
            </div>
          </div>

          <div className="flex flex-nowrap items-center gap-x-2">
            <Input
              label="Hours (optional)"
              name="hours"
              onChange={handleChange}
              placeholder="How many hours in a day?"
              type="number"
              value={calendar?.hours || ""}
            />
            <Input
              label="Minutes (optional)"
              name="minutes"
              onChange={handleChange}
              placeholder="How many minutes per hour?"
              type="number"
              value={calendar?.minutes || ""}
            />
          </div>

          <div>
            <Select
              helperText="Starts on the first day if not set"
              label="Start year 1 on specific day (optional)"
              name="starts_on_day"
              onChange={handleChange}
              options={(calendar?.days || []).map((day, idx) => ({ label: capitalizeFirstLetter(day), value: idx.toString() }))}
              value={calendar?.starts_on_day ? calendar?.starts_on_day?.toString() : null}
            />
          </div>

          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={calendar?.is_public ?? false} />
          </div>

          <Collapsible icon={IconEnum.moon} label="Months (required)">
            <MonthsTab months={months} setMonths={setMonths} />
          </Collapsible>
          <Collapsible icon={IconEnum.sun} label="Days (required)">
            <DaysTab days={days} setDays={setDays} />
          </Collapsible>
        </>
      ) : null}

      {selectedTab === 1 ? <TagInput handleChange={handleChange} tags={calendar?.tags || []} /> : null}

      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isSaveDisabled(calendar, months, days) || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Save" : "Create"}
          onClick={handleSave}
          variant="success"
        />
      </div>
    </div>
  );
}
