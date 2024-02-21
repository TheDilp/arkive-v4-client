import { EventType, RequestFilterType } from "../../types";
import {
  CalendarFilters,
  CalendarType,
  EventStateType,
  LeapDayConditionType,
  LeapDayType,
  MonthType,
} from "../../types/EntityTypes/calendarTypes";
import { groupFiltersByHeader } from "./tableUtils";

export function sortEvents(a: EventType, b: EventType) {
  if (a?.start_hours && b?.start_hours) {
    if (a.start_hours > b.start_hours) return 1;
    if (a.start_hours < b.start_hours) return -1;
    if (a.start_hours === b.start_hours) {
      if (a?.start_minutes && b?.start_minutes) {
        if (a.start_minutes > b.start_minutes) return 1;
        if (a.start_minutes < b.start_minutes) return -1;
        return 0;
      }
    }
  } else if (a.start_hours && !b.start_hours) return -1;
  else if (!a.start_hours && b.start_hours) return 1;
  else {
    return 0;
  }
  return 0;
}

export function checkIfDayCorrect(e: EventStateType, isYearCorrect: boolean, isMonthCorrect: boolean): boolean {
  if (isYearCorrect && isMonthCorrect) {
    if (e?.end_month === e?.start_month) {
      if (typeof e?.start_day === "number" && Number.isInteger(e.start_day)) {
        if (typeof e?.end_day === "number" && Number.isInteger(e.end_day)) {
          if (e.end_day < e.start_day) return false;
        }
      }
    }
  }
  return true;
}

export function checkIfMonthCorrect(e: EventStateType, isYearCorrect: boolean): boolean {
  if (isYearCorrect) {
    if (e?.start_year === e?.end_year) {
      if (typeof e?.start_month === "number" && Number.isInteger(e?.start_month)) {
        if (typeof e?.end_month === "number" && Number.isInteger(e?.end_month)) {
          if (e.end_month < e.start_month) return false;
        }
      }
    }
  }
  return true;
}

export function checkIfYearCorrect(start_year: number | undefined, end_year: number | undefined | null): boolean {
  if (typeof start_year === "number" && Number.isInteger(start_year)) {
    if (typeof end_year === "number" && Number.isInteger(end_year)) {
      if (end_year < start_year) return false;
    } else if (!end_year && end_year !== 0) {
      return true;
    } else {
      return false;
    }
    return true;
  }
  if (!start_year && !!end_year) {
    return false;
  }
  return true;
}

export function getNextDate(date: { month: number; year: number }, calendar: CalendarType, type: "next" | "previous") {
  const { month, year } = date;
  const numberOfMonths = calendar?.months?.length;
  // const monthDays = calendar?.months?.[month]?.days;
  if (numberOfMonths) {
    if (type === "next") {
      if (month === numberOfMonths - 1) {
        return { month: 0, year: year + 1 };
      }
      return { month: month + 1, year };
    }
    if (type === "previous") {
      if (month === 0) {
        return {
          month: numberOfMonths - 1,
          year: year - 1 === 0 ? -1 : year - 1,
        };
      }
      return { month: month - 1, year };
    }
    return date;
  }
  return date;
}

export function checkLeapDayCondition(
  cond: { type: LeapDayConditionType; value: number | string },
  date: { year: number; month: number },
) {
  if (cond.type === "every") return date.year % Number(cond.value) === 0;
  if (cond.type === "divisible_by") return date.year % Number(cond.value) === 0;
  if (cond.type === "not_divisible_by") return date.year % Number(cond.value) !== 0;
  return false;
}

export function getLeapDays(leap_days: LeapDayType[], months: MonthType[], date: { month: number; year: number }): number {
  let leapDayCount = 0;
  for (let index = 0; index < leap_days.length; index += 1) {
    const day = leap_days[index];
    const monthIdx = months.findIndex((m) => m.id === day.month_id);
    if (monthIdx === -1 || monthIdx === undefined || monthIdx !== date.month) break;

    const andConditionsMatch =
      !day.conditions.and?.length || (day.conditions.and || [])?.every((cond) => checkLeapDayCondition(cond, date));
    const orConditionsMatch =
      !day.conditions.or?.length || (day.conditions.or || [])?.some((cond) => checkLeapDayCondition(cond, date));
    if (andConditionsMatch && orConditionsMatch) leapDayCount += 1;
  }

  return leapDayCount;
}

