import { BlueprintFieldType, BlueprintType } from "./blueprintTypes";
import { AdditionalFieldValueType } from "./fieldsTypes";
import { TagType } from "./tagTypes";

interface BlueprintInstanceValueType {
  value: AdditionalFieldValueType;
}

interface BlueprintInstaceFieldsType extends BlueprintFieldType, BlueprintInstanceValueType {}

export interface BlueprintInstanceType {
  id: string;
  title: string;
  parent_id: string;
  blueprint: BlueprintType;
  tags: TagType[];
  blueprint_fields: BlueprintInstaceFieldsType[];
}
