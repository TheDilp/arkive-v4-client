import { Navigate, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { Skeleton, StaticRender } from "../../components";
import { useGetEntity } from "../../hooks";
import { DocumentType } from "../../types";
import { IconEnum, useNotifications } from "../../utils";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicDocument() {
  const { project_id, item_id, subitem_id } = useParams();
  const createNotification = useNotifications();
  const { data: document, error } = useGetEntity<DocumentType>(
    subitem_id || item_id,
    "documents",
    {
      data: {
        project_id,
      },
      fields: ["title", "content", "is_public"],
    },
    {
      queryKeyConcat: ["public"],
      isPublic: true,
      retry: false,
    },
  );

  if (!document?.data) return <Skeleton type="editor" />;
  if (!document?.data?.is_public || error) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });

    return <Navigate to={`/public/${project_id}/documents`} />;
  }
  return (
    <PublicEntityLayout title={subitem_id ? "" : document?.data?.title}>
      <div className="max-h-[calc(100%-6.5rem)] overflow-y-auto">
        <StaticRender content={document?.data?.content as RemirrorJSON} isPublicView />
      </div>
    </PublicEntityLayout>
  );
}
