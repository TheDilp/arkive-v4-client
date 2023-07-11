export interface FieldTemplate {
  id: string;
  title: string;
  fields: FieldType[];
}

export type FieldTypes = "text" | "textarea" | "number" | "select" | "select_multiple";
export interface FieldType {
  id: string;
  parentId: string;
  title: string;
  fieldType: FieldTypes;
  options?: string[];
}
