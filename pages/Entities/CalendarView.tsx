import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import groupBy from "lodash.groupby";
import { Dispatch, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Dropdown,
  EntityPreview,
  Icon,
  Input,
  Select,
  Skeleton,
  Tooltip,
} from "../../components";
import {
  useDeleteSubEntity,
  useGetEntities,
  useGetEntity,
  useGetSubEntity,
  useHasPermissions,
  useNavbarTitle,
} from "../../hooks";
import { DrawerAtomType, UserHasPermissionsType, UserType } from "../../types";
import { CalendarFilters, CalendarType, CurrentDateType, EventType, MonthType } from "../../types/EntityTypes/calendarTypes";
import {
  contextMenuAtom,
  DefaultTagColor,
  drawerAtom,
  formatDateToString,
  getAvatarInitials,
  getCalendarFilterBadges,
  getCalendarFilters,
  getDefaultEntityIcon,
  getEntityLink,
  getFillerDayNumber,
  getFilterTooltip,
  getIconUrlFromIconEnum,
  getAssetURL,
  getLeapDays,
  getStartingDayForMonth,
  hasActionPermission,
  hasEntityUpdatePermissionForEntityView,
  IconEnum,
  isProjectOwnerAtom,
  projectFeatureFlagsAtom,
  userAtom,
} from "../../utils";
import { TimelineView } from "./TimelineView";

