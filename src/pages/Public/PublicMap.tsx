import { Navigate, useParams } from "react-router-dom";

import { Skeleton } from "../../components";
import { useGetEntity } from "../../hooks";
import { MapType } from "../../types";
import { MapView } from "../Entities";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicMap() {
  const { project_id, item_id } = useParams();
  const { data: map, error } = useGetEntity<MapType>(
    item_id,
    "maps",
    {
      data: {
        project_id,
      },
      fields: ["title", "image_id", "is_public"],
      relations: {
        map_pins: true,
        map_layers: true,
      },
    },
    {
      queryKeyConcat: ["public"],
      isPublic: true,
      retry: false,
    },
  );

  if (error) throw new Error("No public access");

  if (!map?.data) return <Skeleton type="editor" />;
  if (!map?.data?.is_public) return <Navigate to={`/public/${project_id}/maps`} />;
  return (
    <PublicEntityLayout title={map?.data?.title}>
      <MapView data={map?.data} />
    </PublicEntityLayout>
  );
}
