import { FormattedDateType } from "../../types";
import { getDayOrdinal } from "../../utils";

export function FormattedDate({ start_day, start_month, start_year, end_day, end_month, end_year }: FormattedDateType) {
  const startDayOrdinal = typeof start_day === "number" ? getDayOrdinal(start_day) : null;
  const endDayOrdinal = typeof end_day === "number" ? getDayOrdinal(end_day) : null;

  return (
    <div className="flex flex-nowrap">
      {start_day ?? ""}
      {typeof start_day === "number" ? <sup>{startDayOrdinal}</sup> : null}
      {start_month ?? ""}
      {start_year ?? ""}
      {end_day ?? ""}
      {typeof end_day === "number" ? <sup>{endDayOrdinal}</sup> : null}
      {end_month ?? ""}
      {end_year ?? ""}
    </div>
  );
}
