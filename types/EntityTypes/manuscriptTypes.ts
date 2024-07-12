import { EntityPermissionType } from "./baseEntityTypes";
import { TagType } from "./tagTypes";

export type ManuscriptType = {
  id: string;
  deleted_at: string;
  owner_id: string;
  title: string;
  is_public: boolean | null;
  project_id: string;
  tags: TagType[];
  entities: FlatManuscriptEntityType[];
  permissions: EntityPermissionType[];
};

export type ManuscriptEntityType = {
  id: string;
  title: string;
  document_id: string | null;
  character_id: string | null;
  blueprint_instance_id: string | null;
  map_id: string | null;
  map_pin_id: string | null;
  graph_id: string | null;
  event_id: string | null;
  image_id: string | null;
  type: AvailableManuscriptEntityTypes;
  sort: number;
  children: ManuscriptEntityType[];
};

export type FlatManuscriptEntityType = {
  id: string;
  parent_id: string | null;
  manuscript_id: string;
  title: string;
  sort: number;
  document_id: string | null;
  character_id: string | null;
  blueprint_instance_id: string | null;
  map_id: string | null;
  map_pin_id: string | null;
  graph_id: string | null;
  event_id: string | null;
};

export type AvailableManuscriptEntityTypes =
  | "characters"
  | "blueprint_instances"
  | "documents"
  | "maps"
  | "map_pins"
  | "graphs"
  | "events"
  | "images";
