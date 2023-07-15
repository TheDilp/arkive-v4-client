/* eslint-disable no-use-before-define */
import { ImageType } from "./imageTypes";

export interface RelationshipType {
  character_a_id: string;
  character_b_id: string;
  relation_type: string;
  character_b_name: string;
}
export interface CharacterFieldValues {
  fieldId: string;
  characterId: string;
  value: string;
}

export interface CharacterType {
  id: string;
  project_id: string;
  is_favorite?: boolean;
  first_name: string;
  last_name?: string;
  nickname?: string;
  images?: ImageType[];
  portrait_id?: string;
  portrait?: ImageType;
  image?: ImageType;
  age?: number;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  character_fields?: { id: string; value: string | string[]; template_id: string }[];
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
