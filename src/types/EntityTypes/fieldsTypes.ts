import { BlueprintType } from "./blueprintTypes";
import { RandomTableOptionType } from "./randomTableTypes";
import { TagType } from "./tagTypes";

export type FieldTypes =
  | "text"
  | "select"
  | "select_multiple"
  | "dice_roll"
  | "boolean"
  | "date"
  | "random_table"
  | "documents_single"
  | "documents_multiple"
  | "images_single"
  | "images_multiple"
  | "locations_single"
  | "locations_multiple"
  | "number"
  | "textarea"
  | "blueprints_single"
  | "blueprints_multiple"
  | "events_single"
  | "events_multiple";
export type BlueprintFieldTypes =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "select_multiple"
  | "dice_roll"
  | "date"
  | "boolean"
  | "random_table"
  | "documents_single"
  | "documents_multiple"
  | "images_single"
  | "images_multiple"
  | "characters_single"
  | "characters_multiple"
  | "locations_single"
  | "locations_multiple"
  | "blueprints_single"
  | "blueprints_multiple"
  | "events_single"
  | "events_multiple";

export interface CharacterFieldType {
  id: string;
  sort: number;
  title: string;
  field_type: FieldTypes;
  formula?: string | null;
  random_table_id?: string | null;
  calendar_id?: string | null;
  blueprint_id?: string | null;
  blueprint?: Pick<BlueprintType, "id" | "title" | "icon">;
  options?: { id: string; value: string }[];
  random_table_options?: RandomTableOptionType[];
  random_table?: { id: string; title: string; random_table_options: RandomTableOptionType[] };
  calendar?: { id: string; title: string; days: string[]; months: { id: string; title: string; days: number }[] };
}
export interface CharacterFieldTemplateType {
  id: string;
  title: string;
  project_id: string;
  character_fields: CharacterFieldType[];
  sort: number;
  tags: TagType[];
}

export type TemplateStateType = Partial<
  Omit<CharacterFieldTemplateType, "character_fields"> & {
    character_fields: (Omit<CharacterFieldType, "options"> & { options?: { id: string; value: string }[] })[];
  }
>;
