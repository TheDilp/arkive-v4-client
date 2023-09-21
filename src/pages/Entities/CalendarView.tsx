import { useSetAtom } from "jotai";
import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Badge, Button, Input, Select, Skeleton, Tooltip } from "../../components";
import { useChangeNavbarTitle, useGetEntities, useGetEntity, useGetSubEntity } from "../../hooks";
import { CalendarType, CurrentDateType, EventType } from "../../types/EntityTypes/calendarTypes";
import { DefaultTagColor, drawerAtom, getFillerDayNumber, getImageURL, getStartingDayForMonth, IconEnum } from "../../utils";
import { TimelineView } from "./TimelineView";

export function DayNumber({
  dayNumber,
  monthNumber,
  year,
  isFiller,
  isReadOnly,
}: {
  dayNumber: number;
  monthNumber: number;
  year: number;
  isFiller?: boolean;
  isReadOnly?: boolean;
}) {
  const setDrawer = useSetAtom(drawerAtom);
  return (
    <span className={`${isFiller ? "text-zinc-800" : ""} flex select-none items-center p-1`}>
      {dayNumber + 1}
      {!isFiller && !isReadOnly ? (
        <span className="ml-auto opacity-0 transition-all duration-100 hover:text-sky-400 group-hover:opacity-100">
          <Button
            hasNoBackground
            icon={IconEnum.add}
            isIconOnly
            onClick={() => {
              if (!isFiller)
                setDrawer((prev) => ({
                  ...prev,
                  type: "events",
                  title: "Create new event",
                  data: { day: dayNumber + 1, month: monthNumber, year },
                  size: "lg",
                }));
            }}
          />
        </span>
      ) : null}
    </span>
  );
}

