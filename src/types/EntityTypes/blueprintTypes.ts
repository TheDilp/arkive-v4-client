import { BlueprintInstanceType } from "./blueprintInstanceTypes";
import { BlueprintFieldTypes } from "./fieldsTypes";
import { RandomTableOptionType } from "./randomTableTypes";

export interface BlueprintFieldType {
  id: string;
  sort: number;
  title: string;
  field_type: BlueprintFieldTypes;
  // width: FieldWidthType;
  formula?: string | null;
  random_table_id?: string | null;
  blueprint_id?: string | null;
  calendar_id?: string | null;
  options?: { id: string; value: string }[];
  random_table?: { id: string; title: string; random_table_options: RandomTableOptionType[] };
  blueprint?: { id: string; title: string };
  calendar?: { id: string; title: string; days: string[]; months: { id: string; title: string; days: number }[] };
}
export interface BlueprintType {
  id: string;
  title: string;
  title_name: string;
  icon?: string;

  // title_width: FieldWidthType;
  project_id: string;
  blueprint_instances: BlueprintInstanceType[];
  blueprint_fields: BlueprintFieldType[];
}

export type BlueprintStateType = Partial<
  Omit<BlueprintType, "blueprint_fields"> & {
    blueprint_fields: (Omit<BlueprintFieldType, "options"> & { options?: { id: string; value: string }[] })[];
  }
>;

export interface BlueprintFieldValueType {
  id: string;
  value: {
    id: string;
    value: string | number | string[] | boolean | null | Record<string, number | string>;
    subOptionValue?: string;
  };
  template_id: string;
}
