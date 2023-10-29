import { BlueprintInstanceType } from "./blueprintInstanceTypes";
import { FieldTypes, FieldWidthType } from "./fieldsTypes";
import { RandomTableOptionType } from "./randomTableTypes";

export interface BlueprintFieldType {
  id: string;
  sort: number;
  title: string;
  field_type: FieldTypes;
  width: FieldWidthType;
  formula?: string | null;
  random_table_id?: string | null;
  calendar_id?: string | null;
  options?: { id: string; value: string }[];
  random_table_options?: RandomTableOptionType[];
  random_table?: { id: string; title: string };
  calendar?: { id: string; title: string; days: string[]; months: { id: string; title: string; days: number }[] };
}
export interface BlueprintType {
  id: string;
  title: string;
  project_id: string;
  blueprint_instances: BlueprintInstanceType[];
  blueprint_fields: BlueprintFieldType[];
}

export type BlueprintStateType = Partial<
  Omit<BlueprintType, "blueprint_fields"> & {
    blueprint_fields: (Omit<BlueprintFieldType, "options"> & { options?: { id: string; value: string }[] })[];
  }
>;
