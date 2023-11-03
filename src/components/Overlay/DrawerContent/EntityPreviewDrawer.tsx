import { useGetEntity } from "../../../hooks";
import { MapView } from "../../../pages/Entities";
import { AvailableEntityType, DocumentType, MapType } from "../../../types";
import { Editor } from "../../Complex";
import { DrawerLayout } from "../../Layout";
import { Alert } from "../../Misc";

export function MapPreviewDrawer({ id, subitem_id }: { id: string; subitem_id?: string }) {
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
  const { data: existingDocument, isLoading } = useGetEntity<DocumentType>(
    id,
    "documents",
    {
      data: { id },
    },
    {
      enabled: !!id,
    },
  );

  if (isLoading) return null;
  return (
    <div className="h-full w-full overflow-hidden">
      {existingDocument?.data?.content ? (
        <Editor initialContent={existingDocument?.data?.content} isReadOnly name="editor" onChange={() => {}} />
      ) : (
        <Alert label="This document has no content." />
      )}
    </div>
  );
}

export function EntityPreviewDrawer({ data }: { data: { id: string; subitem_id?: string; entity_type: AvailableEntityType } }) {
  return (
    <DrawerLayout>
      {data.entity_type === "documents" ? <DocumentPreviewDrawer id={data.id} /> : null}
      {data.entity_type === "maps" ? <MapPreviewDrawer id={data.id} subitem_id={data?.subitem_id} /> : null}
      {data.entity_type === "graphs" ? <MapPreviewDrawer id={data.id} /> : null}
    </DrawerLayout>
  );
}
