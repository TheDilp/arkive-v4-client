import { CharacterFieldTemplateType, CharacterFieldType } from "./fieldsTypes";

export interface BlueprintType {
  id: string;
  title: string;
}

export type BlueprintStateType = Partial<
  Omit<CharacterFieldTemplateType, "character_fields"> & {
    character_fields: (Omit<CharacterFieldType, "options"> & { options?: { id: string; value: string }[] })[];
  }
>;
