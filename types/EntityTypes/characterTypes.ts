import { RemirrorJSON } from "remirror";

import { RequestFilterType } from "../CRUD";
import {
  CharacterLocationType,
  CharacterRelationshipType,
  DocumentType,
  EntityPermissionType,
  EventType,
  FieldDataType,
  MapType,
  TagType,
} from ".";
import { ImageType } from "./imageTypes";

export interface CharacterRelationshipDataType {
  id: string;
  related_to_title?: string;
  related_from_title?: string;
  related_to_ascendant_title?: string;
  related_from_ascendant_title?: string;
}

export interface CharacterRelatedType {
  id: string;
  full_name: string;
  relation_type_id: string;
  relation_type?: CharacterRelationshipType;
  portrait?: { id: string; title: string } | null;
  relation_title?: string;
  relation_type_title?: string;
  character_relationship_id: string;
}

export type FormattedRelationship = {
  id: string;
  portrait: { id: string; title: string } | null;
  full_name: string;
  relationships: {
    relation_title: string | undefined;
    relation_type_title: string | undefined;
  }[];
};

export interface CharacterType {
  id: string;
  deleted_at: string;
  project_id: string;
  is_favorite?: boolean | null;
  is_public?: boolean | null;
  first_name: string;
  last_name?: string | null;
  nickname?: string | null;
  full_name: string;
  biography: RemirrorJSON | null;
  owner_id: string;
  images?: ImageType[];
  portrait_id?: string | null;
  portrait?: ImageType;
  image?: ImageType;
  age?: number | null;
  dayOfBirth?: number | null;
  monthOfBirth?: number | null;
  yearOfBirth?: number | null;
  maps?: MapType | [];
  character_fields?: FieldDataType[];
  character_relationship_types?: CharacterRelationshipDataType[];
  locations?: CharacterLocationType[];
  documents?: Pick<DocumentType, "id" | "title" | "icon">[];
  tags?: Omit<TagType, "owner_id" | "permissions">[];
  events?: EventType[];
  game_data?: any;

  related_to?: CharacterRelatedType[];
  related_from?: CharacterRelatedType[];
  related_other?: CharacterRelatedType[];
  permissions?: EntityPermissionType[];
}

export type CharacterFilterField = {
  id: string;
  field_id: string;
  field_type: string;
  title: string;
  options?: { id: string; value: string }[];
  blueprint_id?: string;
  filter: RequestFilterType;
};

export type CharacterFilter = {
  id: string;
  template: {
    id: string;
    title: string;
  };
  fields: {
    and: CharacterFilterField[];
    or: CharacterFilterField[];
  };
};
