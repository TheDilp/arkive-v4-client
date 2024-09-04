import { FormattedDateType } from "../../types";
import { getDayOrdinal } from "../../utils";

export function FormattedDate({ start_day, start_month, start_year, end_day, end_month, end_year }: FormattedDateType) {
  const startDayOrdinal = typeof start_day === "number" ? getDayOrdinal(start_day) : null;
  const endDayOrdinal = typeof end_day === "number" ? getDayOrdinal(end_day) : null;

  return (
    <div className="flex flex-nowrap gap-x-1">
      {start_day ? (
        <span>
          {start_day ?? ""}
          {typeof start_day === "number" ? <sup className="pt-2">{startDayOrdinal}</sup> : null}
        </span>
      ) : null}
      <span>{start_month ?? ""}</span>
      <span>{start_year ?? ""}</span>
      {end_month && end_year ? (
        <>
          <span> -</span>
          {end_day ? (
            <span>
              {end_day ?? ""}
              {typeof end_day === "number" ? <sup className="pt-2">{endDayOrdinal}</sup> : null}
            </span>
          ) : null}
          <span>{end_month ?? ""}</span>
          <span>{end_year ?? ""}</span>
        </>
      ) : null}
    </div>
  );
}