export function getStartingDayForMonth(
  months: MonthType[] | undefined,
  year: number,
  monthIndex: number,
  weekdays: number | undefined,
  starts_on_day: number | null | undefined,
  previousMonthLeapDays: number,
) {
  // ! There is no need to use leap days in the starting day calculation as
  // ! they are already used when calculating filler days
  if (year === undefined || !months || !weekdays) return 0;
  if (year === 1 && monthIndex === 0 && typeof starts_on_day === "number") return starts_on_day;
  let daysTotal = 0;

  for (let index = 0; index < year - 1; index += 1) {
    const dayInYear = months.reduce((accumulator, currentValue) => accumulator + currentValue.days, 0);
    daysTotal += dayInYear;
  }

  const dayBeforeMonth = months
    .filter((_, index) => index < monthIndex)
    .reduce((accumulator, currentValue) => accumulator + currentValue.days, 0);
  // let daysBeforeYear;
  if (year < 0) {
    // daysBeforeYear = 0;
  } else {
    // daysBeforeYear = year * daysTotal;
  }

  return (daysTotal % weekdays) + dayBeforeMonth + previousMonthLeapDays;
}
export function getFillerDayNumber(
  calendarMonths: MonthType[],
  currentMonthIndex: number,
  day: number,
  previousMonthLeapDays: number,
) {
  let previousMonthIndex = currentMonthIndex - 1;

  if (previousMonthIndex < 0) {
    previousMonthIndex = calendarMonths.length - 1;
  }
  const days = (calendarMonths[previousMonthIndex]?.days || 0) + previousMonthLeapDays;
  if (days) {
    return days - day - 1;
  }
  return 0;
}
export function getDayOrdinal(day: number): "st" | "nd" | "rd" | "th" {
  const dayString = day.toString();
  if (dayString.endsWith("1")) return "st";
  if (dayString.endsWith("2")) return "nd";
  if (dayString.endsWith("3")) return "rd";
  return "th";
}
export function formatDateToString(
  day: number | undefined,
  year: number | undefined,
  monthId: string | undefined,
  months: { id: string; title: string }[] | undefined,
): string {
  if (day === undefined) return "";
  if (year === undefined) return "";
  if (monthId === undefined) return "";
  const month = (months || []).find((m) => m.id === monthId);
  if (month) {
    return `${day}${getDayOrdinal(day)} ${month.title} ${year}`;
  }
  return "";
}

export function getCalendarFilters(
  type: "calendar" | "range" | "timeline",
  calendar_id: string,
  start_range: number | undefined,
  end_range: number | undefined,
  month_id: string,
  filters: CalendarFilters,
): { and: RequestFilterType[]; or: RequestFilterType[] } {
  const finalFilters: { and: RequestFilterType[]; or: RequestFilterType[] } = { and: [], or: [] };
  finalFilters.and.push({
    id: "parent",
    header_name: "Parent",
    field: "parent_id",
    value: calendar_id,
    operator: "eq" as const,
  });

  if (filters.filters.and.length || filters.filters.or.length) {
    for (let index = 0; index < filters.filters.and.length; index += 1) {
      finalFilters.and.push(filters.filters.and[index]);
    }
    for (let index = 0; index < filters.filters.or.length; index += 1) {
      finalFilters.or.push(filters.filters.or[index]);
    }
    return finalFilters;
  }

  if ((type === "range" || type === "timeline") && typeof start_range === "number") {
    finalFilters.and.push({
      id: "start_range",
      header_name: "Start range",
      field: "start_year",
      value: start_range,
      operator: "gte" as const,
    });
    if (typeof end_range === "number") {
      finalFilters.and.push({
        id: "end_range",
        header_name: "End range",
        field: "start_year",
        value: end_range,
        operator: "lte" as const,
      });
    }
  }

  if (type === "calendar") {
    finalFilters.or.push(
      {
        id: "start_month_id",
        header_name: "Start month",
        field: "start_month_id",
        value: month_id,
        operator: "eq",
      },
      {
        id: "end_month_id",
        header_name: "End month",
        field: "end_month_id",
        value: month_id,
        operator: "eq",
      },
    );
  }

  return finalFilters;
}

