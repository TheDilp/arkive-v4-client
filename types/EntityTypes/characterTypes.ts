import { RemirrorJSON } from "remirror";

import { RequestFilterType } from "../CRUD";
import {
  BlueprintInstanceType,
  CharacterLocationType,
  CharacterRelationshipType,
  DocumentType,
  EntityPermissionType,
  EventType,
  FieldTypes,
  MapPinType,
  MapType,
  RandomTableType,
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

export interface CharacterCharacterFieldType {
  id: string;
  title: string;
  sort: number;
  parent_id: string;
  field_type: FieldTypes;

  characters: {
    character: { id: string; full_name: string; portrait_id: string; project_id: string };
    related_id: string;
  }[];
  blueprint_instances: {
    blueprint_instance: Pick<BlueprintInstanceType, "id" | "title" | "parent_id"> & { icon: string; project_id: string };
    related_id: string;
  }[];
  documents: {
    document: Pick<DocumentType, "id" | "title" | "icon" | "project_id">;
    related_id: string;
  }[];
  map_pins: {
    map_pin: Pick<MapPinType, "id" | "title" | "icon" | "parent_id"> & { project_id: string };
    related_id: string;
  }[];
  images: {
    image: Pick<ImageType, "id" | "title" | "project_id">;
    related_id: string;
  }[];
  events: {
    event: Pick<EventType, "id" | "title" | "parent_id"> & { project_id: string };
    related_id: string;
  }[];

  random_table: {
    option_id?: string;
    suboption_id?: string;
    related_id: string;
  };
  calendar: {
    related_id: string;

    start_day?: number;
    start_year?: number;
    start_month_id?: string;

    end_day?: number;
    end_month_id?: string;
    end_year?: number;
  };
  random_table_data: Pick<RandomTableType, "id" | "title">;
  value: string | number | null | string[] | number[];
}
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
  character_fields?: CharacterCharacterFieldType[];
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
