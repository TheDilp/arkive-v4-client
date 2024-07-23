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
  characters: ManuscriptEntityType[];
  blueprint_instances: ManuscriptEntityType[];
  documents: ManuscriptEntityType[];
  maps: ManuscriptEntityType[];
  map_pins: ManuscriptEntityType[];
  graphs: ManuscriptEntityType[];
  events: ManuscriptEntityType[];
  images: ManuscriptEntityType[];
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