export function CalendarView() {
  const { project_id, item_id, subitem_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const [date, setDate] = useState<CurrentDateType>({ month: 0, year: 1 });
  const [view, setView] = useState<"calendar" | "timeline">("calendar");
  const [queryKey, setQueryKey] = useState<any[]>(["allEntities", project_id, "events", item_id, date]);

  const { data: existingCalendar, isFetching: isFetchingCalendar } = useGetEntity<CalendarType>(item_id, "calendars", {
    data: { project_id },
    relations: { months: true },
  });
  const { data: events } = useGetEntities<EventType>(
    {
      data: { project_id },
      filters: {
        and:
          view === "calendar"
            ? [
                {
                  field: "parent_id",
                  value: item_id as string,
                  operator: "eq",
                },
                {
                  field: "start_year",
                  operator: "eq",
                  value: date.year,
                },
              ]
            : [
                {
                  field: "parent_id",
                  value: item_id as string,
                  operator: "eq",
                },
              ],
      },
      // fields: ["id", "title", "image_id", "start_day", "start_month", "start_year", "parent_id", "background_color", "s"],
      orderBy: [
        { field: "hours", sort: "asc" },
        { field: "minutes", sort: "asc" },
      ],
    },
    "events",
    {
      enabled: !!existingCalendar?.data,
      queryKeyOverwrite: queryKey,
    },
  );
  const { data: subitemEvent, isFetching: isFetchingEvent } = useGetSubEntity<EventType>(
    subitem_id,
    "events",
    { data: { parent_id: item_id } },
    { enabled: !!subitem_id },
  );
  useChangeNavbarTitle(`The Arkive | Calendars | ${existingCalendar?.data?.title}`, !!existingCalendar?.data);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setQueryKey(["allEntities", project_id, "events", item_id, view, view === "calendar" ? date : null]);
    }, 300);
    return () => clearTimeout(timeout);
  }, [date]);

  useEffect(() => {
    setQueryKey(["allEntities", project_id, "events", item_id, view, view === "calendar" ? date : null]);
  }, [view]);

  useLayoutEffect(() => {
    if (subitem_id && subitemEvent?.data) {
      if (date.year !== subitemEvent?.data?.start_year || date.month !== subitemEvent?.data?.start_month)
        setDate({ year: subitemEvent?.data?.start_year, month: subitemEvent?.data?.start_month });
    }
  }, [subitem_id, subitemEvent]);

  const monthDays = existingCalendar?.data?.months?.[date.month]?.days;
  if (!existingCalendar?.data) return null;

  if (isFetchingCalendar || isFetchingEvent) return <Skeleton type="calendar_view" />;

  return (
    <div className="flex h-[calc(100%-6rem)] flex-col pb-4">
      <div className="sticky top-0 mb-2 flex w-full items-center justify-end gap-x-2">
        {view === "calendar" ? (
          <>
            <div className="w-32">
              <Select
                label="Month"
                name="number"
                onChange={({ value }) => {
                  const idx = existingCalendar.data.months.findIndex((m) => m.id === value);
                  if (idx > -1) {
                    setDate((prev) => ({ ...prev, month: idx }));
                  }
                  //   ls.set("characters_view", value);
                }}
                options={existingCalendar?.data.months.map((month) => ({ value: month.id, label: month.title }))}
                placeholder="Month"
                value={existingCalendar?.data?.months[date.month].id}
              />
            </div>
            <div className="w-32">
              <Input
                label="Year"
                name="year"
                onChange={({ value }) => {
                  setDate((prev) => ({ ...prev, year: value as number }));
                  //   ls.set("characters_view", value);
                }}
                placeholder="Year"
                type="number"
                value={date.year}
              />
            </div>
          </>
        ) : null}

        <div className="w-32">
          <Select
            label="View"
            name="view"
            onChange={({ value }) => {
              setView(value as "calendar" | "timeline");
              // ls.set("timeline_view", value);
            }}
            options={[
              { label: "Calendar", value: "calendar", icon: IconEnum.calendar },
              { label: "Timeline", value: "timeline", icon: IconEnum.timeline_gantt },
            ]}
            placeholder="View"
            value={view}
          />
        </div>
        <div className="w-fit self-end">
          <Button
            icon={IconEnum.add}
            label="Create new event"
            onClick={() => {
              setDrawer((prev) => ({
                ...prev,
                data: { month: date.month, year: date.year },
                title: "Create new event",
                type: "events",
                size: "lg",
              }));
            }}
          />
        </div>
      </div>

      {view === "calendar" ? (
        <div
          className="grid overflow-auto border border-zinc-700"
          style={{
            gridTemplateColumns: `repeat(${existingCalendar?.data?.days?.length || 0}, minmax(9rem, 1fr))`,
          }}>
          {existingCalendar?.data?.days?.map((day) => (
            <div
              key={day}
              className="group sticky top-0 col-span-1 h-min border-b border-r border-zinc-700 bg-black px-2 text-white"
              onKeyDown={() => {}}
              role="button"
              tabIndex={-1}>
              {day}
            </div>
          ))}
          {[
            ...Array(
              existingCalendar?.data?.days?.length
                ? getStartingDayForMonth(
                    existingCalendar?.data?.months,
                    date?.year,
                    date?.month,
                    existingCalendar?.data?.days?.length,
                  ) % existingCalendar.data.days.length
                : 0,
            ).keys(),
          ]
            .reverse()
            .map((day) => (
              <div
                key={day}
                className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white"
                onKeyDown={() => {}}
                role="button"
                tabIndex={-1}>
                <DayNumber
                  key={day}
                  dayNumber={getFillerDayNumber(existingCalendar?.data?.months, date.month, day)}
                  isFiller
                  //   isReadOnly={isReadOnly}
                  monthNumber={date.month}
                  year={date.year}
                />
              </div>
            ))}
          {[...Array(monthDays).keys()].map((day) => (
            <div key={day} className="group col-span-1 flex h-56 flex-col border-b border-r border-zinc-700 hover:text-white">
              <DayNumber key={day} dayNumber={day} monthNumber={date.month} year={date.year} />
              <div className="flex flex-col gap-y-0.5 overflow-auto px-1">
                {(events?.data || [])
                  ?.filter(
                    (event) =>
                      (event.start_day === day + 1 || event.end_day === day + 1) &&
                      (event.start_month === date.month || event?.end_month === date.month),
                  )
                  .map((event) => (
                    <Tooltip
                      key={event.id}
                      content={`${event.title} ${event.start_day === day + 1 && !!event.end_day ? "(start)" : ""} ${
                        event.end_day === day + 1 ? "(end)" : ""
                      }`}
                      variant="secondary">
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setDrawer((prev) => ({
                            ...prev,
                            title: "Edit event",
                            type: "events",
                            data: { id: event.id, month: date.month, year: date.year },
                            size: "lg",
                          }))
                        }
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={-1}>
                        {event.image_id ? (
                          <div className="relative h-24 w-full overflow-hidden rounded-md">
                            <span className="absolute z-10 max-w-full truncate px-1 text-sm">{event.title}</span>
                            <div
                              className="absolute h-full w-full bg-cover bg-center opacity-60 "
                              style={{
                                backgroundImage: `url(${getImageURL(project_id as string, "images", event.image_id)})`,
                              }}
                            />
                          </div>
                        ) : (
                          <Badge
                            customColor={event.background_color || DefaultTagColor}
                            label={`${event.title} ${event.start_day === day + 1 && !!event.end_day ? "(start)" : ""} ${
                              event.end_day === day + 1 ? "(end)" : ""
                            }`}
                          />
                        )}
                      </div>
                    </Tooltip>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TimelineView events={events?.data || []} month_count={existingCalendar?.data?.months.length || 0} />
      )}
    </div>
  );
}
