import { CharacterFieldValueType, MapType, TagType } from ".";
import { ImageType } from "./imageTypes";

export interface RelationshipType {
  character_a_id: string;
  character_b_id: string;
  relation_type: string;
  character_b_name: string;
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
  tags?: TagType[];
  related_to?: {
    id: string;
    first_name: string;
    nickname?: string;
    last_name?: string;
    relation_type: string;
    portrait_id?: string;
  }[];
  related_from?: {
    id: string;
    first_name: string;
    nickname?: string;
    last_name?: string;
    relation_type: string;
    portrait_id?: string;
  }[];
}