export function getCalendarFilterBadges(filters: CalendarFilters) {
  const andFiltersByField = groupFiltersByHeader(filters?.filters?.and || []);
  const orFiltersByField = groupFiltersByHeader(filters?.filters?.or || []);
  const andRelationFiltersByField = groupFiltersByHeader(filters?.relationFilters?.and || []);
  const orRelationFiltersByField = groupFiltersByHeader(filters?.relationFilters?.or || []);
  const fields = [...new Set(Object.keys(andFiltersByField).concat(Object.keys(orFiltersByField)))];
  const relationFields = [...new Set(Object.keys(andRelationFiltersByField).concat(Object.keys(orRelationFiltersByField)))];
  return { andFiltersByField, orFiltersByField, andRelationFiltersByField, orRelationFiltersByField, fields, relationFields };
}

export const timelineZoomOptions = [
  {
    label: "2",
    value: "2",
  },
  {
    label: "4",
    value: "4",
  },
  {
    label: "6",
    value: "6",
  },
  {
    label: "8",
    value: "8",
  },
  {
    label: "10",
    value: "10",
  },
  {
    label: "12",
    value: "12",
  },
  {
    label: "14",
    value: "14",
  },
  {
    label: "16",
    value: "16",
  },
  {
    label: "18",
    value: "18",
  },
  {
    label: "20",
    value: "20",
  },
  {
    label: "22",
    value: "22",
  },
  {
    label: "24",
    value: "24",
  },
  {
    label: "26",
    value: "26",
  },
  {
    label: "28",
    value: "28",
  },
  {
    label: "30",
    value: "30",
  },
  {
    label: "32",
    value: "32",
  },
  {
    label: "34",
    value: "34",
  },
  {
    label: "36",
    value: "36",
  },
  {
    label: "38",
    value: "38",
  },
  {
    label: "40",
    value: "40",
  },
  {
    label: "42",
    value: "42",
  },
  {
    label: "44",
    value: "44",
  },
  {
    label: "46",
    value: "46",
  },
  {
    label: "48",
    value: "48",
  },
  {
    label: "50",
    value: "50",
  },
  {
    label: "52",
    value: "52",
  },
  {
    label: "54",
    value: "54",
  },
  {
    label: "56",
    value: "56",
  },
  {
    label: "58",
    value: "58",
  },
  {
    label: "60",
    value: "60",
  },
  {
    label: "62",
    value: "62",
  },
  {
    label: "64",
    value: "64",
  },
  {
    label: "66",
    value: "66",
  },
  {
    label: "68",
    value: "68",
  },
  {
    label: "70",
    value: "70",
  },
  {
    label: "72",
    value: "72",
  },
  {
    label: "74",
    value: "74",
  },
  {
    label: "76",
    value: "76",
  },
  {
    label: "78",
    value: "78",
  },
  {
    label: "80",
    value: "80",
  },
  {
    label: "82",
    value: "82",
  },
  {
    label: "84",
    value: "84",
  },
  {
    label: "86",
    value: "86",
  },
  {
    label: "88",
    value: "88",
  },
  {
    label: "90",
    value: "90",
  },
  {
    label: "92",
    value: "92",
  },
  {
    label: "94",
    value: "94",
  },
  {
    label: "96",
    value: "96",
  },
  {
    label: "98",
    value: "98",
  },
  {
    label: "100",
    value: "100",
  },
];
