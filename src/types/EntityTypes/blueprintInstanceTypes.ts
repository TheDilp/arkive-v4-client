import { BlueprintFieldType, BlueprintType } from "./blueprintTypes";
import { AdditionalFieldValueType } from "./fieldsTypes";
import { TagType } from "./tagTypes";

interface BlueprintInstaceFieldsType extends BlueprintFieldType, AdditionalFieldValueType {}

export interface BlueprintInstanceType {
  id: string;
  title: string;
  parent_id: string;
  blueprint: BlueprintType;
  tags: TagType[];
  blueprint_fields: BlueprintInstaceFieldsType[];
}
