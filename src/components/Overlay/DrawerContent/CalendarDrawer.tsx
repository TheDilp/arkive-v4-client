import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useResetAtom } from "jotai/utils";
import { Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useHasPermissions, useUpdateEntity } from "../../../hooks";
import {
  CalendarType,
  DayStateType,
  LeapDayConditionType,
  LeapDayStateType,
  MonthStateType,
  TabType,
  UserHasPermissionsType,
} from "../../../types";
import { capitalizeFirstLetter, DefaultTagColor, drawerAtom, IconEnum, onDragEnd } from "../../../utils";
import { LeapDayConditionsEnum } from "../../../utils/enums/CalendarEnums";
import { InsertCalendarSchema, InsertCalendarType, UpdateCalendarSchema, UpdateCalendarType } from "../../../validation";
import { FolderSelect } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Checkbox, Input, Select, TagInput, Title } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Badge, Icon, Skeleton } from "../../Misc";
import { ColorPicker } from "..";
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
  if (
    calendar.eras?.length &&
    calendar.eras.some((era) => {
      if (!era.title) return true;
      if (typeof era.start_day !== "number") return true;
      if (typeof era.start_month !== "number") return true;
      if (typeof era.start_year !== "number") return true;
      if (typeof era.end_day !== "number") return true;
      if (typeof era.end_month !== "number") return true;
      if (typeof era.end_month !== "number") return true;
      if (!era.color) return true;
      return false;
    })
  )
    return true;
  return false;
}

