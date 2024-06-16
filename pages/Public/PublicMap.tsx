import { Navigate, useParams } from "react-router-dom";

import { Skeleton } from "../../components";
import { useGetEntity } from "../../hooks";
import { MapType } from "../../types";
import { IconEnum, useNotifications } from "../../utils";
import { MapView } from "../Entities";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicMap() {
  const { project_id, item_id, subitem_id, map_pin_id } = useParams();
  const createNotification = useNotifications();

  const {
    data: map,
    error,
    isInitialLoading,
  } = useGetEntity<MapType>(
    subitem_id || item_id,
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
    }
  );
  if (!map?.data) return <Skeleton type="project_view" />;
  if (!map?.data?.is_public || error) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });
    return <Navigate to={`/public/${project_id}/maps`} />;
  }
  console.log(map?.data);

  return (
    <PublicEntityLayout title={subitem_id && map_pin_id ? "" : map?.data?.title}>
      {isInitialLoading ? (
        <Skeleton type="project_view" />
      ) : (
        <MapView center_on={map_pin_id} data={map?.data} isPublic isReadOnly isViewOnly />
      )}
    </PublicEntityLayout>
  );
}
