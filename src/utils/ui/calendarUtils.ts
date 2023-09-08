import { EventType } from "../../types";
import { CalendarType, EventStateType, MonthType } from "../../types/EntityTypes/calendarTypes";

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
export function getStartingDayForMonth(
  months: MonthType[] | undefined,
  year: number,
  monthIndex: number,
  weekdays: number | undefined,
) {
  if (year === undefined || !months || !weekdays) return 0;
  if (year === 1 && monthIndex === 0) return 0;
  const dayInYear = months.reduce((accumulator, currentValue) => accumulator + currentValue.days, 0);
  const dayBeforeMonth = months
    .filter((_, index) => index < monthIndex)
    .reduce((accumulator, currentValue) => accumulator + currentValue.days, 0);
  let daysBeforeYear;
  if (year < 0) {
    daysBeforeYear = 0;
  } else {
    daysBeforeYear = (year - 1) * dayInYear;
  }

  return (daysBeforeYear % weekdays) + dayBeforeMonth;
}
export function getFillerDayNumber(calendarMonths: MonthType[], currentMonthIndex: number, day: number) {
  const days = calendarMonths[calendarMonths.length - 1]?.days;
  if (days) {
    if (currentMonthIndex === 0) {
      return days - day - 1;
    }
    return days - day - 1;
  }
  return 0;
}