function MonthsSection({
  months,
  setMonths,
}: {
  months: MonthStateType[];
  setMonths: Dispatch<SetStateAction<MonthStateType[]>>;
}) {
  const { handleChange } = useHandleChange({ data: months, setData: setMonths });
  return (
    <div className="mt-2 flex flex-col gap-y-2 p-2">
      <div className="sticky top-0 z-20 flex flex-nowrap items-center justify-between bg-zinc-950">
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
                        label="Name (required)"
                        name={`[${index}].title`}
                        onChange={handleChange}
                        placeholder="Eg November"
                        value={item.title}
                      />
                      <div className="w-1/4">
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
function DaysSection({ days, setDays }: { days: DayStateType[]; setDays: Dispatch<SetStateAction<DayStateType[]>> }) {
  const { handleChange } = useHandleChange({ data: days, setData: setDays });
  return (
    <div className="mt-2 flex flex-col gap-y-2 p-2">
      <div className="sticky top-0 z-20 flex flex-nowrap items-center justify-between bg-zinc-950">
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
                      <div className="h-10 self-end">
                        <Button
                          hasNoBackground
                          icon={IconEnum.trash}
                          isIconOnly
                          onClick={() => setDays((prev) => prev.filter((d) => d.id !== item.id))}
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
function LeapDaysSection({
  months,
  leapDays,
  setLeapDays,
  parent_id,
}: {
  months: MonthStateType[];
  leapDays: LeapDayStateType[];
  setLeapDays: Dispatch<SetStateAction<LeapDayStateType[]>>;
  parent_id: string;
}) {
  const { handleChange } = useHandleChange({ data: leapDays, setData: setLeapDays });
  return (
    <div className="mt-2 flex flex-col gap-y-2 p-2">
      <div className="sticky top-0 z-20 flex flex-nowrap items-center justify-between bg-zinc-950">
        <span>Insert new leap day:</span>
        <div className="h-8 w-8">
          <Button
            icon={IconEnum.add}
            isIconOnly
            onClick={() =>
              setLeapDays((prev) =>
                prev.concat([
                  { id: crypto.randomUUID(), parent_id, month_id: months?.[0]?.id || "", conditions: { and: [], or: [] } },
                ]),
              )
            }
            variant="info"
          />
        </div>
      </div>
      <div className="flex flex-col">
        {leapDays.map((item, index) => (
          <div key={item.id} className="my-1 flex w-full flex-col flex-nowrap items-center gap-x-2 rounded bg-zinc-800 p-1">
            <div className="flex w-full items-center justify-between gap-x-2">
              <Select
                label="Month"
                name={`[${index}].month_id`}
                onChange={handleChange}
                options={months.map((month) => ({ label: month.title, value: month.id }))}
                value={item.month_id}
              />
              <div className="mb-2 h-6 w-6 self-end">
                <Button
                  hasNoBackground
                  icon={IconEnum.trash}
                  isIconOnly
                  onClick={() => setLeapDays((prev) => prev.filter((ld) => ld.id !== item.id))}
                  variant="error"
                />
              </div>
            </div>
            <div className="mt-2 flex w-full flex-col justify-start self-start">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <Title isDrawerTitle label="Conditions - year must match all" />
                </div>
                <div>
                  <Button
                    hasNoBackground
                    icon={IconEnum.add}
                    iconSize={18}
                    isIconOnly
                    onClick={() => {
                      const type: LeapDayConditionType = (item.conditions.and || [])?.some((c) => c.type === "every")
                        ? "divisible_by"
                        : "every";
                      handleChange({
                        name: `[${index}].conditions.and`,
                        value: (item.conditions.and || []).concat({ type, value: 0 }),
                      });
                    }}
                    size="xs"
                    variant="info"
                  />
                </div>
              </div>
              {(item.conditions.and || []).map((cond, idx) => (
                <div key={`${cond.type}_${idx.toString()}`} className="mt-1 flex flex-col gap-y-1">
                  <div className="flex items-center gap-x-2">
                    <Select
                      label="Type"
                      name={`[${index}].conditions.and[${idx}].type`}
                      onChange={handleChange}
                      options={LeapDayConditionsEnum.map((c) => {
                        if (c.value === "every") {
                          if ((item.conditions.and || [])?.some((condition) => condition.type === "every"))
                            return { ...c, isDisabled: true };
                          return c;
                        }
                        return c;
                      })}
                      value={cond.type}
                    />
                    <Input
                      label="Value"
                      min={1}
                      name={`[${index}].conditions.and[${idx}].value`}
                      onChange={handleChange}
                      step={1}
                      suffix="year(s)"
                      type="number"
                      value={cond.value}
                    />
                    <div className="h-8 w-8 self-end pb-2">
                      <Button
                        hasNoBackground
                        icon={IconEnum.trash}
                        isIconOnly
                        onClick={() =>
                          handleChange({
                            name: `[${index}].conditions.and`,
                            value: (item.conditions.and || []).toSpliced(idx, 1),
                          })
                        }
                        variant="error"
                      />
                    </div>
                  </div>
                  {item.conditions.and?.length !== idx + 1 ? (
                    <div className="mt-1 flex w-full justify-center">
                      <div>
                        <Badge label="AND" variant="info" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2 flex w-full flex-col justify-start self-start">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <Title isDrawerTitle label="Conditions - year must match at least one" />
                </div>
                <div>
                  <Button
                    hasNoBackground
                    icon={IconEnum.add}
                    iconSize={18}
                    isIconOnly
                    onClick={() => {
                      const type: LeapDayConditionType = (item.conditions.or || [])?.some((c) => c.type === "every")
                        ? "divisible_by"
                        : "every";
                      handleChange({
                        name: `[${index}].conditions.or`,
                        value: (item.conditions.or || []).concat({ type, value: 0 }),
                      });
                    }}
                    size="xs"
                    variant="info"
                  />
                </div>
              </div>
              {(item.conditions.or || []).map((cond, idx) => (
                <div key={`${cond.type}_${idx.toString()}`} className="mt-1 flex flex-col gap-y-1">
                  <div className="flex items-center gap-x-2">
                    <Select
                      label="Type"
                      name={`[${index}].conditions.or[${idx}].type`}
                      onChange={handleChange}
                      options={LeapDayConditionsEnum}
                      value={cond.type}
                    />
                    <Input
                      label="Value"
                      min={1}
                      name={`[${index}].conditions.or[${idx}].value`}
                      onChange={handleChange}
                      step={1}
                      suffix="year(s)"
                      type="number"
                      value={cond.value}
                    />
                    <div className="h-8 w-8 self-end pb-2">
                      <Button
                        hasNoBackground
                        icon={IconEnum.trash}
                        isIconOnly
                        onClick={() =>
                          handleChange({
                            name: `[${index}].conditions.or`,
                            value: (item.conditions.or || []).toSpliced(idx, 1),
                          })
                        }
                        variant="error"
                      />
                    </div>
                  </div>
                  {item.conditions.or?.length !== idx + 1 ? (
                    <div className="mt-1 flex w-full justify-center">
                      <div>
                        <Badge label="OR" variant="info" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    { id: "2", label: "Eras", icon: IconEnum.era },
  ];
  if (permissions?.read_tags) {
    tabs.push({ id: "3", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "4", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function CalendarDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [calendar, setCalendar] = useState<Partial<CalendarType>>({ project_id });
  const [months, setMonths] = useState<MonthStateType[]>([]);
  const [days, setDays] = useState<DayStateType[]>([]);
  const [leapDays, setLeapDays] = useState<LeapDayStateType[]>([]);
  const resetDrawer = useResetAtom(drawerAtom);

  const { data: existingCalendar, isFetching } = useGetEntity<CalendarType>(
    data?.id,
    "calendars",
    {
      fields: ["id", "title", "icon", "hours", "minutes", "days", "starts_on_day", "is_folder", "is_public", "parent_id"],
      relations: { eras: true, months: true, leap_days: true, tags: true },
      permissions: true,
    },
    { enabled: !!data?.id, queryKeyConcat: ["drawer"] },
  );

  const { handleChange } = useHandleChange({ data: calendar, setData: setCalendar });

  const { mutateAsync: createCalendar, isLoading: isCreating } = useCreateEntity<InsertCalendarType>("calendars");
  const { mutateAsync: updateCalendar, isLoading: isUpdating } = useUpdateEntity<UpdateCalendarType>(
    "calendars",
    project_id as string,
  );
  const permissions = useHasPermissions(
    ["read_calendars", "create_calendars", "update_calendars", "read_tags", "read_character_fields_templates"],
    calendar?.owner_id,
  );
  const tabs = getTabs(permissions, data?.id);

  useLayoutEffect(() => {
    if (existingCalendar?.data) {
      const { months: mths, leap_days, ...cal } = existingCalendar.data;
      setCalendar(cal);
      setMonths(mths);
      setLeapDays(leap_days);
      setDays(cal.days.map((d) => ({ id: crypto.randomUUID(), title: d })));
    }
  }, [existingCalendar]);

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertCalendarSchema.parse({
        data: { ...calendar, days: days.map((d) => d.title) },
        relations: {
          eras: (calendar.eras || []).map((e) => ({
            data: { ...e, background_gradient: JSON.stringify(e.color) },
          })),
          months: months.map((m, i) => ({ data: { ...m, sort: i } })).sort((a, b) => a.data.sort - b.data.sort),
          leap_days: leapDays.map((ld) => ({ data: ld })),
          tags: calendar.tags,
        },
        permissions: calendar?.permissions,
      });
      await createCalendar(parsedData, { onSuccess: resetDrawer });
    } else {
      const parsedData = UpdateCalendarSchema.parse({
        data: { ...calendar, days: days.map((d) => d.title) },
        relations: {
          eras: (calendar.eras || []).map((e) => ({
            data: { ...e, background_gradient: JSON.stringify(e.color) },
          })),
          months: months.map((m, i) => ({ data: { ...m, sort: i } })).sort((a, b) => a.data.sort - b.data.sort),
          leap_days: leapDays.map((ld) => ({ data: ld })),
          tags: calendar.tags,
        },
        permissions: calendar?.permissions,
      });
      await updateCalendar(parsedData, { onSuccess: resetDrawer });
    }
  }

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <div className="max-h-[90%] overflow-y-auto">
          <div className="flex flex-nowrap gap-x-2">
            <Input label="Title (required)" name="title" onChange={handleChange} value={calendar?.title || ""} />

            <div className="self-end pb-1.5">
              <IconPicker icon={calendar?.icon || IconEnum.calendar} name="icon" onChange={handleChange} />
            </div>
          </div>

          <div className="flex flex-nowrap items-center gap-x-2">
            <Input
              label="Hours (optional)"
              min={0}
              name="hours"
              onChange={handleChange}
              placeholder="How many hours in a day?"
              type="number"
              value={calendar?.hours || ""}
            />
            <Input
              label="Minutes (optional)"
              min={0}
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
              value={typeof calendar?.starts_on_day === "number" ? calendar?.starts_on_day?.toString() : null}
            />
          </div>

          <FolderSelect handleChange={handleChange} parent_id={calendar?.parent_id ?? null} type="calendars" />
          <div className="my-2 flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={calendar?.is_public ?? false} />
          </div>

          <Collapsible icon={IconEnum.moon} label="Months (required)">
            <MonthsSection months={months} setMonths={setMonths} />
          </Collapsible>
          <Collapsible icon={IconEnum.sun} label="Days (required)">
            <DaysSection days={days} setDays={setDays} />
          </Collapsible>
          <Collapsible icon={IconEnum.leap_day} label="Leap days (optional)">
            <LeapDaysSection leapDays={leapDays} months={months} parent_id={calendar?.id as string} setLeapDays={setLeapDays} />
          </Collapsible>
        </div>
      ) : null}
      {tabs[selectedTab].id === "2" ? (
        <div>
          <div className="flex items-center justify-between">
            <span>Add era:</span>
            <div className="h-8 w-8">
              <Button
                icon={IconEnum.add}
                onClick={() =>
                  handleChange({
                    name: "eras",
                    value: (calendar.eras || []).concat({
                      id: crypto.randomUUID(),
                      title: "New era",
                      parent_id: calendar.id as string,
                      color: DefaultTagColor,
                      start_day: 1,
                      start_month: 0,
                      start_year: 1,
                      start_month_id: months[0].id,
                      end_day: 1,
                      end_month: 0,
                      end_year: 1,
                      end_month_id: months[0].id,
                    }),
                  })
                }
                variant="info"
              />
            </div>
          </div>

          {calendar.eras?.map((era, i) => (
            <Collapsible
              key={era.id}
              actions={[
                {
                  icon: IconEnum.trash,
                  variant: "error",
                  isIconOnly: true,
                  onClick: () => handleChange({ name: "eras", value: (calendar.eras || [])?.filter((e) => e.id !== era.id) }),
                },
              ]}
              initialOpen={era.title === "New era"}
              label={era.title}>
              <div className="flex items-start justify-between gap-x-2 p-2">
                <Input label="Title" name={`eras[${i}].title`} onChange={handleChange} value={era.title} />
                <div className="mb-2 w-6 self-end">
                  <ColorPicker name={`eras[${i}].color`} onChange={handleChange} value={era.color || DefaultTagColor} />
                </div>
              </div>
              <div className="flex items-center justify-between gap-x-2 p-2">
                <Input
                  label="Start day (required)"
                  max={months[era.start_month].days}
                  min={1}
                  name={`eras[${i}].start_day`}
                  onChange={handleChange}
                  type="number"
                  value={era?.start_day || ""}
                />
                <Select
                  label="Start month (required)"
                  name={`eras[${i}].start_month_id`}
                  onChange={(newData) => {
                    const monthIdx = months.findIndex((m) => m.id === newData.value);
                    handleChange([newData, { name: `eras[${i}].start_month`, value: monthIdx }]);
                  }}
                  options={months?.map((month) => ({ label: month.title, value: month.id })) || []}
                  value={typeof era?.start_month === "number" ? months?.[era.start_month]?.id : undefined}
                />
                <Input
                  label="Start year (required)"
                  name={`eras[${i}].start_year`}
                  onChange={handleChange}
                  type="number"
                  value={era?.start_year || ""}
                />
              </div>
              <div className="flex items-center justify-between gap-x-2 p-2">
                <Input
                  label="End day (required)"
                  max={months[era.end_month].days}
                  min={1}
                  name={`eras[${i}].end_day`}
                  onChange={handleChange}
                  type="number"
                  value={era?.end_day || ""}
                />
                <Select
                  label="End month (required)"
                  name={`eras[${i}].end_month_id`}
                  onChange={(newData) => {
                    const monthIdx = months.findIndex((m) => m.id === newData.value);
                    handleChange([newData, { name: `eras[${i}].end_month`, value: monthIdx }]);
                  }}
                  options={months?.map((month) => ({ label: month.title, value: month.id })) || []}
                  value={typeof era?.end_month === "number" ? months?.[era.end_month]?.id : undefined}
                />
                <Input
                  label="End year (required)"
                  name={`eras[${i}].end_year`}
                  onChange={handleChange}
                  type="number"
                  value={era?.end_year || ""}
                />
              </div>
            </Collapsible>
          ))}
        </div>
      ) : null}
      {tabs[selectedTab].id === "3" && permissions?.read_tags ? (
        <TagInput handleChange={handleChange} tags={calendar?.tags || []} />
      ) : null}

      {tabs[selectedTab].id === "4" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          permissions={calendar?.permissions || []}
          related_id={calendar?.id || null}
          selectablePermissions={["read_calendars", "update_calendars", "delete_calendars"]}
        />
      ) : null}

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
    </DrawerLayout>
  );
}
