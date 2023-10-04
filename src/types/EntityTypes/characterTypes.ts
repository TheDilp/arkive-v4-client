import { CharacterFieldValueType, CharacterLocationType, CharacterRelationshipType, DocumentType, MapType, TagType } from ".";
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
  first_name: string;
  nickname?: string;
  last_name?: string;
  relation_type_id: string;
  relation_type?: CharacterRelationshipType;
  portrait_id?: string;
  relation_title?: string;
  relation_type_title?: string;
  character_relationship_id: string;
}

export interface CharacterType {
  id: string;
  project_id: string;
  is_favorite?: boolean | null;
  first_name: string;
  last_name?: string | null;
  nickname?: string | null;
  images?: ImageType[];
  portrait_id?: string | null;
  portrait?: ImageType;
  image?: ImageType;
  age?: number | null;
  dayOfBirth?: number | null;
  monthOfBirth?: number | null;
  yearOfBirth?: number | null;
  maps?: MapType | [];
  character_fields?: CharacterFieldValueType[];
  character_relationship_types?: CharacterRelationshipDataType[];
  locations: CharacterLocationType[];
  documents: Pick<DocumentType, "id" | "title" | "icon">[];
  tags?: TagType[];

  related_to?: CharacterRelatedType[];
  related_from?: CharacterRelatedType[];
  related_other?: CharacterRelatedType[];
}
