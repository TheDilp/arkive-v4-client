import { ImageType } from "./imageTypes";

export interface CharacterFieldValues {
  fieldId: string;
  characterId: string;
  value: string;
}

export interface CharacterType {
  id: string;
  project_id: string;
  first_name: string;
  last_name?: string;
  nickname?: string;
  imageId?: string;
  image?: ImageType;
  age?: number;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
}
