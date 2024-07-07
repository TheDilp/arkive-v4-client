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
      retry: false,
    }
  );

  if (!document?.data) return <Skeleton isFullWidth type="editor" />;
  if (!document?.data?.is_public || error) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });

    return <Navigate to={`/${project_id}/documents`} />;
  }
  return (
    <PublicEntityLayout title={subitem_id ? "" : document?.data?.title}>
      <div className="mx-auto max-h-[calc(100%-6.5rem)] overflow-y-auto px-4 lg:max-w-5xl">
        <StaticRender content={document?.data?.content as RemirrorJSON} />
      </div>
    </PublicEntityLayout>
  );
}

