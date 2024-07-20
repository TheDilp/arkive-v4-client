import { Navigate, useParams } from "react-router-dom";

import { Graph, Skeleton } from "../../../components";
import { useGetEntity } from "../../../hooks";
import { GraphType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicGraph() {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const {
    data: graph,
    error,
    isInitialLoading,
  } = useGetEntity<GraphType>(
    item_id,
    "graphs",
    {
      data: {
        project_id,
      },
      fields: ["title", "is_public"],
      relations: {
        nodes: true,
        edges: true,
      },
    },
    {
      queryKeyConcat: ["public"],
      retry: false,
    }
  );

  if (!graph?.data) return <Skeleton type="editor" />;
  if ((!graph?.data?.is_public || error) && !isInitialLoading) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });
    return <Navigate to={`/${project_id}/graphs`} />;
  }
  return (
    <PublicEntityLayout title={graph?.data?.title}>
      <Graph data={graph?.data} isReadOnly isViewOnly />
    </PublicEntityLayout>
  );
}
