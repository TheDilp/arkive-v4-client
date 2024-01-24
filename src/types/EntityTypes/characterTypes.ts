import {
  BlueprintInstanceType,
  CharacterLocationType,
  CharacterRelationshipType,
  DocumentType,
  EventType,
  FieldTypes,
  MapPinType,
  MapType,
  RandomTableType,
  TagType,
} from ".";
import { ImageType } from "./imageTypes";

export interface RelationType {
  character_relationship_id: string;
  character_a_id: string;
  character_b_id: string;
  relation_type_id: string;
  relation_type: CharacterRelationshipType;
}

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
  portrait_id?: string;
  relation_title?: string;
  relation_type_title?: string;
  character_relationship_id: string;
}

export type FormattedRelationship = {
  id: string;
  portrait_id: string | undefined;
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

  blueprint_instances: {
    blueprint_instance: Pick<BlueprintInstanceType, "id" | "title" | "parent_id"> & { icon: string };
    related_id: string;
  }[];
  documents: {
    document: Pick<DocumentType, "id" | "title" | "icon">;
    related_id: string;
  }[];
  map_pins: {
    map_pin: Pick<MapPinType, "id" | "title" | "icon" | "parent_id">;
    related_id: string;
  }[];
  images: {
    image: Pick<ImageType, "id" | "title">;
    related_id: string;
  }[];
  events: {
    event: Pick<EventType, "id" | "title" | "parent_id">;
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
  project_id: string;
  is_favorite?: boolean | null;
  is_public?: boolean | null;
  first_name: string;
  last_name?: string | null;
  nickname?: string | null;
  full_name: string;
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
  tags?: TagType[];

  related_to?: CharacterRelatedType[];
  related_from?: CharacterRelatedType[];
  related_other?: CharacterRelatedType[];
}
