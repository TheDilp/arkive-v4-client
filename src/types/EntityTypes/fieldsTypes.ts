export type FieldTypes = "text" | "textarea" | "number" | "select" | "select_multiple" | "dice_roll" | "random_table";
export interface FieldType {
  id: string;
  project_id: string;
  sort: number;
  title: string;
  field_type: FieldTypes;
  formula?: string;
  options?: string[];
}
export interface FieldTemplate {
  id: string;
  title: string;
  character_fields: FieldType[];
  sort: number;
}
