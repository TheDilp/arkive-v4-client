import { BlueprintInstanceType } from "./blueprintInstanceTypes";
import { CharacterFieldType } from "./fieldsTypes";

export interface BlueprintType {
  id: string;
  title: string;
  project_id: string;
  blueprint_instances: BlueprintInstanceType[];
  character_fields: CharacterFieldType[];
}

export type BlueprintStateType = Partial<
  Omit<BlueprintType, "character_fields"> & {
    character_fields: (Omit<CharacterFieldType, "options"> & { options?: { id: string; value: string }[] })[];
  }
>;
