import { useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { useLayoutEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Alert, Badge, Button, Input, Select, Skeleton, Tooltip } from "../../components";
import { useChangeNavbarTitle, useDeleteSubEntity, useGetEntities, useGetEntity, useGetSubEntity } from "../../hooks";
import { CalendarType, CurrentDateType, EventType } from "../../types/EntityTypes/calendarTypes";
import {
  contextMenuAtom,
  DefaultTagColor,
  drawerAtom,
  getFillerDayNumber,
  getImageURL,
  getLeapDays,
  getStartingDayForMonth,
  IconEnum,
} from "../../utils";
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

export function CalendarView({ id, data, isPublic }: { id?: string; data?: CalendarType; isPublic?: boolean }) {
  const { project_id, item_id, subitem_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const [date, setDate] = useState<CurrentDateType>({
    month: ls.get(`calendar_${id || item_id}_month`) ?? 0,
    year: ls.get(`calendar_${id || item_id}_year`) ?? 1,
  });
  const [view, setView] = useState<"calendar" | "timeline">(ls.get(`calendar_or_timeline_view_${item_id}`) ?? "calendar");
  const [queryKey, setQueryKey] = useState<any[]>(["allEntities", project_id, item_id, "events", date, view]);

  const { data: existingCalendar, isInitialLoading: isInitalLoadingCalendar } = useGetEntity<CalendarType>(
    item_id || id,
    "calendars",
    {
      data: { project_id },
      fields: ["id", "title", "icon", "days", "hours", "minutes", "is_public"],
      relations: { eras: true, months: true, leap_days: true },
    },
    {
      enabled: !data,
      isPublic,
    },
  );
  const calendar = data ?? existingCalendar?.data;
  const { data: events, isLoading } = useGetEntities<EventType>(
    {
      data: { project_id, parent_id: item_id || id },
      pagination: {
        limit: 1000,
      },
      fields: [
        "id",
        "title",
        "image_id",
        "background_color",
        "start_day",
        "start_month_id",
        "end_month_id",
        "start_year",
        "end_day",
        "end_year",
        "hours",
        "minutes",
      ],
      filters: {
        and:
          view === "calendar"
            ? [
                {
                  id: "parent",
                  header_name: "Parent",
                  field: "parent_id",
                  value: (item_id || id) as string,
                  operator: "eq",
                },
              ]
            : [
                {
                  id: "parent",
                  header_name: "Parent",
                  field: "parent_id",
                  value: item_id as string,
                  operator: "eq",
                },
              ],

        or:
          view === "calendar" && existingCalendar?.data?.months?.[date.month]?.id
            ? [
                {
                  id: "start_month_id",
                  header_name: "Start month",
                  field: "start_month_id",
                  value: existingCalendar?.data?.months?.[date.month].id,
                  operator: "eq",
                },
                {
                  id: "end_month_id",
                  header_name: "End month",
                  field: "end_month_id",
                  value: existingCalendar?.data?.months?.[date.month].id,
                  operator: "eq",
                },
              ]
            : [],
      },
      orderBy: [
        { field: "hours", sort: "asc" },
        { field: "minutes", sort: "asc" },
      ],
    },
    "events",
    {
      enabled: !!calendar && !!(item_id || id),
      queryKeyOverwrite: queryKey,
      staleTime: 5 * 60 * 1000,
      isPublic,
    },
  );
  const { data: subitemEvent } = useGetSubEntity<EventType>(
    subitem_id,
    "events",
    {
      data: { parent_id: item_id || id },
      fields: [
        "id",
        "title",
        "description",
        "background_color",
        "document_id",
        "end_day",
        "end_month",
        "end_year",
        "start_day",
        "start_month",
        "start_year",
        "image_id",
        "is_public",
        "parent_id",
        "minutes",
        "hours",
        "text_color",
      ],
    },
    { enabled: !!subitem_id, isPublic },
  );
  const { mutate: deleteEvent } = useDeleteSubEntity("events", project_id as string);
  useChangeNavbarTitle(`Calendars | ${calendar?.title}`, !!calendar);

  useLayoutEffect(() => {
    setQueryKey(["allEntities", project_id, item_id ?? id, "events", view, view === "calendar" ? date : null, date.year]);
  }, [date, view]);

  useLayoutEffect(() => {
    if (subitem_id && subitemEvent?.data) {
      if (date.year !== subitemEvent?.data?.start_year || date.month !== subitemEvent?.data?.start_month)
        setDate({ year: subitemEvent?.data?.start_year, month: subitemEvent?.data?.start_month });
    }
  }, [subitem_id, subitemEvent]);

  const matchingEra = (calendar?.eras || []).find((era) => date.year >= era.start_year && date.year <= era.end_year);
  const monthDays = typeof calendar?.months?.[date.month]?.days === "number" ? calendar.months[date.month].days : 0;
  const leapDayCount = useMemo(() => getLeapDays(calendar?.leap_days || [], calendar?.months || [], date), [date, calendar]);
  const previousMonthLeapDayCount = useMemo(
    () =>
      getLeapDays(calendar?.leap_days || [], calendar?.months || [], {
        year: date.month - 1 === -1 ? date.year - 1 : date.year,
        month: date.month - 1 === -1 ? (calendar?.months?.length ?? 1) - 1 : date.month - 1,
      }),
    [date, calendar],
  );
  if (!calendar) return null;
  const startingDayForMonth = getStartingDayForMonth(
    calendar?.months,
    date?.year,
    date?.month,
    calendar?.days?.length,
    calendar?.starts_on_day || 0,
    previousMonthLeapDayCount,
  );

  if (isInitalLoadingCalendar) return <Skeleton type="calendar_view" />;
  if (!calendar) return <Alert label="Calendar not found." variant="error" />;

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
                  const idx = calendar.months.findIndex((m) => m.id === value);
                  if (idx > -1) {
                    setDate((prev) => ({ ...prev, month: idx }));
                    ls.set(`calendar_${calendar.id}_month`, idx);
                  }
                }}
                options={calendar?.months?.map((month) => ({ value: month.id, label: month.title }))}
                placeholder="Month"
                value={calendar?.months?.[date.month]?.id}
              />
            </div>
            <div className="w-32">
              <Input
                label="Year"
                name="year"
                onChange={({ value }) => {
                  setDate((prev) => ({ ...prev, year: value as number }));
                  ls.set(`calendar_${calendar.id}_year`, value);
                }}
                placeholder="Year"
                step={1}
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
              ls.set(`calendar_or_timeline_view_${item_id}`, value);
            }}
            options={[
              { label: "Calendar", value: "calendar", icon: IconEnum.calendar },
              { label: "Timeline", value: "timeline", icon: IconEnum.timeline_gantt },
            ]}
            placeholder="View"
            value={view}
          />
        </div>
        {id || isPublic ? null : (
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
        )}
      </div>

      {view === "calendar" ? (
        <div
          // check for id -> used as a preview in drawer
          className={`grid overflow-auto border border-zinc-700 ${id ? "bg-zinc-900" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${calendar?.days?.length || 0}, minmax(9rem, 1fr))`,
          }}>
          {calendar?.days?.map((day) => (
            <div
              key={day}
              className="group sticky top-0 col-span-1 h-min border-b border-r border-zinc-700 bg-black px-2 text-white"
              onKeyDown={() => {}}
              role="button"
              tabIndex={-1}>
              {day}
            </div>
          ))}
          {[...Array(calendar?.days?.length ? Math.abs(startingDayForMonth % calendar.days.length) : 1).keys()]
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
                  dayNumber={getFillerDayNumber(calendar?.months, date.month, day, previousMonthLeapDayCount)}
                  isFiller
                  isReadOnly={isPublic}
                  monthNumber={date.month}
                  year={date.year}
                />
              </div>
            ))}
          {[...Array(monthDays + leapDayCount).keys()].map((day) => (
            <div
              key={day}
              className="group col-span-1 flex h-56 flex-col border-b border-r border-zinc-700 bg-opacity-85 hover:text-white"
              style={{
                backgroundColor:
                  matchingEra && (matchingEra.start_day <= day || matchingEra.end_day >= day)
                    ? `${matchingEra?.color || DefaultTagColor}aa`
                    : "transparent",
              }}>
              <DayNumber key={day} dayNumber={day} isReadOnly={isPublic} monthNumber={date.month} year={date.year} />
              <div className="flex flex-col gap-y-0.5 overflow-auto px-1">
                {(isLoading ? [] : events?.data || [])
                  ?.filter((event) => {
                    return (
                      (event.start_day === day + 1 &&
                        event.start_month_id === calendar.months?.[date.month]?.id &&
                        event.start_year === date.year) ||
                      (event.end_month_id === calendar.months?.[date.month]?.id &&
                        event.end_day === day + 1 &&
                        event.end_year === date.year)
                    );
                  })

                  .map((event) => {
                    return (
                      <Tooltip
                        key={event.id}
                        content={`${event.title} ${event.start_day === day + 1 && !!event.end_day ? "(start)" : ""} ${
                          event.end_day === day + 1 ? "(end)" : ""
                        }`}
                        variant="secondary">
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            id || isPublic
                              ? setDrawer((prev) => ({
                                  ...prev,
                                  title: "Preview event",
                                  type: "entity_preview",
                                  data: { id: event.id, entity_type: "events" },
                                  size: "lg",
                                }))
                              : setDrawer((prev) => ({
                                  ...prev,
                                  title: "Edit event",
                                  type: "events",
                                  data: { id: event.id, month: date.month, year: date.year },
                                  size: "lg",
                                }))
                          }
                          onContextMenu={(e: any) => {
                            e.preventDefault();
                            setContextMenu({
                              event: e,
                              items:
                                id || isPublic
                                  ? [
                                      {
                                        id: "1",
                                        title: "Preview event",
                                        icon: IconEnum.eye,
                                        onClick: () =>
                                          setDrawer((prev) => ({
                                            ...prev,
                                            title: "Preview event",
                                            type: "entity_preview",
                                            data: { id: event.id, entity_type: "events" },
                                            size: "lg",
                                          })),
                                      },
                                    ]
                                  : [
                                      {
                                        id: "1",
                                        title: "Edit event",
                                        icon: IconEnum.add,
                                        onClick: () =>
                                          setDrawer((prev) => ({
                                            ...prev,
                                            title: "Edit event",
                                            type: "events",
                                            data: { id: event.id, month: date.month, year: date.year },
                                            size: "lg",
                                          })),
                                      },
                                      {
                                        id: "2",
                                        title: "Delete event",
                                        icon: IconEnum.trash,
                                        onClick: () => {
                                          deleteEvent({ data: { id: event.id, parent_id: event.parent_id } });
                                        },
                                      },
                                    ],
                            });
                          }}
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
                    );
                  })}
              </div>
            </div>
          ))}
          {[
            ...Array(
              calendar?.days?.length
                ? calendar.days.length - ((startingDayForMonth + Number(monthDays)) % calendar.days.length)
                : 0,
            ).keys(),
          ]
            .reverse()
            .map((day, idx) => (
              <div
                key={day}
                className="group col-span-1 h-56 cursor-default border-b border-r border-zinc-700 hover:text-white"
                onKeyDown={() => {}}
                role="button"
                tabIndex={-1}>
                <DayNumber key={day} dayNumber={idx} isFiller isReadOnly={isPublic} monthNumber={date.month} year={date.year} />
              </div>
            ))}
        </div>
      ) : (
        <TimelineView events={events?.data || []} months={calendar?.months || []} />
      )}
    </div>
  );
}
