export type FieldTypes = "text" | "textarea" | "number" | "select" | "select_multiple";
export interface FieldType {
  id: string;
  project_id: string;
  title: string;
  field_type: FieldTypes;
  options?: string[];
}
export interface FieldTemplate {
  id: string;
  title: string;
  character_fields: FieldType[];
}
