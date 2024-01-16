import { Navigate, useParams } from "react-router-dom";

import { Skeleton } from "../../components";
import { useGetEntity } from "../../hooks";
import { CalendarType } from "../../types";
import { CalendarView } from "../Entities";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicCalendar() {
  const { project_id, item_id } = useParams();
  const { data: graph, error } = useGetEntity<CalendarType>(
    item_id,
    "calendars",
    {
      data: {
        project_id,
      },
      fields: ["title", "days", "is_public"],
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

  if (!graph?.data) return <Skeleton type="editor" />;
  if (!graph?.data?.is_public) return <Navigate to={`/public/${project_id}/calendars`} />;
  return (
    <PublicEntityLayout title={graph?.data?.title}>
      <CalendarView data={graph?.data} isPublic />
    </PublicEntityLayout>
  );
}
