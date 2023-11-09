import { useNavigate } from "react-router-dom";

import { useGetEntity } from "../../../hooks";
import { MapView } from "../../../pages/Entities";
import { AvailableEntityType, AvailableSubEntityType, DocumentType, MapType } from "../../../types";
import { IconEnum } from "../../../utils";
import { Editor } from "../../Complex";
import { Button, Title } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

export function MapPreviewDrawer({ id, subitem_id }: { id?: string; subitem_id?: string }) {
  const { data: existingMap, isLoading } = useGetEntity<MapType>(
    id,
    "maps",
    {
      data: {},
      relations: { map_pins: true, map_layers: true },
    },
    {
      enabled: !!id,
    },
  );

  if (isLoading) return null;
  return (
    <div className="h-full w-full overflow-hidden">
      <MapView center_on={subitem_id} data={existingMap?.data} isViewOnly />
    </div>
  );
}

export function DocumentPreviewDrawer({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: existingDocument, isLoading } = useGetEntity<DocumentType>(
    id,
    "documents",
    {
      data: { id },
      fields: ["title", "content", "project_id"],
    },
    {
      enabled: !!id,
    },
  );

  if (isLoading) return <Skeleton type="editor" />;
  if (!id) return <Alert label="Entity could not be found." variant="error" />;
  return (
    <div className="h-full w-full overflow-hidden">
      {existingDocument?.data?.content ? (
        <div className="flex flex-col gap-y-2">
          <Title label={existingDocument?.data?.title} size="xl" />
          <Editor initialContent={existingDocument?.data?.content} isReadOnly name="editor" onChange={() => {}} />
          <Button
            icon={IconEnum.edit}
            label="Edit document (open editor)"
            onClick={() => navigate(`/projects/${existingDocument?.data?.project_id}/documents/${id}`)}
            variant="info"
          />
        </div>
      ) : (
        <Alert label="This document has no content." />
      )}
    </div>
  );
}

export function EntityPreviewDrawer({
  data,
}: {
  data: { id: string; parent_id?: string; entity_type: AvailableEntityType | AvailableSubEntityType };
}) {
  return (
    <DrawerLayout>
      {data.entity_type === "documents" ? <DocumentPreviewDrawer id={data.id} /> : null}
      {data.entity_type === "maps" ? <MapPreviewDrawer id={data.id} /> : null}
      {data.entity_type === "map_pins" ? <MapPreviewDrawer id={data.parent_id} subitem_id={data?.id} /> : null}
      {data.entity_type === "graphs" ? <MapPreviewDrawer id={data.id} /> : null}
    </DrawerLayout>
  );
}
