import { EventType } from "../../types";
import {
  CalendarType,
  EventStateType,
  LeapDayConditionType,
  LeapDayType,
  MonthType,
} from "../../types/EntityTypes/calendarTypes";

export function sortEvents(a: EventType, b: EventType) {
  if (a?.hours && b?.hours) {
    if (a.hours > b.hours) return 1;
    if (a.hours < b.hours) return -1;
    if (a.hours === b.hours) {
      if (a?.minutes && b?.minutes) {
        if (a.minutes > b.minutes) return 1;
        if (a.minutes < b.minutes) return -1;
        return 0;
      }
    }
  } else if (a.hours && !b.hours) return -1;
  else if (!a.hours && b.hours) return 1;
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
    return `${day} ${month.title} ${year}`;
  }
  return "";
}

export function getDayOrdinal(day: number): "st" | "nd" | "rd" | "th" {
  const dayString = day.toString();
  if (dayString.endsWith("1")) return "st";
  if (dayString.endsWith("2")) return "nd";
  if (dayString.endsWith("3")) return "rd";
  return "th";
}
