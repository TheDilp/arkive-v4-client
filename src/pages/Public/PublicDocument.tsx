import { Navigate, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { Skeleton, StaticRender } from "../../components";
import { useGetEntity } from "../../hooks";
import { DocumentType } from "../../types";

export function PublicDocument() {
  const { project_id, item_id } = useParams();
  const { data: document, error } = useGetEntity<DocumentType>(
    item_id,
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

  if (error) throw new Error("No public access");

  if (!document?.data) return <Skeleton type="editor" />;
  if (!document?.data?.is_public) return <Navigate to={`/public/${project_id}/documents`} />;
  return <StaticRender content={document?.data?.content as RemirrorJSON} isPublicView />;
}
