import { Navigate, useParams } from "react-router-dom";

import { Skeleton } from "../../components";
import { useGetEntity } from "../../hooks";
import { CalendarType } from "../../types";
import { CalendarView } from "../Entities";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicCalendar({ isCharacterCalendar }: { isCharacterCalendar?: boolean }) {
  const { project_id, item_id, subitem_id, event_id } = useParams();
  const { data: calendar, error } = useGetEntity<CalendarType>(
    item_id,
    "calendars",
    {
      data: {
        project_id,
      },
      fields: ["id", "title", "days", "is_public"],
      relations: {
        months: true,
      },
    },
    {
      queryKeyConcat: ["public"],
      isPublic: true,
      retry: false,
    },
  );

  if (error) throw new Error("No public access");

  if (!calendar?.data) return <Skeleton type="editor" />;
  if (!calendar?.data?.is_public) {
    if (subitem_id) {
      return <Navigate to="./" />;
    }
    return <Navigate to={`/public/${project_id}/calendars`} />;
  }
  return (
    <PublicEntityLayout title={calendar?.data?.title}>
      <CalendarView data={calendar?.data} event_id={event_id} id={item_id} isCharacterCalendar={isCharacterCalendar} isPublic />
    </PublicEntityLayout>
  );
}
