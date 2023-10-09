import { BlueprintType } from "./blueprintTypes";

export interface BlueprintInstanceType {
  id: string;
  blueprint_id: string;
  blueprint: BlueprintType;
  value: { id: string; value: string | number | string[] | null | Record<string, number | string>; subOptionValue?: string };
}
