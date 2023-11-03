import { BlueprintType } from "./blueprintTypes";
import { TagType } from "./tagTypes";

export interface BlueprintInstanceType {
  id: string;
  title: string;
  parent_id: string;
  blueprint: BlueprintType;
  tags: TagType[];
}
