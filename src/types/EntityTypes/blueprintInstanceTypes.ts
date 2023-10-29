import { BlueprintType } from "./blueprintTypes";
import { TagType } from "./tagTypes";

export type BlueprintInstanceValueType = {
  id: string;
  value: string | number | string[] | null | Record<string, number | string>;
  subOptionValue?: string;
}[];
export interface BlueprintInstanceType {
  id: string;
  parent_id: string;
  blueprint: BlueprintType;
  value: BlueprintInstanceValueType;
  tags: TagType[];
}
