import { useNavigate, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../hooks";
import { CalendarView, CharacterProfileView, DictionaryView, MapView } from "../../../pages/Entities";
import BlueprintProfileView from "../../../pages/Entities/BlueprintProfileView";
import { AvailableEntityType, AvailableSubEntityType, DocumentType, GraphType, MapType } from "../../../types";
import { getEntityLink, getSingularEntityType, IconEnum } from "../../../utils";
import { StaticRender } from "../../Complex";
import { Graph } from "../../DataDisplay";
import { Button, Title } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";
import { EventDrawer } from "./EventDrawer";

export function CharacterPreviewDrawer({ id }: { id: string }) {
  return <CharacterProfileView id={id} isPreview />;
}
export function BlueprintPreviewDrawer({ id, parent_id }: { id: string; parent_id?: string }) {
  return <BlueprintProfileView id={id} parent_id={parent_id} />;
}
export function DocumentPreviewDrawer({ id }: { id: string }) {
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
        <div className="flex h-full flex-col gap-y-2">
          <Title label={existingDocument?.data?.title} size="xl" />
          <div className="h-[calc(92%)] max-h-full overflow-auto">
            <StaticRender content={existingDocument?.data?.content as RemirrorJSON} />
          </div>
        </div>
      ) : (
        <Alert label="This document has no content." />
      )}
    </div>
  );
}
export function MapPreviewDrawer({ id, subitem_id }: { id?: string; subitem_id?: string }) {
  const { data: existingMap, isLoading } = useGetEntity<MapType>(
    id,
    "maps",
    {
      data: {},
      fields: ["id", "title", "image_id", "is_public"],
      relations: { map_pins: true, map_layers: true },
    },
    {
      enabled: !!id,
    },
  );

  if (isLoading) return <Skeleton limit={1} type="project_view" />;
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <MapView center_on={subitem_id} data={existingMap?.data} isReadOnly isViewOnly />
    </div>
  );
}
export function GraphPreviewDrawer({ id }: { id?: string }) {
  const { data: graph, isLoading } = useGetEntity<GraphType>(
    id,
    "graphs",
    {
      data: {},
      fields: ["id", "title", "is_public"],
      relations: { nodes: true, edges: true },
    },
    {
      enabled: !!id,
    },
  );

  if (isLoading) return <Skeleton limit={1} type="project_view" />;
  if (graph?.data)
    return (
      <div className="h-full w-full overflow-hidden">
        <Graph data={graph?.data} isReadOnly isViewOnly />
      </div>
    );
  if (!graph?.data) return <Alert label="Could not get graph." variant="error" />;
}
export function DictionaryPreviewDrawer({ id }: { id?: string }) {
  return <DictionaryView id={id} />;
}
export function CalendarPreviewDrawer({ id }: { id?: string }) {
  return <CalendarView id={id} />;
}
export function EventPreviewDrawer({ id }: { id?: string }) {
  return <EventDrawer data={{ id, isReadOnly: true }} />;
}

export function EntityPreviewDrawer({
  data,
}: {
  data: { id: string; parent_id?: string; entity_type: AvailableEntityType | AvailableSubEntityType };
}) {
  const { project_id } = useParams();
  const navigate = useNavigate();
  return (
    <DrawerLayout>
      <div className="flex-1 overflow-y-auto">
        {data.entity_type === "characters" ? <CharacterPreviewDrawer id={data.id} /> : null}
        {data.entity_type === "blueprint_instances" ? <BlueprintPreviewDrawer id={data.id} parent_id={data.parent_id} /> : null}
        {data.entity_type === "documents" ? <DocumentPreviewDrawer id={data.id} /> : null}
        {data.entity_type === "maps" ? <MapPreviewDrawer id={data.id} /> : null}
        {data.entity_type === "map_pins" ? <MapPreviewDrawer id={data.parent_id} subitem_id={data?.id} /> : null}
        {data.entity_type === "graphs" ? <GraphPreviewDrawer id={data.id} /> : null}
        {data.entity_type === "dictionaries" ? <DictionaryPreviewDrawer id={data.id} /> : null}
        {data.entity_type === "calendars" ? <CalendarPreviewDrawer id={data.id} /> : null}
        {data.entity_type === "events" ? <EventPreviewDrawer id={data.id} /> : null}
      </div>
      <div className="">
        <Button
          icon={IconEnum.edit}
          label={`Edit ${getSingularEntityType(data.entity_type).toLowerCase()}`}
          onClick={() => navigate(getEntityLink(project_id as string, data.entity_type, data.id, data.parent_id))}
          variant="info"
        />
      </div>
    </DrawerLayout>
  );
}
