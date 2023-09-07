import { useSetAtom } from "jotai";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { Button, Input, Select } from "../../components";
import { useChangeNavbarTitle, useGetEntity } from "../../hooks";
import { CalendarType, CurrentDateType } from "../../types/EntityTypes/calendarTypes";
import { drawerAtom, getFillerDayNumber, getStartingDayForMonth, IconEnum } from "../../utils";

export default function DayNumber({
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
                }));
            }}
          />
        </span>
      ) : null}
    </span>
  );
}

export function CalendarView() {
  const { project_id, item_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const { data: existingCalendar } = useGetEntity<CalendarType>(item_id, "calendars", {
    data: { project_id },
    relations: { months: true },
  });
  useChangeNavbarTitle(`The Arkive | Calendars | ${existingCalendar?.data?.title}`, !!existingCalendar?.data);

  const [date, setDate] = useState<CurrentDateType>({ month: 0, year: 1 });
  const monthDays = existingCalendar?.data?.months?.[date.month]?.days;
  if (!existingCalendar?.data) return null;
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 mb-2 flex w-full items-center justify-end gap-x-2">
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
            value={date.year}
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
              }));
            }}
          />
        </div>
      </div>
      <div
        className="grid overflow-auto border border-zinc-700"
        style={{
          gridTemplateColumns: `repeat(${existingCalendar?.data?.days?.length || 0}, minmax(9rem, 1fr))`,
        }}>
        {existingCalendar?.data?.days?.map((day) => (
          <div
            key={day}
            className="group col-span-1 h-min border-b border-r border-zinc-700 px-2 text-white"
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
          <div
            key={day}
            className="group col-span-1 flex h-56 flex-col border-b border-r border-zinc-700 hover:text-white"
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}>
            <DayNumber key={day} dayNumber={day} monthNumber={date.month} year={date.year} />
          </div>
        ))}
      </div>
    </div>
  );
}
