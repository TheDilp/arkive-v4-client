import { Navigate, useParams } from "react-router-dom";

import { Skeleton } from "../../../components";
import { useGetEntity } from "../../../hooks";
import { ManuscriptProfileView } from "../../../pages";
import { ManuscriptType } from "../../../types/EntityTypes/manuscriptTypes";
import { IconEnum, useNotifications } from "../../../utils";
import { PublicEntityLayout } from "./PublicLayout";

export default function PublicManuscript() {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();

  const {
    data: manuscript,
    isInitialLoading,
    error,
  } = useGetEntity<ManuscriptType>(
    item_id,
    "manuscripts",
    {
      relations: {
        entities: true,
      },
      fields: ["id", "title", "is_public", "icon"],
    },
    {
      queryKeyConcat: ["public"],
      retry: false,
    }
  );
  if (!manuscript?.data) return <Skeleton isFullWidth type="editor" />;
  if ((!manuscript?.data?.is_public && !isInitialLoading) || error) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });

    return <Navigate to={`/${project_id}/manuscripts`} />;
  }
  return (
    <PublicEntityLayout title={manuscript?.data?.title || ""}>
      <div className="h-[calc(100%-6rem)] px-5">
        <ManuscriptProfileView data={manuscript?.data} />
      </div>
    </PublicEntityLayout>
  );
}
