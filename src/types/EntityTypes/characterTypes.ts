import { ImageType } from "./imageTypes";

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
}
