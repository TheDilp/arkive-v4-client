import { Navigate, useParams } from "react-router-dom";

import { Graph, Skeleton } from "../../components";
import { useGetEntity } from "../../hooks";
import { GraphType } from "../../types";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicGraph() {
  const { project_id, item_id } = useParams();
  const { data: graph, error } = useGetEntity<GraphType>(
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
      isPublic: true,
      retry: false,
    },
  );

  if (error) throw new Error("No public access");

  if (!graph?.data) return <Skeleton type="editor" />;
  if (!graph?.data?.is_public) return <Navigate to={`/public/${project_id}/graphs`} />;
  return (
    <PublicEntityLayout title={graph?.data?.title}>
      <Graph data={graph?.data} isPublic isReadOnly isViewOnly />
    </PublicEntityLayout>
  );
}
