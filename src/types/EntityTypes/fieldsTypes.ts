export type FieldTypes = "text" | "textarea" | "number" | "select" | "select_multiple" | "dice_roll" | "random_table";
export interface CharacterFieldType {
  id: string;
  project_id: string;
  sort: number;
  title: string;
  field_type: FieldTypes;
  formula?: string | null;
  random_table_id?: string | null;
  options?: string[];
  random_table_options?: { id: string; title: string }[];
  random_table?: { id: string; title: string }[];
}
export interface CharacterFieldTemplate {
  id: string;
  title: string;
  character_fields: CharacterFieldType[];
  sort: number;
}
