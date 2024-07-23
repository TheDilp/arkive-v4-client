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
  characters: FlatManuscriptEntityType[];
  blueprint_instances: FlatManuscriptEntityType[];
  documents: FlatManuscriptEntityType[];
  maps: FlatManuscriptEntityType[];
  map_pins: FlatManuscriptEntityType[];
  graphs: FlatManuscriptEntityType[];
  events: FlatManuscriptEntityType[];
  images: FlatManuscriptEntityType[];
  permissions: EntityPermissionType[];
};

export type ManuscriptEntityType = {
  id: string;
  title: string;
  related_id: string;
  type: AvailableManuscriptEntityTypes;
  sort: number;
};

export type FlatManuscriptEntityType = {
  id: string;
  related_id: string;
  sort: number;
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