function DayNumber({
  dayNumber,
  monthNumber,
  year,
  isFiller,
  isReadOnly,

  event_ids,
}: {
  dayNumber: number;
  monthNumber: number;
  year: number;
  isFiller?: boolean;
  isReadOnly?: boolean;
  event_ids: string[];
}) {
  const setDrawer = useSetAtom(drawerAtom);
  return (
    <span className={`${isFiller ? "text-zinc-800" : ""} flex select-none items-center p-1`}>
      {dayNumber + 1}
      {!isFiller && !isReadOnly ? (
        <span className="ml-auto flex items-center gap-x-1 opacity-0 transition-all duration-100 hover:text-sky-400 group-hover:opacity-100">
          <Button
            hasNoBackground
            icon={IconEnum.edit}
            isIconOnly
            onClick={() => {
              if (!isFiller)
                setDrawer((prev) => ({
                  ...prev,
                  type: "event_management",
                  title: "Manage events",
                  data: { date: { month: monthNumber, year }, event_ids },
                  size: "lg",
                }));
            }}
          />
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
function CalendarRangeEvents({
  events,
  setDrawer,
  deleteEvent,
  months,
  calendar_id,
  permissions,
  user,
  isProjectOwner,
}: {
  events: EventType[];
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
  deleteEvent: any;
  calendar_id: string;
  months: MonthType[];
  permissions: UserHasPermissionsType;
  user: UserType | null;
  isProjectOwner: boolean;
}) {
  const { project_id } = useParams();
  const grouped = groupBy(events, "start_year");
  return Object.entries(grouped).map(([year, groupedEvents]) => {
    return (
      <div className="my-2" key={year}>
        <h3 className="font-merriweather text-xl">Year {year}</h3>
        {groupedEvents.map((event) => {
          const updatePermissions = hasActionPermission(
            isProjectOwner,
            user?.id === event?.owner_id,
            permissions,
            event?.permissions || [],
            "update_events",
            user?.role?.id
          );
          const deletePermissions = hasActionPermission(
            isProjectOwner,
            user?.id === event?.owner_id,
            permissions,
            event?.permissions || [],
            "delete_events",
            user?.role?.id
          );
          return (
            <div
              className="my-0.5 flex h-12 items-center rounded border border-zinc-700 bg-zinc-900 bg-cover bg-no-repeat p-2"
              key={event.id}>
              <div className="flex items-center gap-x-2">
                <span>{event.title}</span>
                <Tooltip
                  content={`${formatDateToString(event.start_day, event.start_year, event.start_month_id, months)} ${
                    event?.end_year
                      ? `- ${formatDateToString(event.end_day || 0, event.end_year, event.end_month_id || "", months)}`
                      : ""
                  }`}
                  customOffset={{
                    mainAxis: 10,
                  }}>
                  <div>
                    <Icon icon={IconEnum.calendar} />
                  </div>
                </Tooltip>
              </div>

              <div className="ml-auto flex items-center gap-x-10">
                {event.document ? (
                  <div className="flex items-center">
                    <EntityPreview
                      hasNoBackground
                      icon={event.document.icon || getDefaultEntityIcon("documents")}
                      id={event.document.id}
                      link={getEntityLink(project_id as string, "documents", event.document.id)}
                      size="sm"
                      title={event.document.title}
                      type="documents"
                    />
                  </div>
                ) : null}
                <div className="flex items-center -space-x-4">
                  {event?.map_pins
                    ?.slice(0, 5)
                    ?.map((pin) => (
                      <Avatar
                        image={
                          pin.image_id
                            ? getAssetURL(project_id as string, "images", pin.image_id)
                            : getIconUrlFromIconEnum(pin.icon, pin.color || "#ffffff")
                        }
                        initials={getAvatarInitials(pin.title || "")}
                        isPreview
                        key={pin.id}
                        label={pin.title || ""}
                        size="xs"
                        tooltipAllowedPlacements={["top"]}
                      />
                    ))}
                  {event.characters && event.characters?.length && event.characters?.length > 5 ? (
                    <Tooltip
                      content={event.characters
                        ?.slice(5)
                        .map((char) => char.full_name || "")
                        .join(", ")}>
                      <div className="w-min max-w-min">
                        <Badge label={`+${event.characters.length - 5}`} size="sm" variant="secondary" />
                      </div>
                    </Tooltip>
                  ) : null}
                </div>
                <div className="flex items-center -space-x-4">
                  {event?.characters
                    ?.slice(0, 5)
                    ?.map((char) => (
                      <Avatar
                        image={getAssetURL(project_id as string, "images", char.portrait_id)}
                        initials={getAvatarInitials(char.full_name)}
                        key={char.id}
                        label={char.full_name}
                        size="xs"
                        tooltipAllowedPlacements={["top"]}
                      />
                    ))}
                  {event.characters && event.characters?.length && event.characters?.length > 5 ? (
                    <Tooltip
                      content={event.characters
                        ?.slice(5)
                        .map((char) => char.full_name || "")
                        .join(", ")}>
                      <div className="w-min max-w-min">
                        <Badge label={`+${event.characters.length - 5}`} size="sm" variant="secondary" />
                      </div>
                    </Tooltip>
                  ) : null}
                </div>
                <div className="">
                  <Dropdown
                    allowedPlacements={["left", "left-end", "left-start"]}
                    items={
                      IS_PUBLIC
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
                                  data: { id: event.id, parent_id: calendar_id, entity_type: "events" },
                                  size: "lg",
                                })),
                            },
                            {
                              id: "2",
                              title: "Preview document",
                              icon: IconEnum.text_align_justify,
                              isDisabled: !event.document_id,
                              onClick: () =>
                                setDrawer((prev) => ({
                                  ...prev,
                                  title: "Preview document",
                                  type: "entity_preview",
                                  size: "lg",
                                  data: { id: event.document_id as string, entity_type: "documents" },
                                })),
                            },
                          ]
                        : [
                            {
                              id: "1",
                              title: "Edit event",
                              icon: IconEnum.edit,
                              isDisabled: !updatePermissions,
                              onClick: () =>
                                setDrawer((prev) => ({
                                  ...prev,
                                  title: "Edit event",
                                  type: "events",
                                  data: { id: event.id, parent_id: calendar_id },
                                  size: "lg",
                                })),
                            },
                            {
                              id: "2",
                              title: "Preview document",
                              icon: IconEnum.text_align_justify,
                              isDisabled: !event.document_id,
                              onClick: () =>
                                setDrawer((prev) => ({
                                  ...prev,
                                  title: "Preview document",
                                  type: "entity_preview",
                                  size: "lg",
                                  data: { id: event.document_id as string, entity_type: "documents" },
                                })),
                            },
                            {
                              id: "3",
                              title: "Delete event",
                              isDisabled: !deletePermissions,
                              icon: IconEnum.trash,
                              onClick: () => {
                                deleteEvent({ data: { id: event.id, parent_id: event.parent_id } });
                              },
                            },
                          ]
                    }>
                    <Button hasNoBackground icon={IconEnum.actions} iconSize={24} isIconOnly onClick={undefined} />
                  </Dropdown>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  });
}

export function CalendarView({
  id,
  data,
  event_id,
  isCharacterCalendar,
}: {
  id?: string;
  data?: CalendarType;
  event_id?: string;
  isCharacterCalendar?: boolean;
}) {
  const user = useAtomValue(userAtom);
  const featureFlags = useAtomValue(projectFeatureFlagsAtom);
  const firstRender = useRef(true);
  const { project_id, item_id, subitem_id } = useParams();
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);

  const [date, setDate] = useState<CurrentDateType>({
    month: ls.get(`calendar_${id || item_id}_month`) ?? 0,
    year: ls.get(`calendar_${id || item_id}_year`) ?? 1,
  });
  const [range, setRange] = useState<{ start: number | undefined; end: number | undefined }>({
    start: undefined,
    end: undefined,
  });
  const [view, setView] = useState<"calendar" | "range" | "timeline">(
    isCharacterCalendar ? "range" : (ls.get(`calendar_or_timeline_view_${item_id}`) ?? "calendar")
  );
  const [filters, setFilters] = useState<CalendarFilters>({
    filters: { and: [], or: [] },
    relationFilters: { and: [], or: [] },
  });
  const hasFiltersEnabled =
    filters.filters.and.length ||
    filters.filters.or.length ||
    filters.relationFilters.and.length ||
    filters.relationFilters.or.length;

  const filterBadges = getCalendarFilterBadges(filters);
  const setEntityUpdatePermission = useSetAtom(hasEntityUpdatePermissionForEntityView);

  const [queryKey, setQueryKey] = useState<any[]>([]);

  const { data: existingCalendar, isInitialLoading: isInitalLoadingCalendar } = useGetEntity<CalendarType>(
    item_id || id,
    "calendars",
    {
      data: { project_id },
      fields: ["id", "owner_id", "title", "icon", "days", "hours", "minutes", "is_public", "owner_id"],
      relations: {
        eras: featureFlags?.show_eras_in_calendars || featureFlags?.show_eras_in_timelines || false,
        months: true,
        leap_days: true,
      },
      permissions: true,
    },
    {
      enabled: !data && !!user,
    }
  );

  const calendar = data ?? existingCalendar?.data;

  const permissions = useHasPermissions(
    [
      "read_calendars",
      "update_calendars",
      "read_events",
      "create_events",
      "update_events",
      "read_tags",
      "read_characters",
      "read_map_pins",
      "read_assets",
      "read_documents",
    ],
    calendar?.owner_id
  );

  const { data: events, isLoading } = useGetEntities<EventType>(
    {
      data: { project_id, parent_id: item_id || id },
      pagination: {
        limit: 1000,
      },
      fields: [
        "id",
        "owner_id",
        "title",
        "image_id",
        "background_color",
        "start_day",
        "start_month_id",
        "end_month_id",
        "start_year",
        "end_day",
        "end_year",
        "start_hours",
        "start_minutes",
        "document_id",
      ],
      filters: getCalendarFilters(
        view,
        (id || item_id) as string,
        range.start,
        range.end,
        calendar?.months?.[date.month]?.id as string,
        filters
      ),
      relationFilters: filters.relationFilters || {},
      relations:
        view === "range"
          ? {
              characters: true,
              map_pins: true,
              document: true,
            }
          : {},
      permissions: true,
      orderBy: [
        { field: "start_hours", sort: "asc" },
        { field: "start_minutes", sort: "asc" },
      ],
    },
    "events",
    {
      enabled: !!calendar && !!(item_id || id) && !!queryKey.length,
      queryKeyOverwrite: queryKey,
      staleTime: 5 * 60 * 1000,
    }
  );
  const { data: subitemEvent } = useGetSubEntity<EventType>(
    event_id || subitem_id,
    "events",
    {
      data: { parent_id: item_id || id },
      fields: ["start_month", "start_year", "is_public"],
    },
    { enabled: event_id ? !!event_id : !!subitem_id }
  );
  const { mutate: deleteEvent } = useDeleteSubEntity("events", project_id as string, item_id);
  useNavbarTitle(`Calendars | ${calendar?.title}`, !!calendar);

  useLayoutEffect(() => {
    if (!firstRender.current) {
      const timeout = setTimeout(() => {
        setQueryKey([
          "allEntities",
          project_id,
          item_id ?? id,
          "events",
          view,
          view === "calendar" ? date : null,
          date.year,
          range.start,
          range.end,
          filters,
        ]);
      }, 250);
      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {
      firstRender.current = false;
    };
  }, [date, view, range, filters]);

  useLayoutEffect(() => {
    if (subitem_id && subitemEvent?.data) {
      if (date.year !== subitemEvent?.data?.start_year || date.month !== subitemEvent?.data?.start_month)
        setDate({ year: subitemEvent?.data?.start_year, month: subitemEvent?.data?.start_month });
    }
  }, [subitem_id, subitemEvent]);

  useEffect(() => {
    setEntityUpdatePermission(
      hasActionPermission(
        isProjectOwner,
        user?.id === calendar?.owner_id,
        permissions,
        calendar?.permissions || [],
        "update_calendars",
        user?.role?.id
      )
    );
  }, [calendar]);

  const leapDayCount = useMemo(() => getLeapDays(calendar?.leap_days || [], calendar?.months || [], date), [date, calendar]);
  const previousMonthLeapDayCount = useMemo(
    () =>
      getLeapDays(calendar?.leap_days || [], calendar?.months || [], {
        year: date.month - 1 === -1 ? date.year - 1 : date.year,
        month: date.month - 1 === -1 ? (calendar?.months?.length ?? 1) - 1 : date.month - 1,
      }),
    [date, calendar]
  );

  if (!calendar) return null;
  const matchingEra = (calendar?.eras || []).find((era) => date.year >= era.start_year && date.year <= era.end_year);
  const monthDays = typeof calendar?.months?.[date.month]?.days === "number" ? calendar.months[date.month].days : 0;
  const startingDayForMonth = getStartingDayForMonth(
    calendar?.months,
    date?.year,
    date?.month,
    calendar?.days?.length,
    calendar?.starts_on_day || 0,
    previousMonthLeapDayCount
  );

  if (isInitalLoadingCalendar) return <Skeleton type="calendar_view" />;
  if (!calendar) return <Alert label="Calendar not found." variant="error" />;

  return (
    <div className={`flex flex-col pb-4 ${IS_PUBLIC && view === "calendar" ? "h-[calc(100%-10rem)]" : "h-[calc(100%-2rem)]"}`}>
      <div className="sticky top-0 mb-2 flex w-full items-center justify-end gap-x-2">
        <div className="mr-auto flex items-center gap-x-2 self-end">
          {IS_PUBLIC ? null : (
            <div className="h-11 w-11">
              <Button
                icon={IconEnum.filter}
                isIconOnly
                onClick={() =>
                  setDrawer((prev) => ({
                    ...prev,
                    type: "calendar_filter",
                    data: { setFilters },
                    size: "lg",
                    title: "Calendar filter",
                  }))
                }
                tooltip="Filter events"
                variant="primary"
              />
            </div>
          )}
          {hasFiltersEnabled && !IS_PUBLIC ? (
            <div>
              <Button
                icon={IconEnum.close}
                label="Clear all"
                onClick={() => setFilters({ filters: { and: [], or: [] }, relationFilters: { and: [], or: [] } })}
                size="xs"
                tooltip="Filter events"
                variant="secondary"
              />
            </div>
          ) : null}
          {hasFiltersEnabled && filterBadges.fields.length && !IS_PUBLIC
            ? filterBadges.fields.map((badge) => (
                <Tooltip
                  content={getFilterTooltip({
                    and: filterBadges.andFiltersByField[badge],
                    or: filterBadges.orFiltersByField[badge],
                  })}
                  key={badge}>
                  <div>
                    <Badge label={badge} size="sm" variant="info" />
                  </div>
                </Tooltip>
              ))
            : null}
          {hasFiltersEnabled && filterBadges.relationFields.length && !IS_PUBLIC
            ? filterBadges.relationFields.map((badge) => {
                return (
                  <Tooltip
                    content={getFilterTooltip({
                      and: filterBadges.andRelationFiltersByField[badge],
                      or: filterBadges.orRelationFiltersByField[badge],
                    })}
                    key={badge}>
                    <div>
                      <Badge label={badge} size="sm" variant="info" />
                    </div>
                  </Tooltip>
                );
              })
            : null}
        </div>
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

        {view === "range" || view === "timeline" ? (
          <>
            <div className="w-32">
              <Input
                isClearable={view === "timeline"}
                label="Start"
                name="start_range"
                onChange={({ value }) => setRange((prev) => ({ ...prev, start: value as number }))}
                type="number"
                value={range.start}
              />
            </div>
            <div className="w-32">
              <Input
                isClearable
                label="End"
                name="end_range"
                onChange={({ value }) => setRange((prev) => ({ ...prev, end: value as number }))}
                type="number"
                value={range.end}
              />
            </div>
          </>
        ) : null}

        <div className="w-32">
          <Select
            label="View"
            name="view"
            onChange={({ value }) => {
              setView(value as "calendar" | "range" | "timeline");
              ls.set(`calendar_or_timeline_view_${item_id}`, value);
            }}
            options={[
              { label: "Calendar", value: "calendar", icon: IconEnum.calendar, isDisabled: isCharacterCalendar },
              { label: "Range", value: "range", icon: IconEnum.range },
              { label: "Timeline", value: "timeline", icon: IconEnum.timeline_gantt, isDisabled: isCharacterCalendar },
            ]}
            placeholder="View"
            value={view}
          />
        </div>
        {id || IS_PUBLIC ? null : (
          <div className="w-fit self-end">
            <Button
              icon={IconEnum.add}
              isDisabled={!permissions?.create_events}
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
              className="group sticky top-0 col-span-1 h-min border-b border-r border-zinc-700 bg-black px-2 text-white"
              key={day}
              onKeyDown={() => {}}
              tabIndex={-1}>
              {day}
            </div>
          ))}
          {[...Array(calendar?.days?.length ? Math.abs(startingDayForMonth % calendar.days.length) : 1).keys()]
            .reverse()
            .map((day) => (
              <div
                className="group col-span-1 h-56 border-b border-r border-zinc-700 hover:text-white"
                key={day}
                onKeyDown={() => {}}
                tabIndex={-1}>
                <DayNumber
                  dayNumber={getFillerDayNumber(calendar?.months, date.month, day, previousMonthLeapDayCount)}
                  event_ids={[]}
                  isFiller
                  isReadOnly={IS_PUBLIC}
                  key={day}
                  monthNumber={date.month}
                  year={date.year}
                />
              </div>
            ))}
          {[...Array(monthDays + leapDayCount).keys()].map((day) => {
            const filteredEvents = (events?.data || [])?.filter((event) => {
              return (
                (event.start_day === day + 1 &&
                  event.start_month_id === calendar.months?.[date.month]?.id &&
                  event.start_year === date.year) ||
                (event.end_month_id === calendar.months?.[date.month]?.id &&
                  event.end_day === day + 1 &&
                  event.end_year === date.year)
              );
            });

            return (
              <div
                className="group col-span-1 flex h-56 flex-col border-b border-r border-zinc-700 bg-opacity-85 hover:text-white"
                key={day}
                style={{
                  backgroundColor:
                    matchingEra &&
                    featureFlags?.show_eras_in_calendars &&
                    (matchingEra.start_day <= day || matchingEra.end_day >= day)
                      ? `${matchingEra?.color || DefaultTagColor}aa`
                      : "transparent",
                }}>
                <DayNumber
                  dayNumber={day}
                  event_ids={filteredEvents.map((e) => e.id)}
                  isReadOnly={IS_PUBLIC}
                  key={day}
                  monthNumber={date.month}
                  year={date.year}
                />
                <div className="flex flex-col gap-y-0.5 overflow-auto px-1">
                  {(isLoading ? [] : filteredEvents || []).slice(0, 7).map((event) => {
                    const readPermission = hasActionPermission(
                      isProjectOwner,
                      user?.id === event?.owner_id,
                      permissions,
                      event?.permissions || [],
                      "read_events",
                      user?.role?.id
                    );
                    const updatePermission = hasActionPermission(
                      isProjectOwner,
                      user?.id === event?.owner_id,
                      permissions,
                      event?.permissions || [],
                      "update_events",
                      user?.role?.id
                    );
                    return (
                      <div
                        className={updatePermission ? "cursor-pointer" : "cursor-not-allowed"}
                        key={event.id}
                        onClick={() => {
                          if ((id && readPermission) || IS_PUBLIC) {
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Preview event",
                              type: "entity_preview",
                              data: { id: event.id, parent_id: calendar.id, entity_type: "events" },
                              size: "lg",
                            }));
                          } else if (!IS_PUBLIC && updatePermission) {
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Edit event",
                              type: "events",
                              data: { id: event.id, parent_id: calendar.id, month: date.month, year: date.year },
                              size: "lg",
                            }));
                          }
                        }}
                        onContextMenu={(e: any) => {
                          e.preventDefault();
                          setContextMenu({
                            event: e,
                            items:
                              (id && readPermission) || IS_PUBLIC
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
                                          data: { id: event.id, parent_id: calendar.id, entity_type: "events" },
                                          size: "lg",
                                        })),
                                    },
                                  ]
                                : [
                                    {
                                      id: "1",
                                      title: "Edit event",
                                      icon: IconEnum.edit,
                                      isDisabled: !updatePermission,
                                      onClick: () =>
                                        setDrawer((prev) => ({
                                          ...prev,
                                          title: "Edit event",
                                          type: "events",
                                          data: { id: event.id, parent_id: calendar.id, month: date.month, year: date.year },
                                          size: "lg",
                                        })),
                                    },
                                    {
                                      id: "2",
                                      title: "Delete event",
                                      isDisabled: !hasActionPermission(
                                        isProjectOwner,
                                        user?.id === event?.owner_id,
                                        permissions,
                                        event?.permissions || [],
                                        "delete_events",
                                        user?.role?.id
                                      ),
                                      icon: IconEnum.trash,
                                      onClick: () => {
                                        deleteEvent({ data: { id: event.id, parent_id: event.parent_id } });
                                      },
                                    },
                                  ],
                          });
                        }}
                        onKeyDown={() => {}}
                        tabIndex={-1}>
                        {event.image_id ? (
                          <div className="relative h-24 w-full overflow-hidden rounded-md">
                            <span className="absolute z-10 max-w-full truncate px-1 text-sm">{event.title}</span>
                            <div
                              className="absolute h-full w-full bg-cover bg-center opacity-60"
                              style={{
                                backgroundImage: `url(${getAssetURL(project_id as string, "images", event.image_id)})`,
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
                    );
                  })}
                  {filteredEvents.length > 7 ? (
                    <Tooltip
                      arrowColor="#27272a"
                      content={
                        <div className="max-w-48 rounded-md bg-zinc-800 p-4 shadow shadow-zinc-700">
                          <h4>
                            {`Other events for ${formatDateToString(
                              day + 1,
                              date.year,
                              calendar?.months?.[date.month]?.id,
                              calendar?.months || []
                            )}`}
                          </h4>
                          <ul className="flex flex-col gap-y-0.5">
                            {filteredEvents.slice(7).map((event) => {
                              const readPermission = hasActionPermission(
                                isProjectOwner,
                                user?.id === event?.owner_id,
                                permissions,
                                event?.permissions || [],
                                "read_events",
                                user?.role?.id
                              );
                              const updatePermission = hasActionPermission(
                                isProjectOwner,
                                user?.id === event?.owner_id,
                                permissions,
                                event?.permissions || [],
                                "update_events",
                                user?.role?.id
                              );
                              return (
                                <li
                                  className={updatePermission ? "" : "cursor-not-allowed"}
                                  key={event.id}
                                  onClick={() => {
                                    if ((id && readPermission) || IS_PUBLIC) {
                                      setDrawer((prev) => ({
                                        ...prev,
                                        title: "Preview event",
                                        type: "entity_preview",
                                        data: { id: event.id, parent_id: calendar.id, entity_type: "events" },
                                        size: "lg",
                                      }));
                                    } else if (!IS_PUBLIC && updatePermission) {
                                      setDrawer((prev) => ({
                                        ...prev,
                                        title: "Edit event",
                                        type: "events",
                                        data: { id: event.id, parent_id: calendar.id, month: date.month, year: date.year },
                                        size: "lg",
                                      }));
                                    }
                                  }}
                                  onContextMenu={(evt: any) => {
                                    evt.preventDefault();
                                    setContextMenu({
                                      event: evt,
                                      items:
                                        id || IS_PUBLIC
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
                                                    data: { id: evt.id, parent_id: calendar.id, entity_type: "events" },
                                                    size: "lg",
                                                  })),
                                              },
                                            ]
                                          : [
                                              {
                                                id: "1",
                                                title: "Edit event",
                                                icon: IconEnum.edit,
                                                isDisabled: !hasActionPermission(
                                                  isProjectOwner,
                                                  user?.id === event?.owner_id,
                                                  permissions,
                                                  event?.permissions || [],
                                                  "update_events",
                                                  user?.role?.id
                                                ),
                                                onClick: () =>
                                                  setDrawer((prev) => ({
                                                    ...prev,
                                                    title: "Edit event",
                                                    type: "events",
                                                    isDisabled: !hasActionPermission(
                                                      isProjectOwner,
                                                      user?.id === event?.owner_id,
                                                      permissions,
                                                      event?.permissions || [],
                                                      "delete_events",
                                                      user?.role?.id
                                                    ),
                                                    data: {
                                                      id: evt.id,
                                                      parent_id: calendar.id,
                                                      month: date.month,
                                                      year: date.year,
                                                    },
                                                    size: "lg",
                                                  })),
                                              },
                                              {
                                                id: "2",
                                                title: "Delete event",
                                                icon: IconEnum.trash,
                                                onClick: () => {
                                                  deleteEvent({ data: { id: evt.id, parent_id: evt.parent_id } });
                                                },
                                              },
                                            ],
                                    });
                                  }}>
                                  <Badge
                                    customColor={event.background_color || DefaultTagColor}
                                    label={`${event.title} ${event.start_day === day + 1 && !!event.end_day ? "(start)" : ""} ${
                                      event.end_day === day + 1 ? "(end)" : ""
                                    }`}
                                  />
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      }>
                      <div>
                        <Badge label={`+${filteredEvents.length - 7} events`} variant="secondary" />
                      </div>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            );
          })}
          {[
            ...Array(
              calendar?.days?.length
                ? calendar.days.length - ((startingDayForMonth + Number(monthDays)) % calendar.days.length)
                : 0
            ).keys(),
          ]
            .reverse()
            .map((day, idx) => (
              <div
                className="group col-span-1 h-56 cursor-default border-b border-r border-zinc-700 hover:text-white"
                key={day}
                onKeyDown={() => {}}
                tabIndex={-1}>
                <DayNumber
                  dayNumber={idx}
                  event_ids={[]}
                  isFiller
                  isReadOnly={IS_PUBLIC}
                  key={day}
                  monthNumber={date.month}
                  year={date.year}
                />
              </div>
            ))}
        </div>
      ) : null}

      {view === "range" ? (
        <div className="max-h-full overflow-y-auto">
          <CalendarRangeEvents
            calendar_id={calendar.id}
            deleteEvent={deleteEvent}
            events={events?.data || []}
            isProjectOwner={isProjectOwner}
            months={calendar?.months || []}
            permissions={permissions}
            setDrawer={setDrawer}
            user={user}
          />
        </div>
      ) : null}

      {view === "timeline" ? (
        <TimelineView
          eras={calendar?.eras || []}
          events={events?.data || []}
          id={id}
          isProjectOwner={isProjectOwner}
          months={calendar?.months || []}
          permissions={permissions}
          user={user}
        />
      ) : null}
    </div>
  );
}
