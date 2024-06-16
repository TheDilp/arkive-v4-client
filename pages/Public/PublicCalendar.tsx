import { Navigate, useParams } from "react-router-dom";

import { Skeleton } from "../../components";
import { useGetEntity } from "../../hooks";
import { CalendarType } from "../../types";
import { IconEnum, useNotifications } from "../../utils";
import { CalendarView } from "../Entities";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicCalendar({ isCharacterCalendar }: { isCharacterCalendar?: boolean }) {
  const { project_id, item_id, event_id } = useParams();
  const createNotiifcation = useNotifications();
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
    }
  );

  if (error) throw new Error("No public access");

  if (!calendar?.data) return <Skeleton type="editor" />;
  if (!calendar?.data?.is_public) {
    createNotiifcation({ title: "This entity is not public.", timer: 3, variant: "error", icon: IconEnum.error });
    return <Navigate to={`/public/${project_id}/calendars`} />;
  }
  return (
    <PublicEntityLayout title={calendar?.data?.title}>
      <CalendarView data={calendar?.data} event_id={event_id} id={item_id} isCharacterCalendar={isCharacterCalendar} isPublic />
    </PublicEntityLayout>
  );
}
