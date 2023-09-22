import { RandomTableOptionType } from "./randomTableTypes";
import { TagType } from "./tagTypes";

export type FieldTypes =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "select_multiple"
  | "dice_roll"
  | "date"
  | "random_table"
  | "documents_single"
  | "documents_multiple"
  | "images_single"
  | "images_multiple";
export interface CharacterFieldType {
  id: string;
  project_id: string;
  sort: number;
  title: string;
  field_type: FieldTypes;
  formula?: string | null;
  random_table_id?: string | null;
  options?: string[];
  random_table_options?: RandomTableOptionType[];
  random_table?: { id: string; title: string }[];
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
    character_fields: (Omit<CharacterFieldType, "options"> & { options?: { id: string; title: string }[] })[];
  }
>;

export interface CharacterFieldValueType {
  id: string;
  value: { id: string; value: string | number | string[]; subOptionValue?: string };
  template_id: string;
}
